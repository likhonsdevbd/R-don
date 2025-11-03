"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const code_interpreter_1 = require("@e2b/code-interpreter");
const mistralai_1 = __importDefault(require("@mistralai/mistralai"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
if (!process.env.MISTRAL_API_KEY) {
    console.error("MISTRAL_API_KEY environment variable not set.");
    process.exit(1);
}
if (!process.env.E2B_API_KEY) {
    console.error("E2B_API_KEY environment variable not set.");
    process.exit(1);
}
const mistral = new mistralai_1.default(process.env.MISTRAL_API_KEY);
const MODEL = 'codestral-latest';
function createPlan(userRequest) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const planningPrompt = `Given the following user request, break it down into a series of logical steps that can be executed using Python code.

User Request: ${userRequest}

Create a detailed plan with 3-7 thinking steps. For each step, describe:

1. What needs to be thought through
1. What action should be taken
1. What code might be needed

Return your response in the following JSON format:
{
"goal": "brief description of the overall goal",
"steps": [
{
"step": 1,
"thought": "what to think about in this step",
"action": "what action to take"
}
]
}`;
        const response = yield mistral.chat({
            model: MODEL,
            messages: [{ role: 'user', content: planningPrompt }],
        });
        const content = ((_c = (_b = (_a = response.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) || '';
        const jsonMatch = content.match(/{[\s\S]*}/);
        if (!jsonMatch) {
            throw new Error('Failed to extract plan from response');
        }
        const planData = JSON.parse(jsonMatch[0]);
        return {
            goal: planData.goal,
            steps: planData.steps.map((s) => (Object.assign(Object.assign({}, s), { completed: false }))),
            currentStep: 0,
            maxIterations: 10,
        };
    });
}
function executeStep(sandbox, plan, conversationHistory) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const currentStep = plan.steps[plan.currentStep];
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Executing Step ${currentStep.step}: ${currentStep.thought}`);
        console.log(`${'='.repeat(60)}\n`);
        const stepPrompt = `You are working on the following goal: ${plan.goal}

Current step (${currentStep.step}/${plan.steps.length}):
Thought: ${currentStep.thought}
Action: ${currentStep.action}

Previous steps completed: ${plan.currentStep}/${plan.steps.length}

${conversationHistory.length > 0 ? `Context from previous steps:\n${conversationHistory.slice(-3).map((h) => `${h.role}: ${h.content.substring(0, 200)}...`).join('\n')}` : ''}

Generate Python code to accomplish this step. If you need to:

- Install packages, use: !pip install package_name
- Read files, use standard Python file operations
- Display results, use print() statements

Provide only the Python code, no explanations.`;
        conversationHistory.push({ role: 'user', content: stepPrompt });
        const response = yield mistral.chat({
            model: MODEL,
            messages: conversationHistory,
        });
        const assistantMessage = ((_c = (_b = (_a = response.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) || '';
        conversationHistory.push({ role: 'assistant', content: assistantMessage });
        // Extract code from response
        const codeMatch = assistantMessage.match(/`python\n([\s\S]*?)`/) ||
            assistantMessage.match(/`\n([\s\S]*?)`/);
        const code = codeMatch ? codeMatch[1].trim() : assistantMessage.trim();
        currentStep.code = code;
        console.log('Generated Code:');
        console.log(code);
        console.log('\nExecuting...\n');
        try {
            const execution = yield sandbox.notebook.execCell(code);
            const output = execution.logs.stdout.join('\n') +
                execution.logs.stderr.join('\n') +
                (execution.error ? `Error: ${execution.error.name}: ${execution.error.value}` : '');
            currentStep.result = output || 'Code executed successfully (no output)';
            console.log('Result:');
            console.log(currentStep.result);
            // Check if the step was successful
            if (execution.error) {
                console.log('\n⚠️  Error detected in execution');
                return { success: false, needsRethink: true };
            }
            currentStep.completed = true;
            return { success: true, needsRethink: false };
        }
        catch (error) {
            console.error('Execution error:', error.message);
            currentStep.result = `Execution failed: ${error.message}`;
            return { success: false, needsRethink: true };
        }
    });
}
function rethinkStep(sandbox, plan, conversationHistory, error) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        console.log('\n🤔 Rethinking the approach...\n');
        const currentStep = plan.steps[plan.currentStep];
        const rethinkPrompt = `The previous attempt failed with this result:
${error}

Original step:
Thought: ${currentStep.thought}
Action: ${currentStep.action}

Code that failed:
${currentStep.code}

Please analyze what went wrong and provide a corrected version of the code. Consider:

1. Was the approach correct?
1. Were there any syntax errors?
1. Are there missing dependencies?
1. Should the approach be changed?

Provide the corrected Python code only.`;
        conversationHistory.push({ role: 'user', content: rethinkPrompt });
        const response = yield mistral.chat({
            model: MODEL,
            messages: conversationHistory,
        });
        const assistantMessage = ((_c = (_b = (_a = response.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) || '';
        conversationHistory.push({ role: 'assistant', content: assistantMessage });
        const codeMatch = assistantMessage.match(/`python\n([\s\S]*?)`/) ||
            assistantMessage.match(/`\n([\s\S]*?)`/);
        const code = codeMatch ? codeMatch[1].trim() : assistantMessage.trim();
        currentStep.code = code;
        console.log('Revised Code:');
        console.log(code);
        console.log('\nExecuting revised code...\n');
        try {
            const execution = yield sandbox.notebook.execCell(code);
            const output = execution.logs.stdout.join('\n') +
                execution.logs.stderr.join('\n') +
                (execution.error ? `Error: ${execution.error.name}: ${execution.error.value}` : '');
            currentStep.result = output || 'Code executed successfully (no output)';
            console.log('Result:');
            console.log(currentStep.result);
            if (execution.error) {
                console.log('\n⚠️  Still encountering errors');
                return false;
            }
            currentStep.completed = true;
            return true;
        }
        catch (error) {
            console.error('Execution error:', error.message);
            return false;
        }
    });
}
function executePlanWithLoop(userRequest) {
    return __awaiter(this, void 0, void 0, function* () {
        const sandbox = yield code_interpreter_1.CodeInterpreter.create();
        console.log('Sandbox created successfully');
        try {
            // Create the plan
            console.log('\n📋 Creating execution plan...\n');
            const plan = yield createPlan(userRequest);
            console.log('Goal:', plan.goal);
            console.log('\nPlanned Steps:');
            plan.steps.forEach((step) => {
                console.log(`  ${step.step}. ${step.thought}`);
                console.log(`     Action: ${step.action}`);
            });
            const conversationHistory = [];
            let iterations = 0;
            // Execute plan with loop
            while (plan.currentStep < plan.steps.length && iterations < plan.maxIterations) {
                iterations++;
                const { success, needsRethink } = yield executeStep(sandbox, plan, conversationHistory);
                if (needsRethink) {
                    console.log('\n🔄 Attempting to fix the issue...');
                    const currentStep = plan.steps[plan.currentStep];
                    const rethinkSuccess = yield rethinkStep(sandbox, plan, conversationHistory, currentStep.result || 'Unknown error');
                    if (!rethinkSuccess) {
                        console.log(`\n❌ Failed to complete step ${currentStep.step} after retry`);
                        console.log('Moving to next step...');
                    }
                }
                // Move to next step
                plan.currentStep++;
                // Add a small delay between steps
                if (plan.currentStep < plan.steps.length) {
                    yield new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            // Summary
            console.log('\n' + '='.repeat(60));
            console.log('EXECUTION SUMMARY');
            console.log('='.repeat(60));
            console.log(`Goal: ${plan.goal}`);
            console.log(`\nCompleted Steps: ${plan.steps.filter(s => s.completed).length}/${plan.steps.length}`);
            console.log(`Total Iterations: ${iterations}`);
            plan.steps.forEach((step) => {
                const status = step.completed ? '✅' : '❌';
                console.log(`\n${status} Step ${step.step}: ${step.thought}`);
                if (step.result) {
                    console.log(`   Result: ${step.result.substring(0, 100)}${step.result.length > 100 ? '...' : ''}`);
                }
            });
        }
        finally {
            yield sandbox.close();
            console.log('\nSandbox closed');
        }
    });
}
// Example usage
const userRequest = process.argv[2] ||
    'Analyze a dataset: create random data with 1000 rows and 5 columns, calculate statistics, and create a visualization';
executePlanWithLoop(userRequest)
    .then(() => console.log('\n✅ Plan execution completed'))
    .catch((error) => console.error('\n❌ Error:', error.message));
