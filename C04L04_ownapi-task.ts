import axios from "axios";
import { getTask, postResponse, getChatInstance } from "./helpers";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const runTask = async () => {
  try {
    const { taskData, token } = (await getTask("ownapi")) as any;
    console.log(taskData);

    await postResponse("https://2b4b-46-205-203-217.ngrok-free.app", token);
  } catch (error) {
    console.error("An error occurred:", (error as any).message);
  }
};

runTask();
