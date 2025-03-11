import { getTask, postResponse } from "./helpers";
import { config } from "dotenv";
import axios from "axios";

const runTask = async () => {
  try {
    const { taskData, token } = (await getTask("meme")) as {
      taskData: {
        image: string;
        text: string;
      };
      token: string;
    };
    console.log("task data: ", taskData);

    config();
    const rednerKey = process.env["X-API-KEY"];

    const rend: any = await axios.post(
      `https://get.renderform.io/api/v2/render`,
      {
        template: "funny-mammoths-sail-tightly-1369",
        data: {
          "TEXT.text": taskData.text,
          "IMAGE.src": taskData.image,
        },
      },
      {
        headers: { "x-api-key": rednerKey },
      }
    );
    console.log("rend, ", rend.data);

    await postResponse(rend.data.href, token);
  } catch (error) {
    console.error("An error occurred:", (error as any).message);
  }
};

runTask();
