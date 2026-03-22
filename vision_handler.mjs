import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: "us-east-1" });

export const handler = async (event) => {
    const responseHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Content-Type": "application/json"
    };

    // Handle Preflight CORS requests
    if (event.requestContext?.http?.method === "OPTIONS" || event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers: responseHeaders, body: "" };
    }

    try {
        const bodyText = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString() : event.body;
        const data = JSON.parse(bodyText || "{}");

        if (!data.imageBase64) {
            return {
                statusCode: 400,
                headers: responseHeaders,
                body: JSON.stringify({ error: "Missing imageBase64 in request body" })
            };
        }

        const matches = data.imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        
        if (!matches || matches.length !== 3) {
            return {
                statusCode: 400,
                headers: responseHeaders,
                body: JSON.stringify({ error: "Invalid image format. Expected Data URL." })
            };
        }

        const mediaType = matches[1]; 
        const base64Data = matches[2]; 
        
        const claudeCommand = new InvokeModelCommand({
            modelId: "anthropic.claude-3-haiku-20240307-v1:0", 
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify({
                anthropic_version: "bedrock-2023-05-31",
                max_tokens: 150,
                system: "You are an expert at analyzing photos and describing physical traits cleanly and concisely without any filler text.",
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "image",
                                source: {
                                    type: "base64",
                                    media_type: mediaType,
                                    data: base64Data
                                }
                            },
                            {
                                type: "text",
                                text: "Look at this image of a child. Give me a concise, comma-separated physical description including only: approximate age, gender, hair style, hair color, eye color, skin tone, and any distinct facial features (like glasses or freckles). Do NOT include clothing or background."
                            }
                        ]
                    }
                ]
            })
        });
        
        const claudeResponse = await client.send(claudeCommand);
        const claudeParsed = JSON.parse(new TextDecoder().decode(claudeResponse.body));
        const physicalTraits = claudeParsed.content[0].text.trim();
        
        return {
            statusCode: 200,
            headers: responseHeaders,
            body: JSON.stringify({ traits: physicalTraits })
        };

    } catch (err) {
        console.error("LOG ERROR:", err);
        return {
            statusCode: 500,
            headers: responseHeaders,
            body: JSON.stringify({ error: `Service Error: ${err.message}` })
        };
    }
};
