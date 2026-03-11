import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: "us-east-1" });

/**
 * Extracts key visual scenes from a story for image generation.
 * 
 * @param {Object} event
 * @param {string} event.storyText - The full text of the story.
 * @param {string} event.storyLength - "short", "medium", or "long".
 */
export const handler = async (event) => {
    const responseHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Content-Type": "application/json"
    };

    // Handle OPTIONS request for CORS
    if (event.requestContext?.http?.method === "OPTIONS" || event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers: responseHeaders, body: "" };
    }

    try {
        const bodyText = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString() : event.body;
        const data = JSON.parse(bodyText || "{}");

        const storyText = data.storyText;
        const storyLength = data.storyLength?.toLowerCase() || "short";

        if (!storyText) {
            return {
                statusCode: 400,
                headers: responseHeaders,
                body: JSON.stringify({ error: "storyText is required" })
            };
        }

        // Determine number of scenes based on length
        let sceneCount = 2;
        if (storyLength === "medium") sceneCount = 3;
        if (storyLength === "long") sceneCount = 4;

        // Prompt for visual scene extraction
        const promptText = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>

You are a visual storyteller and AI image prompt engineer. Your task is to extract key visual moments from a story.
Return ONLY a raw JSON array of strings. Each string is a single-sentence image generation prompt.
Rules:
1. Extract exactly ${sceneCount} scenes.
2. Each scene must be a short description of an important visual moment.
3. Each scene MUST be exactly one sentence.
4. Return ONLY the JSON array: ["scene 1...", "scene 2..."]<|eot_id|><|start_header_id|>user<|end_header_id|>

Story:
${storyText}

Extract ${sceneCount} visual scenes as a JSON array.<|eot_id|><|start_header_id|>assistant<|end_header_id|>

[`; // Force start of JSON array

        const command = new InvokeModelCommand({
            modelId: "meta.llama3-8b-instruct-v1:0", // Cost-effective model
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify({
                prompt: promptText,
                max_gen_len: 512,
                temperature: 0.6,
                top_p: 0.9
            })
        });

        const bedrockResponse = await client.send(command);
        const result = JSON.parse(new TextDecoder().decode(bedrockResponse.body));
        const outputText = "[" + (result.generation || ""); // Re-add the forced starting bracket

        // Durable JSON Array Extraction
        let scenes = [];
        const arrayMatch = outputText.match(/\[.*\]/s);

        if (arrayMatch) {
            try {
                scenes = JSON.parse(arrayMatch[0]);
            } catch (e) {
                // Fallback: simple split if JSON parse fails
                scenes = arrayMatch[0]
                    .replace(/[\[\]"]/g, '')
                    .split(',')
                    .map(s => s.trim())
                    .filter(s => s.length > 0)
                    .slice(0, sceneCount);
            }
        }

        // Ensure we return the exact count requested (pad or slice)
        if (scenes.length > sceneCount) {
            scenes = scenes.slice(0, sceneCount);
        } else while (scenes.length < sceneCount) {
            scenes.push("A peaceful moment in the story.");
        }

        return {
            statusCode: 200,
            headers: responseHeaders,
            body: JSON.stringify(scenes)
        };

    } catch (err) {
        console.error("SCENE EXTRACTION ERROR:", err);
        return {
            statusCode: 500,
            headers: responseHeaders,
            body: JSON.stringify({ error: err.message })
        };
    }
};
