import { getTask, postResponse, getChatInstance } from "./helpers";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const runTask = async () => {
  try {
    const { taskData, token } = (await getTask("gnome")) as {
      taskData: {
        msg: string;
        hint: string;
        url: string;
      };
      token: string;
    };
    console.log("task data: ", taskData);

    const image = await urlToBase64DataURL(taskData.url)
    console.log('image created')

    const chat = getChatInstance("gpt-4o-mini");
    const getAnswer = await chat.invoke([
      new SystemMessage(
        `I will give you a drawing of a gnome with a hat on his head.
        Tell me what is the color of the hat in POLISH.
        If any errors occur, return "ERROR" as answer.`
      ),
      new HumanMessage({
        content: [{ type: "image_url", image_url: { url: image } }],
      }),
    ]);
    const answer = getAnswer.content;
    console.log("Answer is:",answer);

    await postResponse(answer, token);
  } catch (error) {
    console.error("An error occurred:", (error as any).message);
  }
};

async function urlToBase64DataURL(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
      throw new Error(`Failed to fetch image from URL: ${response.statusText}`);
  }

  const contentType = response.headers.get('Content-Type');
  if (!contentType || !contentType.startsWith('image/')) {
      throw new Error('Fetched content is not an image');
  }

  const arrayBuffer = await response.arrayBuffer();
  const base64 = bufferToBase64(arrayBuffer);

  return `data:${contentType};base64,${base64}`;
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

runTask();
