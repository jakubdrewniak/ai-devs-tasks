import OpenAI from "openai";
import express from "express";
import { config } from "dotenv";

import * as ngrok from "@ngrok/ngrok";

const app = express();
const port = 3034;
config();
const openai = new OpenAI({
  apiKey: process.env.api_key,
});
const ngrokAuthToken = process.env.NGROK_AUTHTOKEN;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const messages = [
  {
    role: "system",
    content:
      `Answer as consciously as possible, using the same language as user, use one or two words if possible.
      If message is not a question, but just an information, just acknowledge it and remember for further use.`,
  },
];

app.post("/", async (req, res) => {
  console.log("question: ", req.body.question);

  messages.push({ role: "user", content: req.body.question });

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: messages,
  } as any);

  console.log("Responding with: ", response.choices[0].message.content);
  const reply = response.choices[0].message.content as string;
  messages.push({ role: "assistant", content: reply });

  res.json({ reply });
});

async function main() {
  console.log("starting server");
  app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
  });

  ngrok
    .connect({ addr: 3034, authtoken: ngrokAuthToken })
    .then((listener) =>
      console.log(`Ingress established at: ${listener.url()}`)
    );
}

main();
