import { getTask, postResponse, downloadFile, getChatInstance } from "./helpers";
import { readFile } from "fs/promises";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const runTask = async () => {
  try {
    const { taskData, token } = (await getTask("scraper")) as {
      taskData: { msg: string; input: string; question: string };
      token: string;
    };
    console.log("task data: ", taskData);
    
    // download file from task data
    const path = "./article.txt";
    await downloadFile(taskData.input, path, {
      headers: {
        // provide User-Agent to avoid anti-bot protection
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
      },
    });

    const content = await readFile(path, { encoding: "utf8" });
    console.log("content of file:", content);

    const chat = getChatInstance()
    const getAnswer = await chat.invoke([
      // provide article as context for System
      new SystemMessage(content),
      // answer question
      new HumanMessage(
        `Odpowiedz możliwie krótko na pytanie: ${taskData.question}`
      ),
    ]);
    console.log("Answer is: ", getAnswer.content);

    await postResponse(getAnswer.content, token);
  } catch (error) {
    console.error("An error occurred:", (error as any).message);
  }
};

runTask();
