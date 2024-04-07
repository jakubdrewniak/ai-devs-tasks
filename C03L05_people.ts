import { getTask, postResponse, getChatInstance } from "./helpers";
import axios from "axios";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

interface User {
  imie: string;
  nazwisko: string;
  wiek: number;
  o_mnie: string;
  ulubiona_postac_z_kapitana_bomby: string;
  ulubiony_serial: string;
  ulubiony_film: string;
  ulubiony_kolor: string;
}

const runTask = async () => {
  try {
    const { taskData, token } = (await getTask("people")) as {
      taskData: {
        msg: string;
        data: string;
        question: string;
        [key: `hint${number}`]: string;
      };
      token: string;
    };
    console.log("task data: ", taskData);
    const data: User[] = (await axios.get(taskData.data)).data;
    console.log("All users details quantity:", data.length);

    // extract name and surname
    const chat = getChatInstance();
    const getUserName = await chat.invoke([
      new SystemMessage(
        `Z podanego zdania wyciągnij imię i nazwisko osoby. Jeśli imie jest zdrobnienie, podaj pełne imię.
         Na przykład, dla zdania 'co lubi jeść Tomek Bzik?' zwróć
        {"imie":"Tomasz", "nazwisko":"Bzik"}
        Nie dodawaj zadnych komentarzy. Zwróć poprawny JSON.
        .`
      ),
      new HumanMessage(taskData.question),
    ]);
    const { imie, nazwisko } = JSON.parse(getUserName.content as any);

    console.log(imie, nazwisko);
    
    // Filter data only related to user that question refers to
    const filteredData = data.filter(
      (user) => user.imie === imie && user.nazwisko === nazwisko
    );
    console.log("Filtered users details quantity:", filteredData.length);

    // Get answer for the question
    const getAnswer = await chat.invoke([
      new SystemMessage(JSON.stringify(filteredData)),
      new HumanMessage(taskData.question),
    ]);
    const answer = getAnswer.content;
    console.log("Answer is:", answer);

    await postResponse(answer, token);
  } catch (error) {
    console.error("An error occurred:", (error as any).message);
  }
};

runTask();
