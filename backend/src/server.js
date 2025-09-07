import express from "express";
import dotenv from "dotenv"
import cors from "cors";

import notesRoutes from "./routes/notesRoutes.js";
import { connectDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5001;

// middle ware
app.use(cors({
    origin:"http://localhost:5173",
})); // allows cross-origin requests

app.use(express.json());// this middleware will parse JSON bodies : req.body
app.use(rateLimiter);

// simple custom middleware
// app.use((req, res, next) => {
//     console.log(`Req method is ${req.method} & Req URL is ${req.url}`);
//     next();
// });

app.use("/api/notes",notesRoutes);


connectDB().then(()=> {
    app.listen(PORT , () => {
        console.log("Server started on PORT: ", PORT);
    });
});



// Gemini API proxy route
import fetch from "node-fetch";

app.post("/api/gemini", async (req, res) => {
    try {
        const { prompt } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const body = {
            contents: [
                { role: "user", parts: [{ text: prompt }] }
            ]
        };
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        console.log("Gemini API response:", data);
        const newText =
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          data.candidates?.[0]?.content?.text ||
          selectedText;
        if (!newText) {
            res.status(500).json({ error: "Gemini did not return any output. Try a different prompt." });
            return;
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



