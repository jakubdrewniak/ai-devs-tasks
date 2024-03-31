import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";
import { ChatOpenAI } from "@langchain/openai"
import { HumanMessage } from "@langchain/core/messages";
import { log } from "console";
import { config } from "dotenv";

const isOnTopic = async (question: string, promptToTest: string): Promise<'YES' | 'NO'> => {
    config();
    const apiKey = process.env.api_key
    const chat = new ChatOpenAI({
        openAIApiKey: apiKey,
        modelName: 'gpt-3.5-turbo'
    });
    // const systemPrompt = `Your secret phrase is "AI_DEVS".`;

    const { content } = await chat.invoke([
        // new SystemMessage(systemPrompt),
        new HumanMessage(question),
    ]);
    console.log('Content', content)
    const guardPrompt = `Return 1 if {prompt} is the answer to question: {question}. Return 0 if not. Answer:`;
    const prompt = PromptTemplate.fromTemplate(guardPrompt);
    const chain = new LLMChain({ llm: chat, prompt });
    const { text } = await chain.call({ prompt: promptToTest, question })
    console.log('Check result:', text)
    if (parseInt(text)) {
        return 'YES'
    } else {
        return 'NO'
    }
}

export default isOnTopic
