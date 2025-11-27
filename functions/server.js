const express = require("express");
const serverless = require("serverless-http");
const fetch = require("node-fetch");

const app = express();
const router = express.Router();

require("dotenv").config();

router.post("/chatbot", async (req, res) => {
  try {
    const { message } = req.body;
    const apiKey = process.env["GEMINI_KEY"];
    if (!message || !apiKey) {
      return res
        .status(400)
        .json({ error: "Falta message o apiKey en el body" });
    }

    const API_URL =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: message,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Error respuesta Gemini:", text);
      return res
        .status(502)
        .json({ error: "Error en Gemini API", detail: text });
    }

    const data = await response.json();
    const reply = data.candidates[0].content.parts[0].text.trim();

    res.json({ reply });
  } catch (err) {
    console.error("Error en /chatbot", err);
    res.status(500).json({ error: "Error procesando el mensaje" });
  }
});

app.use("/.netlify/functions/server", router);
module.exports.handler = serverless(app);                                                        