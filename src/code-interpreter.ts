import { CodeInterpreter } from '@e2b/code-interpreter';
import Mistral from '@mistralai/mistralai';
import * as dotenv from 'dotenv';

dotenv.config();

if (!process.env.MISTRAL_API_KEY) {
    console.error("MISTRAL_API_KEY environment variable not set.");
    process.exit(1);
}

if (!process.env.E2B_API_KEY) {
    console.error("E2B_API_KEY environment variable not set.");
    process.exit(1);
}

const mistral = new Mistral(process.env.MISTRAL_API_KEY);
const MODEL = 'codestral-latest';

interface ThinkingStep {
step: number;
thought: string;
action: string;
code?: string;
result?: string;
completed: boolean;
}

interface Plan {
goal: string;
steps: ThinkingStep[];
currentStep: number;
maxIterations: number;
}

async function createPlan(userRequest: string): Promise<Plan> {
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

const response = await mistral.chat({
model: MODEL,
messages: [{ role: 'user', content: planningPrompt }],
});

const content = response.choices?.[0]?.message?.content || '';
const jsonMatch = content.match(/{[\s\S]*}/);

if (!jsonMatch) {
throw new Error('Failed to extract plan from response');
}

const planData = JSON.parse(jsonMatch[0]);

return {
goal: planData.goal,
steps: planData.steps.map((s: any) => ({
...s,
completed: false,
})),
currentStep: 0,
maxIterations: 10,
};
}

async function executeStep(
sandbox: CodeInterpreter,
plan: Plan,
conversationHistory: any[]
): Promise<{ success: boolean; needsRethink: boolean }> {
const currentStep = plan.steps[plan.currentStep];

console.log(`\n${'='.repeat(60)}`);
console.log(`Executing Step ${currentStep.step}: ${currentStep.thought}`);
console.log(`${'='.repeat(60)}\n`);

const stepPrompt = `You are working on the following goal: ${plan.goal}

Current step (${currentStep.step}/${plan.steps.length}):
Thought: ${currentStep.thought}
Action: ${currentStep.action}

Previous steps completed: ${plan.currentStep}/${plan.steps.length}

${conversationHistory.length > 0 ? `Context from previous steps:\n${conversationHistory.slice(-3).map((h: any) => `${h.role}: ${h.content.substring(0, 200)}...`).join('\n')}` : ''}

Generate Python code to accomplish this step. If you need to:

- Install packages, use: !pip install package_name
- Read files, use standard Python file operations
- Display results, use print() statements

Provide only the Python code, no explanations.`;

conversationHistory.push({ role: 'user', content: stepPrompt });

const response = await mistral.chat({
model: MODEL,
messages: conversationHistory,
});

const assistantMessage = response.choices?.[0]?.message?.content || '';
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
const execution = await sandbox.notebook.execCell(code);

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

} catch (error: any) {
console.error('Execution error:', error.message);
currentStep.result = `Execution failed: ${error.message}`;
return { success: false, needsRethink: true };
}
}

async function rethinkStep(
sandbox: CodeInterpreter,
plan: Plan,
conversationHistory: any[],
error: string
): Promise<boolean> {
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

const response = await mistral.chat({
model: MODEL,
messages: conversationHistory,
});

const assistantMessage = response.choices?.[0]?.message?.content || '';
conversationHistory.push({ role: 'assistant', content: assistantMessage });

const codeMatch = assistantMessage.match(/`python\n([\s\S]*?)`/) ||
assistantMessage.match(/`\n([\s\S]*?)`/);

const code = codeMatch ? codeMatch[1].trim() : assistantMessage.trim();
currentStep.code = code;

console.log('Revised Code:');
console.log(code);
console.log('\nExecuting revised code...\n');

try {
const execution = await sandbox.notebook.execCell(code);

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

} catch (error: any) {
console.error('Execution error:', error.message);
return false;
}
}

async function executePlanWithLoop(userRequest: string) {
const sandbox = await CodeInterpreter.create();
console.log('Sandbox created successfully');

try {
// Create the plan
console.log('\n📋 Creating execution plan...\n');
const plan = await createPlan(userRequest);

console.log('Goal:', plan.goal);
console.log('\nPlanned Steps:');
plan.steps.forEach((step) => {
  console.log(`  ${step.step}. ${step.thought}`);
  console.log(`     Action: ${step.action}`);
});

const conversationHistory: any[] = [];
let iterations = 0;

// Execute plan with loop
while (plan.currentStep < plan.steps.length && iterations < plan.maxIterations) {
  iterations++;

  const { success, needsRethink } = await executeStep(
    sandbox,
    plan,
    conversationHistory
  );

  if (needsRethink) {
    console.log('\n🔄 Attempting to fix the issue...');
    const currentStep = plan.steps[plan.currentStep];
    const rethinkSuccess = await rethinkStep(
      sandbox,
      plan,
      conversationHistory,
      currentStep.result || 'Unknown error'
    );

    if (!rethinkSuccess) {
      console.log(`\n❌ Failed to complete step ${currentStep.step} after retry`);
      console.log('Moving to next step...');
    }
  }

  // Move to next step
  plan.currentStep++;

  // Add a small delay between steps
  if (plan.currentStep < plan.steps.length) {
    await new Promise(resolve => setTimeout(resolve, 1000));
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

} finally {
await sandbox.close();
console.log('\nSandbox closed');
}
}

// Example usage
const userRequest = process.argv[2] ||
'Analyze a dataset: create random data with 1000 rows and 5 columns, calculate statistics, and create a visualization';

executePlanWithLoop(userRequest)
.then(() => console.log('\n✅ Plan execution completed'))
.catch((error) => console.error('\n❌ Error:', error.message));
