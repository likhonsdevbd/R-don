# Agent Instructions for rudon-chatbot

## 📖 Project Overview

**Purpose**: A simple, intelligent AI bot that answers questions and chats naturally, with support for different AI models.
**Type**: CLI tool
**Primary Language(s)**: JavaScript (Node.js)
**Framework(s)**: None
**Architecture**: The project consists of two separate entry points, `index.js` and `index-codestral.js`, each interacting with a different AI model. It uses `readline-sync` for command-line input.

## 📁 Directory Structure

The project has a flat directory structure:
```
.
├── .gitignore
├── README.md
├── index-codestral.js  # Entry point for the Codestral model
├── index.js            # Entry point for the Hugging Face model
├── package-lock.json
└── package.json
```

## 🚀 Development Setup

### Installation
```bash
# Clone repository
git clone [repo-url]
cd rudon-chatbot

# Install dependencies
npm install
```

### Run Locally

There are two ways to run the bot, depending on the desired AI model:

**Using Hugging Face model (DeepSeek-V3-0324):**
```bash
npm start
```

**Using Codestral model:**
This requires a `CODESTRAL_API_KEY` environment variable.

```bash
# On Linux/macOS
export CODESTRAL_API_KEY='your-api-key'
npm run start:codestral

# On Windows
set CODESTRAL_API_KEY='your-api-key'
npm run start:codestral
```
Alternatively, you can create a `.env` file and use a package like `dotenv` to manage environment variables.

### Run Tests

There are no automated tests in this project.

## 🎨 Code Style & Conventions

- **Formatting**: The project does not have a defined code style or linter.
- **Naming conventions**: Variables are in `camelCase`, and file names are in `kebab-case`.
- **File organization**: Each entry point is in its own file.
- **Comments**: The code is not heavily commented, but it is straightforward.

## 🏗️ Important Patterns & Conventions

### Error Handling
The application has minimal error handling. If an API call to the AI model fails, the application will likely crash.

### Logging
The application uses `console.log` for all output. There is no structured logging framework in place.

## 🔒 Security Considerations

### Sensitive Files (Never Commit)

- `.env` - Environment variables (if you choose to use `dotenv`)
- `.env.local` - Local overrides

### Environment Variables

The `index-codestral.js` script requires the `CODESTRAL_API_KEY` environment variable:

```bash
# Required for index-codestral.js
CODESTRAL_API_KEY=your-api-key
```

### Secret Management

- Never hardcode API keys in the source code.
- Use environment variables for all secrets.

## ✅ Common Tasks

### Chatting with the bot

1.  Run the desired script (`npm start` or `npm run start:codestral`).
2.  Type your question and press Enter.
3.  Type `exit` to quit the application.

### Changing the AI model

- To use a different Hugging Face model, modify the model identifier in `index.js`.
- To use a different Mistral model, modify the model identifier in `index-codestral.js`.

## 📤 Git & Commit Conventions

No formal Git or commit conventions are currently enforced in this project. It is recommended to follow standard practices.

### Branch Naming
- Feature: `feature/user-authentication`
- Bug fix: `fix/login-error`

### Commit Messages
Follow Conventional Commits:
```
feat(auth): add password reset functionality
fix(api): resolve race condition in user creation
```

## 🚢 Deployment

This is a command-line application and is not intended for deployment. It is run locally.

## ⚠️ Gotchas & Special Notes

- The `index.js` script uses the `@ai-sdk/huggingface` package, which may have its own dependencies and authentication requirements.
- The `index-codestral.js` script requires a `CODESTRAL_API_KEY` to be set.
- There is no error handling for API calls. If an API call fails, the application will crash.

## 📚 External Resources

- **`@ai-sdk/huggingface`**: [https://www.npmjs.com/package/@ai-sdk/huggingface](https://www.npmjs.com/package/@ai-sdk/huggingface)
- **`@mistralai/mistralai`**: [https://www.npmjs.com/package/@mistralai/mistralai](https://www.npmjs.com/package/@mistralai/mistralai)
- **`readline-sync`**: [https://www.npmjs.com/package/readline-sync](https://www.npmjs.com/package/readline-sync)

## ❓ Questions or Issues?

- **Bugs**: Create an issue in the GitHub repository.
- **Feature requests**: Create an issue in the GitHub repository.
