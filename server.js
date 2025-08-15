import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Allow your GitHub Pages site to call this API
app.use(cors({
    origin: process.env.ALLOWED_ORIGIN,
    methods: ["POST"],
    allowedHeaders: ["Content-Type"]
}));


app.use(express.json());

// Simple health check
app.get("/", (_req, res) => res.send("OK"));

// Proxy endpoint that keeps your key secret
app.post("/api/chat", async (req, res) => {
    try {
        const prompt = (req.body?.prompt || "").toString().trim();
        if (!prompt) return res.status(400).json({ error: "Missing 'prompt'." });

        console.log("Prompt received:", prompt);

        const upstream = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ role: "user", parts: [{ text: prompt }] }]
                })
            }
        );

        const data = await upstream.json();
        const text =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ??
            data?.promptFeedback?.blockReason ??
            "No response";

        res.json({ text });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});


