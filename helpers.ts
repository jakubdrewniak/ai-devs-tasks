import axios from "axios";
import { config } from "dotenv";
import * as fs from "fs";
import * as https from "https";
import { ChatOpenAI } from "@langchain/openai";

const getTask = async (
  taskName: string
): Promise<{ taskData: unknown; token: string } | null> => {
  try {
    config();
    const aidevsApiKey = process.env.aidevs_api_key;
    // Post to get the token
    const tokenResponse = await axios.post(
      `https://tasks.aidevs.pl/token/${taskName}`,
      {
        apikey: aidevsApiKey,
      }
    );

    if (!tokenResponse.data || !tokenResponse.data.token) {
      console.error("Token was not received.");
      return null;
    }

    const { token } = tokenResponse.data;
    // Use the token to make a GET request
    const taskResponse = await axios.get(
      `https://tasks.aidevs.pl/task/${token}`
    );

    if (!taskResponse.data) {
      console.error("Task data was not received.");
      return null;
    }
    return { taskData: taskResponse.data, token };
  } catch (error) {
    console.error("An error occurred:", (error as any).message);
    return null;
  }
};

const postResponse = async (data: unknown, token: string): Promise<void> => {
  try {
    const answerResponse = await axios.post(
      `https://tasks.aidevs.pl/answer/${token}`,
      {
        answer: data,
      }
    );
    console.log("Your answer has been submitted:", answerResponse.data);
  } catch (error) {
    console.error("An error occurred:", (error as any).message);
  }
};

async function downloadFile(
  fileUrl: string,
  filePath: string,
  options: https.RequestOptions = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    https
      .get(fileUrl, options, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
      })
      .on("error", async (err) => {
        // await unlink(filePath).catch(() => {}); // Try to delete the file in case of error
        reject(err);
      });
  });
}

function getChatInstance(modelName = "gpt-3.5-turbo"): ChatOpenAI {
  config();
  const apiKey = process.env.api_key;
  return new ChatOpenAI({
    openAIApiKey: apiKey,
    modelName,
  });
}

export { getTask, postResponse, downloadFile, getChatInstance };
