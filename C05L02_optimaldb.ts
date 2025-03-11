
import { getTask, postResponse, getChatInstance } from "./helpers";
import fetch from 'node-fetch';
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

type DB = Record<string, string[]>;

const optimizeDatabase = async (database: DB): Promise<string> => {
  const chat = getChatInstance("gpt-4o");
  const getAnswer = await chat.invoke([
    new SystemMessage(`Zadanie polega na optymalizacji bazy danych tak, aby zmieściła się w 9KB, zachowując wszystkie niezbędne informacje. Baza danych to JSON z informacjami o trzech osobach. Zweryfikuj, czy zawiera wszystkie wymagane pola i zoptymalizuj ją, zachowując kontekst.`),
    new HumanMessage(JSON.stringify(database)),
  ]);
  
  return getAnswer.content as string;
};

const verifyAndEnhance = async (original: DB, optimized: string): Promise<string> => {
  const chat = getChatInstance("gpt-4o");
  const getAnswer = await chat.invoke([
    new SystemMessage(`Porównaj oryginalną bazę danych z zoptymalizowaną wersją. Sprawdź, czy wszystkie niezbędne informacje są zawarte w wersji zoptymalizowanej- na podstawie każdej informacji odpytaj zoptymalizowaną bazę o tę informację. Jeśli czegoś brakuje, uzupełnij bazę. Upewnij się, że kompletny wynik nie przekracza 9KB.`),
    new HumanMessage(`Oryginalna baza: ${JSON.stringify(original)}. Zoptymalizowana baza: ${optimized}`),
  ]);
  
  return getAnswer.content as string;
};

const runTask = async () => {
  try {
    const { taskData, token } = (await getTask("optimaldb")) as {
      taskData: {
        msg: string;
        database: string;
        hint: string;
      };
      token: string;
    };
    console.log("task data: ", taskData);

    const response = await fetch(taskData.database);
    const database: DB = await response.json();

    const optimizedDb = await optimizeDatabase(database);

    const finalDb = await verifyAndEnhance(database, optimizedDb);

    await postResponse(finalDb, token);
  } catch (error) {
    console.error("An error occurred:", (error as any).message);
  }
};

runTask();