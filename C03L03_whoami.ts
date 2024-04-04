import { getTask, postResponse, getChatInstance } from "./helpers";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const runTask = async () => {
  try {
    let taskToken = "";

    const chat = getChatInstance("gpt-4");
    const conversation = [
      new SystemMessage(
        `Your task is to guess a person based on provided hints. Answer only if you are 100% sure.
      If you don't know or have doubts, just answer 'NO' without any additional comments.`
      ),
    ];
    let answer = null;
    let iterations = 0;
    while (!answer && iterations <= 10) {
      const { taskData, token } = (await getTask("whoami")) as {
        taskData: { msg: string; hint: string };
        token: string;
      };
      console.log("hint: ", taskData.hint);
      conversation.push(new HumanMessage(taskData.hint));
      const getAnswer = await chat.invoke(conversation);
      console.log("Answer is: ", getAnswer.content);

      if (getAnswer.content !== "NO") {
        answer = getAnswer.content;
        taskToken = token;
      } else {
        iterations++;
      }
    }

    await postResponse(answer, taskToken);
  } catch (error) {
    console.error("An error occurred:", (error as any).message);
  }
};

runTask();
