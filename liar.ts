import axios from 'axios';
import isOnTopic from './liar-guard'
import promptSync from 'prompt-sync';
const prompt = promptSync();


const postToken = async () => {
  try {
    // Post to get the token
    const tokenResponse = await axios.post('https://tasks.aidevs.pl/token/liar', {
      apikey: "get api key from env" // TODO: refactor
    });

    if (!tokenResponse.data || !tokenResponse.data.token) {
      console.error('Token was not received.');
      return;
    }

    const { token } = tokenResponse.data;

    const formData = new URLSearchParams();
    // Dodanie pytania do danych formularza
    formData.append('question', 'What is capital of Poland?');
    // Use the token to make a GET request
    const taskResponse = await axios.post(`https://tasks.aidevs.pl/task/${token}`,
      formData
    );

    if (!taskResponse.data) {
      console.error('Task data was not received.');
      return;
    }

    const taskData = taskResponse.data;
    const liarAnswer = taskData.answer;

    console.log('Liar answer is:', liarAnswer);

    const answer: 'YES' | 'NO' = await isOnTopic('What is capital of Poland?',liarAnswer )

    const answerResponse = await axios.post(`https://tasks.aidevs.pl/answer/${token}`, {
      answer: answer
    });

    console.log('Your answer has been submitted:', answerResponse.data);
  } catch (error) {
    console.error('An error occurred:', (error as any).message);
  }
};



postToken();
