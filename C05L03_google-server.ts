import OpenAI from "openai";
import express from "express";
import { config } from "dotenv";
import { getJson } from "serpapi";
import { getTask, postResponse } from "./helpers";

import * as ngrok from "@ngrok/ngrok";

const app = express();
const port = 3034;
config();
const openai = new OpenAI({
  apiKey: process.env.api_key,
});
const ngrokAuthToken = process.env.NGROK_AUTHTOKEN;
const serpApiKey = process.env.SERPAPI_KEY;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const messages = [
  {
    role: "system",
    content: `Answer as consciously as possible, using the same language as user, use one or two words if possible.
      If message is not a question, but just an information, just acknowledge it and remember for further use.`,
  },
];

app.post("/", async (req, res) => {
  console.log("question: ", req.body.question);

  messages.push({ role: "user", content: req.body.question });

  const serpResp = await getJson({
    engine: "google",
    api_key: serpApiKey,
    q: req.body.question,
  });
  const reply = serpResp["organic_results"][0].link;
  console.log("reply", reply);
  messages.push({ role: "assistant", content: reply as any });

  res.json({ reply });
});

async function main() {
  const { taskData, token } = (await getTask("google")) as {
    taskData: {
      msg: string;
      hint1: string;
    };
    token: string;
  };
  console.log("task data: ", taskData);

  console.log("starting server");
  app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
  });

  ngrok.connect({ addr: 3034, authtoken: ngrokAuthToken }).then((listener) => {
    postResponse(listener.url(), token);
    console.log(`Ingress established at: ${listener.url()}`);
  });
}

main();
