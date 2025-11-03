const MistralClient = require('@mistralai/mistralai').default;
const readlineSync = require('readline-sync');

const apiKey = process.env.CODESTRAL_API_KEY;
if (!apiKey) {
    console.error("CODESTRAL_API_KEY environment variable not set.");
    process.exit(1);
}
// Pass the base URL, the client will append the rest
const client = new MistralClient(apiKey, 'https://codestral.mistral.ai');

async function main() {
  console.log("Rüdon - Intelligent AI bot (Codestral)");
  console.log("Ask me anything, or type 'exit' to quit.");

  while (true) {
    const userInput = readlineSync.question('> ');

    if (userInput.toLowerCase() === 'exit') {
      break;
    }

    if (!userInput) {
        continue;
    }

    const chatResponse = await client.chat({
      model: 'codestral-latest',
      messages: [{role: 'user', content: userInput}],
    });

    console.log(chatResponse.choices[0].message.content);
  }
}

main();
