import { google } from '@ai-sdk/google';
import { convertToCoreMessages, streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    // Extract the `messages` from the body of the request
    const { messages } = await req.json();

    // Call the language model
    const result = await streamText({
        model: google('models/gemini-1.5-flash-latest'),
        messages: convertToCoreMessages(messages),
        maxTokens: 300,
    });

    // Respond with the stream
    return result.toAIStreamResponse();
}