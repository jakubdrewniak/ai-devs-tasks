import { getTask, postResponse } from "./helpers";
import { QdrantClient } from "@qdrant/js-client-rest";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import axios from "axios";
import { Document } from "langchain/document";
import { v4 as uuidv4 } from "uuid";

const runTask = async () => {
  try {
    const { taskData, token } = (await getTask("search")) as {
      taskData: { msg: string; question: string };
      token: string;
    };
    console.log("task data: ", taskData);

    const COLLECTION_NAME = "search_task";
    const qdrant = new QdrantClient({ url: process.env.QDRANT_URL });
    const embeddings = new OpenAIEmbeddings({ maxConcurrency: 5 });
    const query = taskData.question;
    const queryEmbedding = await embeddings.embedQuery(query);
    const result = await qdrant.getCollections();
    const indexed = result.collections.find(
      (collection) => collection.name === COLLECTION_NAME
    );
    console.log("qdrant.getCollections()", result);

    // Create collection if not exists
    if (!indexed) {
      await qdrant.createCollection(COLLECTION_NAME, {
        vectors: { size: 1536, distance: "Cosine", on_disk: true },
      });
    }

    const collectionInfo = await qdrant.getCollection(COLLECTION_NAME);

    if (!collectionInfo.points_count) {
      const data: { title: string; url: string; info: string; date: string }[] =
        (await axios.get("https://unknow.news/archiwum_aidevs.json")).data;

      let documents = data.map(
        (content) => new Document({ pageContent: JSON.stringify(content) })
      );
      // Add metadata
      documents = documents.map((document) => {
        document.metadata.source = COLLECTION_NAME;
        document.metadata.content = document.pageContent;
        document.metadata.uuid = uuidv4();
        return document;
      });

      // Generate embeddings
      const points = [];
      for (const document of documents) {
        const [embedding] = await embeddings.embedDocuments([
          document.pageContent,
        ]);
        points.push({
          id: document.metadata.uuid,
          payload: document.metadata,
          vector: embedding,
        });
      }

        // Index
        await qdrant.upsert(COLLECTION_NAME, {
          wait: true,
          batch: {
              ids: points.map((point) => (point.id)),
              vectors: points.map((point) => (point.vector)),
              payloads: points.map((point) => (point.payload)),
          },
      })

    }

    const search = await qdrant.search(COLLECTION_NAME, {
      vector: queryEmbedding,
      limit: 1,
      filter: {
          must: [
              {
                  key: 'source',
                  match: {
                      value: COLLECTION_NAME
                  }
              }
          ]
      }
  });
  console.log("search", search);

  const reposne = JSON.parse(search?.[0]?.payload?.content as string).url


    await postResponse(
      reposne,
      token
    );
  } catch (error) {
    console.error("An error occurred:", (error as any).message);
  }
};

runTask();
