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
import { GoogleGenerativeAI } from "@google/generative-ai";

app.post("/api/gemini", async (req, res) => {
    try {
        const { prompt } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI({ apiKey });
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        res.json({ text: result.response.text() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



