# AI Agent from Scratch (Google Gemini Edition)

This project implements an AI agent using Google Gemini AI instead of OpenAI.

## Setup Instructions

This repo requires **Node.js version 20+** or **bun v1.0.20**.

You will need an [API Key from Google AI Studio](https://aistudio.google.com/app/apikey).

To install dependencies:

```bash
bun install
```

## Google Gemini API Key

Create an [API Key from Google AI Studio](https://aistudio.google.com/app/apikey) and save it in a `.env` file:

```
GEMINI_API_KEY='YOUR_API_KEY'
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.0.20. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
