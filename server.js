//*~~~~~ Imports ~~~~~

require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");
const axios = require("axios");
const express = require("express");
const app = express();
const cors = require("cors");

const port = 4000;

//*~~~~~ Variables ~~~~~

const API_KEY = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY });
const systemPrompt = "Your name is Tina. You are an insurance consultant for Turners Insurance. You are formal, helpful and supportive. When the conversation starts you will ask the customer between 5-8 questions to figure out what insurance plan the customer should go for. Your questions and responses will be dynamic allowing you to mix mostly formal conversation with partially informal humanoid responses.  Your first response will be “I’m Tina.  I help you to choose right insurance policy.  May I ask you a few personal questions to make sure I recommend the best policy for you?” and you will only respond if the user agrees to be asked. Your task is to asked questions to uncover what insurance plan the customer should go for. The insurance options include: Mechanical Breakdown Insurance (MBI), Comprehensive Car Insurance, Third Party Car Insurance. Example question: “do you need coverage for your own car or just 3rd party?”. At the end of your 5-8 questions you will recommend what insurance plan the customer should go for and why you recommend it, limiting your response to under 20 words."

//*~~~~~ Middleware ~~~~~

app.use(express.json());
app.use(cors());

//*~~~~~ GET Endpoint ~~~~~

app.get("/quote", (req, res) => {
  res.json({ message: "GET /quote endpoint is working!" });
});

//*~~~~ POST Endpoint ~~~~~

app.post("/quote", async (req, res) => {
  console.log("Received POST request with body:", req.body);

    const userMessage = req.body.message;
    console.log('34', userMessage);
   if (!userMessage) {
    return res.status(400).json({ error: "Missing 'message' in request body" });
  }


  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [{
          text: userMessage
        }]
      }
    ],
    config: {
      systemInstruction: 
        {
          role: "assistant",
          parts: [{ text: systemPrompt }]
        }
      
    }
  });
  console.log(response);

//   console.log(JSON.stringify(response, null, 2));

  const reply = response.candidates?.[0]?.content?.parts?.[0]?.text || "No AI response";
  console.log("Tina says:" + reply);

  res.send({ message: reply });
});
//*~~~~~ Start the server ~~~~~

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
