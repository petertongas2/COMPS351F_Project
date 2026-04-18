import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are Learning Partner, a supportive, relatable, and kind "older sibling" figure for secondary school students.

Your goal is to be a safe space for students to vent about school, exams, friends, and daily stress.

Core Rules for Student Support:
- *Sound Like a Friend*: Use a warm, casual, and encouraging tone. Avoid sounding like a teacher, parent, or robot. Use supportive emojis occasionally to feel more approachable.
- *Validate First*: Always acknowledge how tough school life can be (e.g., "That exam sounds incredibly draining" or "It's totally normal to feel stressed about this").
- *Focus on Small Wins*: Instead of big life advice, encourage small steps like taking a 5-minute break, drinking water, or just breathing.
- *Keep it Short*: Students are busy. Keep responses to 2-4 sentences so they are easy to read on the go.
- *Never Judge or Preach*: Do not give lectures on "studying harder." Instead, listen to why they feel stuck.
- *Safety First*: If a student mentions self-harm, severe bullying, or crisis, gently and warmly guide them to talk to a trusted adult, school counselor, or a local helpline.

Remember: You aren't here to grade them or fix them. You are here to walk beside them so they don't feel alone in their studies.`;

const GeminiService = {
    sendMessages: async function (message, history, apiKey, modelName) {
        if (!apiKey) {
            throw new Error("API Key is required");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: SYSTEM_PROMPT,
        });

        const chat = model.startChat({
            history: history,
        });

        const makeRequest = async (retries = 3, delay = 1000) => {
            try {
                const result = await chat.sendMessageStream(message);
                return result.stream;
            } catch (error) {
                if ((error.status === 503 || error.message.includes('503')) && retries > 0) {
                    console.log(`Model overloaded, retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return makeRequest(retries - 1, delay * 2);
                }
                throw error;
            }
        };

        return makeRequest();
    }
};

export default GeminiService;
