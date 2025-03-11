import { getTask, postResponse, getChatInstance } from "./helpers";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const runTask = async () => {
  try {
    const { taskData, token } = (await getTask("md2html")) as {
      taskData: {
        msg: string;
        hint: string;
        input: string;
      };
      token: string;
    };
    console.log("task data: ", taskData);

    const fineTunedModel = "ft:gpt-3.5-turbo-0125:personal::B0wdGlw5";
    const chat = getChatInstance(fineTunedModel);
    const getAnswer = await chat.invoke([
      new SystemMessage(taskData.msg),
      new HumanMessage(taskData.input),
    ]);

    const answer = getAnswer.content;
    console.log("Answer is:", answer);

    await postResponse(answer, token);
  } catch (error) {
    console.error("An error occurred:", (error as any).message);
  }
};

runTask();
