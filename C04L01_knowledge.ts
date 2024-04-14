import { getTask, postResponse, getChatInstance } from "./helpers";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import axios from "axios";

const runTask = async () => {
  try {
    const { taskData, token } = (await getTask("knowledge")) as {
      taskData: {
        msg: string;
        question: string;
        "database #1": string;
        "database #2": string;
      };
      token: string;
    };
    console.log("task data: ", taskData);

    const chat = getChatInstance();
    const getSubject = await chat.invoke([
      new SystemMessage(
        `Z podanego pytania wybierz jego temat spośród trzech opcji:
        - {"subject": "stolica", "country":"<name of country>"}
        - {"subject": "waluta", "currency": "<currency code e.g. USD, PLN>" }
        - {"subject": "populacja", "country":"<name of country>"}
        zwróć jedną z opcji. nie zmieniaj jej ani nie dodawaj żadnych komentarzy. zwróć poprawny JSON.
        Nazwa kraju powinna być w języku angielskim.`
      ),
      new HumanMessage(taskData.question),
    ]);
    const { subject, country, currency } = JSON.parse(
      getSubject.content as string
    ) as {
      subject: "stolica" | "waluta" | "populacja";
      country?: string;
      currency?: string;
    };
    console.log(subject);
    console.log(country);
    console.log(currency);

    let answer;
    if (subject === "stolica") {
      answer = (await chat.invoke([new HumanMessage(taskData.question)]))
        .content;
    } else if (subject === "populacja") {
      const countryData = (
        await axios.get(
          `https://restcountries.com/v3.1/name/${country?.toLowerCase()}`
        )
      ).data;
      answer = (
        await chat.invoke([
          new SystemMessage(JSON.stringify(countryData)),
          new HumanMessage(taskData.question + 
            ` Odpowiedz powinna być liczbą składającą się jeydnie z cyfr, bez białych znaków.`),
        ])
      ).content;
    } else if (subject === "waluta") {
      const currencyRate = (
        await axios.get(
          `http://api.nbp.pl/api/exchangerates/rates/A/${currency}/`
        )
      ).data;
      console.log('currencyRate', currencyRate)
      
        const getCurrentRate= await chat.invoke([
          new SystemMessage(JSON.stringify(currencyRate)),
          new HumanMessage(taskData.question),
        ])
      ;
      answer = getCurrentRate.content
    }

    console.log("Answer is:", answer);

    await postResponse(answer, token);
  } catch (error) {
    console.error("An error occurred:", (error as any).message);
  }
};

runTask();
