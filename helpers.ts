import axios from "axios";
import { config } from "dotenv";

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

export { getTask, postResponse };
