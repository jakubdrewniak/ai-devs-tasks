import axios from 'axios';
import { config } from "dotenv";
import { ChatOpenAI } from "@langchain/openai"
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import * as fs from 'fs'
import * as https from 'https'
import OpenAI from "openai";

const postToken = async () => {
  try {
    // Post to get the token
    const tokenResponse = await axios.post('https://tasks.aidevs.pl/token/whisper', {
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

    const taskData = taskResponse.data as { msg: string, hint: string };
    console.log('task data: ', taskData)
    const fileUrl = taskData.msg.match(/(https?:\/\/[^ ]*)/)![1];
    console.log('fileUrl', fileUrl)
    await downloadFile(fileUrl, './whisper.mp3');

    config();
    const apiKey = process.env.api_key
    const openai = new OpenAI({ apiKey });

    const transcription: {text: string} = await openai.audio.transcriptions.create({
      file: fs.createReadStream("./whisper.mp3"),
      model: "whisper-1",
    });
    console.log('transcription', transcription)
    const answer = transcription.text
    const answerResponse = await axios.post(`https://tasks.aidevs.pl/answer/${token}`, {
      answer
    });
    console.log('Your answer has been submitted:', answerResponse.data);

  } catch (error) {
    console.error('An error occurred:', (error as any).message);
    console.error(error)
  }
}

async function downloadFile(fileUrl: string, filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    https.get(fileUrl, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', async (err) => {
      // await unlink(filePath).catch(() => {}); // Try to delete the file in case of error
      reject(err);
    });
  });
}



postToken();
