import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS for your GitHub Pages frontend
app.use(cors({
    origin: process.env.ALLOWED_ORIGIN,   // e.g., https://manasapatgar22.github.io
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
}));

// Parse JSON
app.use(express.json());

// Handle preflight OPTIONS requests
app.options("*", cors({
    origin: process.env.ALLOWED_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
}));

// Health check
app.get("/", (_req, res) => res.send("OK"));

// Chat API endpoint
app.post("/api/chat", async (req, res) => {
    try {
        const prompt = (req.body?.prompt || "").toString().trim();
        if (!prompt) return res.status(400).json({ error: "Missing 'prompt'." });

        console.log("Prompt received:", prompt);

        const upstream = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.API_KEY}`,
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

// Start server
app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
