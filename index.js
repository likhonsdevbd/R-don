const { generateText } = require('ai');
const { huggingface } = require('@ai-sdk/huggingface');
const readlineSync = require('readline-sync');

const model = huggingface('deepseek-ai/DeepSeek-V3-0324');

async function main() {
  console.log("Rüdon - Intelligent AI bot");
  console.log("Ask me anything, or type 'exit' to quit.");

  while (true) {
    const userInput = readlineSync.question('> ');

    if (userInput.toLowerCase() === 'exit') {
      break;
    }

    if (!userInput) {
      continue;
    }

    const { text } = await generateText({
      model,
      prompt: userInput,
    });

    console.log(text);
  }
}

main();
