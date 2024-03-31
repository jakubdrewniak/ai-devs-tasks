const axios = require('axios');
const prompt = require('prompt-sync')({ sigint: true });

const postToken = async () => {
  try {
    // Post to get the token
    const tokenResponse = await axios.post('https://tasks.aidevs.pl/token/helloapi', {
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

    const taskData = taskResponse.data;

    // Use prompt to get user input
    console.log('Please answer the following question:');
    const userAnswer = prompt(JSON.stringify(taskData) + '\n');

    // Send the user's answer back
    const answerResponse = await axios.post(`https://tasks.aidevs.pl/answer/${token}`, {
      answer: userAnswer
    });

    console.log('Your answer has been submitted:', answerResponse.data);
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
};

postToken();
