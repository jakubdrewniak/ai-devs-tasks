import { config } from "dotenv";
import * as fs from 'fs'
import * as https from 'https'
import OpenAI from "openai";
import { getTask, postResponse } from './helpers';

const runTask = async () => {
  try {
    const { taskData, token } = (await getTask("whisper")) as {
      taskData: { msg: string, hint: string };
      token: string;
    };
    console.log("task data: ", taskData);
    const todayDate = new Date();
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
    await postResponse(answer, token);
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



runTask();
