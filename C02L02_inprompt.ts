import axios from 'axios';
import { config } from "dotenv";
import { ChatOpenAI } from "@langchain/openai"
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const postToken = async () => {
  try {
    // Post to get the token
    const tokenResponse = await axios.post('https://tasks.aidevs.pl/token/inprompt', {
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

    const taskData = taskResponse.data as { input: string[], question: string };
    console.log('task data: ', taskData)

    config();
    const apiKey = process.env.api_key
    const chat = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: 'gpt-3.5-turbo'
    });
    const getName = await chat.invoke([
      // new SystemMessage(systemPrompt),
      new HumanMessage(`Jak brzmi imię osoby której dotyczy następujące pytanie: "${taskData.question}"?
      Nie odpowiadaj na pytanie. Podaj jedynie imię, bez żadnych dodatkowych znaków.`),
    ]);
    console.log('Name is: ', getName.content)
    const nameRelatedInput = taskData.input.filter((inp) => inp.includes(`${getName.content}`))
    console.log('nameRelatedInput', nameRelatedInput)
    const getAnswer = await chat.invoke([
      new SystemMessage(nameRelatedInput.join('. ')),
      new HumanMessage(taskData.question),
    ]);
    const answer = getAnswer.content
    console.log('Answer is:', answer)
    const answerResponse = await axios.post(`https://tasks.aidevs.pl/answer/${token}`, {
      answer
    });
    console.log('Your answer has been submitted:', answerResponse.data);

  } catch (error) {
    console.error('An error occurred:', (error as any).message);
    console.error(error)
  }
}



postToken();
