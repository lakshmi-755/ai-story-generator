
/* POWERFUL LLAMA 3 WRITER - PASTE INTO index.mjs */
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: "us-east-1" });

export const handler = async (event) => {
    const responseHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Content-Type": "application/json"
    };

    if (event.requestContext?.http?.method === "OPTIONS" || event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers: responseHeaders, body: "" };
    }

    try {
        const bodyText = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString() : event.body;
        const data = JSON.parse(bodyText || "{}");



        // 1. Precise Dynamic parameters
        let maxGenLen = 600;
        let detailLevel = "a short, magical children's story";

        if (data.storyLength === "Medium Story") {
            maxGenLen = 1200;
            detailLevel = "a detailed narrative with rich world-building across 6-8 paragraphs. It MUST have a clear ending.";
        } else if (data.storyLength === "Long Story") {
            maxGenLen = 2048;
            detailLevel = "an extensive adventure epic. You MUST include character dialogue and atmospheric descriptions. It MUST have a clear, final ending. DO NOT INCLUDE CHOICES OR OPTIONS.";
        }

        // 2. Authoritative Llama 3 Prompt (System + User style)
        const promptText = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>

You are a professional children's book author. You write immersive, magical stories with a clear beginning, middle, and a definitive ending.
You MUST conclude the story naturally. NEVER leave the story open-ended.
NEVER include choices, options, or interactive decisions.
Include a moral or lesson at the end.
You respond ONLY with a raw JSON object. Do not include any explanation, code, or conversational filler.<|eot_id|><|start_header_id|>user<|end_header_id|>

Write ${detailLevel} for ${data.ageGroup || 'kids'}. 
Genre: ${data.genre || 'Adventure'}. 
Topic: ${data.userPrompt || 'a secret journey'}. 

Rules:
1. Return strictly JSON: {"title": "Story Title", "body": "Full story text content..."}
2. Use \\n for paragraph breaks inside the "body" string.
3. Keep the tone playful and safe for children.<|eot_id|><|start_header_id|>assistant<|end_header_id|>

{`; // Force Llama to start with a brace

        const command = new InvokeModelCommand({
            modelId: "meta.llama3-8b-instruct-v1:0",
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify({
                prompt: promptText,
                max_gen_len: maxGenLen,
                temperature: 0.75,
                top_p: 0.9
            })
        });

        const bedrockResponse = await client.send(command);
        const result = JSON.parse(new TextDecoder().decode(bedrockResponse.body));
        const outputText = result.generation || "";
        // 3. Durable JSON Extraction
        let finalStory;
        const jsonMatch = outputText.match(/\\{.*\\}/s);

        if (jsonMatch) {
            try {
                finalStory = JSON.parse(jsonMatch[0]);
            } catch (e) {
                // Fallback if parsing fails - strip any leading/trailing garbage
                const cleaned = jsonMatch[0].replace(/^[^{]*/, '').replace(/[^}]*$/, '');
                try {
                    finalStory = JSON.parse(cleaned);
                } catch (innerE) {
                    finalStory = { title: "A Magical Adventure", body: outputText };
                }
            }
        } else {
            finalStory = { title: "A New Tale", body: outputText };
        }

        return {
            statusCode: 200,
            headers: responseHeaders,
            body: JSON.stringify(finalStory)
        };

    } catch (err) {
        console.error("LOG ERROR:", err);
        return {
            statusCode: 500,
            headers: responseHeaders,
            body: JSON.stringify({ title: "Oops!", body: `Service Error: ${err.message}` })
        };
    }
};
