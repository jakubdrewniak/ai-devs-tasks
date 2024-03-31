import OpenAI from "openai";

const openai = new OpenAI({ apiKey: 'get key from env' });

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: `how are you?` }
    ],
    model: "gpt-4",
  });

  console.log(completion.choices[0]);
}

main();
