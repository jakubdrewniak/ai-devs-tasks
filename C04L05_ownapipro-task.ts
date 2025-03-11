import { getTask, postResponse } from "./helpers";

const runTask = async () => {
  try {
    const { taskData, token } = (await getTask("ownapipro")) as any;
    console.log(taskData);

    await postResponse("https://de0f-46-205-203-217.ngrok-free.app", token);
  } catch (error) {
    console.error("An error occurred:", (error as any).message);
  }
};

runTask();
