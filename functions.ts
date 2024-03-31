import axios from 'axios';
import { config } from "dotenv";

const postToken = async () => {
  try {
    config();
    const aidevsApiKey = process.env.aidevs_api_key
    // Post to get the token
    const tokenResponse = await axios.post('https://tasks.aidevs.pl/token/functions', {
      apikey: aidevsApiKey
    });

    if (!tokenResponse.data || !tokenResponse.data.token) {
      console.error('Token was not received.');
      return;
    }

    const { token } = tokenResponse.data;
    // Use the token to make a GET request
    const taskResponse = await axios.get(`https://tasks.aidevs.pl/task/${token}`);

    if (!taskResponse.data) {
      console.error('Task data was not received.');
      return;
    }

    const taskData = taskResponse.data as { msg: string, hint1: string };
    console.log('task data: ', taskData)

    const funSchema = {
      "name": "addUser",
      "description": "add user to database",
      "parameters": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "description": "provide name of user"
          },
          "surname": {
            "type": "string",
            "description": "provide surnname of user"
          },
          "year": {
            "type": "number",
            "description": "provide user year of birth"
          }
        }
      }
    }

    const answerResponse = await axios.post(`https://tasks.aidevs.pl/answer/${token}`, {
      answer: funSchema
    });
    console.log('Your answer has been submitted:', answerResponse.data);

  } catch (error) {
    console.error('An error occurred:', (error as any).message);
    console.error(error)
  }
}

postToken();
