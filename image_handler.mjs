import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: "us-east-1" });

/**
 * Image Generation Lambda - Uses Stability AI SDXL on AWS Bedrock
 */
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
        const prompt = data.scenePrompt;
        console.log("Generating image for prompt:", prompt);

        if (!prompt) {
            return {
                statusCode: 400,
                headers: responseHeaders,
                body: JSON.stringify({ error: "scenePrompt is required" })
            };
        }

        // Amazon Titan Image Generator Payload
        const payload = {
            taskType: "TEXT_IMAGE",
            textToImageParams: {
                text: `${prompt}, beautiful digital art, vibrant colors, magical children's book style, highly detailed`
            },
            imageGenerationConfig: {
                numberOfImages: 1,
                height: 1024,
                width: 1024,
                cfgScale: 8.0
            }
        };

        const command = new InvokeModelCommand({
            modelId: "amazon.titan-image-generator-v2:0", // Titan Image Generator v2
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify(payload)
        });

        const bedrockResponse = await client.send(command);
        const result = JSON.parse(new TextDecoder().decode(bedrockResponse.body));

        // Titan returns the image directly in an "images" array
        if (result.images && result.images.length > 0) {
            const base64Image = result.images[0];
            return {
                statusCode: 200,
                headers: responseHeaders,
                body: JSON.stringify({
                    image: `data:image/png;base64,${base64Image}`
                })
            };
        } else {
            throw new Error("No image data returned from Titan model");
        }

    } catch (err) {
        console.error("IMAGE GENERATION ERROR:", err);
        return {
            statusCode: 500,
            headers: responseHeaders,
            body: JSON.stringify({ error: err.message })
        };
    }
};
