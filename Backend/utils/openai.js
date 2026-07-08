// utils me hum core logic ko likh te hai

import "dotenv/config";

/*
const getOpenAIAPIResponse = async(message) => {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{
                role: "user",
                content: message
            }]
        })
    };

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", options);
        const data = await response.json();

        if(!response.ok) {
            throw new Error(data.error?.message || "OpenAI API request failed");
        }

        const reply = data.choices?.[0]?.message?.content;

        if(!reply) {
            throw new Error("OpenAI API response did not include a reply");
        }

        return reply; //reply
    } catch(err) {
        console.log("OpenAI API error:", err.message);
        throw err;
    }
}
*/

const getOpenAIAPIResponse = async(message) => {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

    if(!apiKey) {
        throw new Error("GEMINI_API_KEY is missing in .env");
    }

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: message
                }]
            }]
        })
    };

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            options
        );
        const data = await response.json();

        if(!response.ok) {
            throw new Error(data.error?.message || "Gemini API request failed");
        }

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if(!reply) {
            throw new Error("Gemini API response did not include a reply");
        }

        return reply;
    } catch(err) {
        console.log("Gemini API error:", err.message);
        throw err;
    }
}

export default getOpenAIAPIResponse;
