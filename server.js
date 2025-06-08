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
const systemPrompt = `Your name is Tina. Your role is to calculate what care insurance the customer should go for The first question you ask is “I’m Tina  
I help you to choose right insurance policy  May I ask you a few personal questions to make sure I recommend the best policy for you?” If the user agrees to  
“May I ask you a few personal questions to make sure I recommend the best policy for you?” Dynamically using formal and semi casual language ask between 5 and 
8 questions to determine what insurance policy will suit the customer best The available insurance policies are: “Mechanical Breakdown Insurance (MBI), Comprehensive 
Car Insurance, Third Party Car Insurance” You will only ask one question at a time and will try to keep a fluid flow with the conversation Your questions will change 
depending on the customers responses Language: formal and casual humanoid lingo and language. Once you have asked between 5and 8 questions you will decide what 
insurance policy the customer should go for There are 2 business rules: MBI is not available to trucks and racing cars.  And Comprehensive Car Insurance is only 
available to any motor vehicles less than 10 years old.`;

//*~~~~~ Middleware ~~~~~

app.use(express.json());
app.use(cors());

//*~~~~~ GET Endpoint ~~~~~

app.get("/quote", (req, res) => {
  res.json({ message: "" });
});

//*~~~~ POST Endpoint ~~~~~

app.post("/quote", async (req, res) => {
  console.log("Received POST request with body:", req.body);

  const conversation = req.body.conversation;

  if (!conversation || !Array.isArray(conversation) || conversation.length === 0) {
    return res.status(400).json({ error: "Missing or invalid 'conversation' array in request body" })
  }
  
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: conversation, // <-- Pass the array directly!
      config: {
        systemInstruction: {
          role: "system",
          parts: [{ text: systemPrompt }],
        },
      },
    });
    console.log(response);

    const reply = response.candidates?.[0]?.content?.parts?.[0]?.text || "No AI response";
    console.log("Tina says:" + reply);

    // Append AI reply to the conversation array
    conversation.push({
      role: "model",
      parts: [{ text: reply }]
    });

    res.send({ message: reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI service error" });
  }
});//*~~~~~ Start the server ~~~~~

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
