import { getTask, postResponse, getChatInstance } from "./helpers";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const runTask = async () => {
  try {
    const { taskData, token } = (await getTask("inprompt")) as {
      taskData: { input: string[]; question: string };
      token: string;
    };
    console.log("task data: ", taskData);

    const chat = getChatInstance("gpt-3.5-turbo");
    const getName = await chat.invoke([
      new HumanMessage(`Jak brzmi imię osoby której dotyczy następujące pytanie: "${taskData.question}"?
      Nie odpowiadaj na pytanie. Podaj jedynie imię, bez żadnych dodatkowych znaków.`),
    ]);
    console.log("Name is: ", getName.content);

    const nameRelatedInput = taskData.input.filter((inp) =>
      inp.includes(`${getName.content}`)
    );
    console.log("nameRelatedInput", nameRelatedInput);

    const getAnswer = await chat.invoke([
      new SystemMessage(nameRelatedInput.join(". ")),
      new HumanMessage(taskData.question),
    ]);
    const answer = getAnswer.content;
    console.log("Answer is:", answer);

    await postResponse(answer, token);
  } catch (error) {
    console.error("An error occurred:", (error as any).message);
  }
};

runTask();
