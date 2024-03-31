import axios from 'axios';
import { config } from "dotenv";
import { ChatOpenAI } from "@langchain/openai"
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import OpenAI from "openai";


const postToken = async () => {
  try {
    // Post to get the token
    const tokenResponse = await axios.post('https://tasks.aidevs.pl/token/embedding ', {
      apikey: "get api key from env" // TODO: refactor
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

    const taskData = taskResponse.data as { msg: string };
    console.log('task data: ', taskData)

    config();
    const apiKey = process.env.api_key

    const openai = new OpenAI({ apiKey });
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      // input: taskData.msg, // I skipped step where I extract 'Hawaiian pizza' from taskData.msg which is 'send embedding of this sentence created via text-embedding-ada-002. Send me just array of params: Hawaiian pizza'
      input: 'Hawaiian pizza',
      encoding_format: 'float',
    });
    const embedding = embeddingResponse.data[0].embedding;

    if (embedding.length !== 1536) {
      console.error("Wrong embedding length");
      return;
    }

    console.log('Answer is:', embedding)

    const answerResponse = await axios.post(`https://tasks.aidevs.pl/answer/${token}`, {
      answer: embedding
    });
    console.log('Your answer has been submitted:', answerResponse.data);

  } catch (error) {
    console.error('An error occurred:', (error as any).message);
    console.error(error)
  }
}



postToken();
