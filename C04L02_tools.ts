import { getTask, postResponse, getChatInstance } from "./helpers";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const runTask = async () => {
  try {
    const { taskData, token } = (await getTask("tools")) as {
      taskData: {
        msg: string;
        hint: string;
        question: string;
        "example for ToDo": string;
        "example for Calendar": string;
      };
      token: string;
    };
    console.log("task data: ", taskData);
    const todayDate = new Date();

    const chat = getChatInstance("gpt-4");
    const getAnswer = await chat.invoke([
      new SystemMessage(
        `${taskData.msg}. Provide proper JSON with no additional comments.
        Example for ToDo: ${taskData['example for ToDo']};
        Example for Calendar: ${taskData['example for Calendar']};
        ${taskData.hint}. Today date is ${todayDate.toISOString()}
        `
      ),
      new HumanMessage(taskData.question),
    ]);
    
    const answer = JSON.parse(getAnswer.content as string)
    console.log("Answer is:", answer);

    await postResponse(answer, token);
  } catch (error) {
    console.error("An error occurred:", (error as any).message);
  }
};

runTask();
