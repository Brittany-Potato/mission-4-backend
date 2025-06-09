//*~~~~~ Imports ~~~~~

// Load environment variables from .env file
require("dotenv").config();

// Import GoogleGenAI for Gemini API
const { GoogleGenAI } = require("@google/genai");

// Import axios for HTTP requests (not used in this file)
const axios = require("axios");

// Import express for server creation
const express = require("express");
const app = express();

// Import cors to allow cross-origin requests
const cors = require("cors");

// Set the port for the server
const port = 4000;

//*~~~~~ Variables ~~~~~

// Get the API key from environment variables
const API_KEY = process.env.API_KEY;

// Initialize the Gemini AI client with the API key
const ai = new GoogleGenAI({ apiKey: API_KEY });

// System prompt that instructs the AI assistant "Tina" on how to behave
const systemPrompt = `Your name is Tina. Your role is to calculate what care insurance the customer should go for The first question you ask is “I’m Tina  
I help you to choose right insurance policy  May I ask you a few personal questions to make sure I recommend the best policy for you?” If the user agrees to  
“May I ask you a few personal questions to make sure I recommend the best policy for you?”, you are NOT to reply unless they agree to your first question. Dynamically using formal and semi casual language ask between 5 and 
8 questions to determine what insurance policy will suit the customer best The available insurance policies are: “Mechanical Breakdown Insurance (MBI), Comprehensive 
Car Insurance, Third Party Car Insurance” You will only ask one question at a time and will try to keep a fluid flow with the conversation Your questions will change 
depending on the customers responses Language: formal and casual humanoid lingo and language. Once you have asked between 5and 8 questions you will decide what 
insurance policy the customer should go for There are 2 business rules: MBI is not available to trucks and racing cars.  And Comprehensive Car Insurance is only 
available to any motor vehicles less than 10 years old.`;

//*~~~~~ Middleware ~~~~~

// Parse incoming JSON requests
app.use(express.json());

// Enable CORS for all routes
app.use(cors());

//*~~~~~ GET Endpoint ~~~~~

// Simple GET endpoint for /quote, returns an empty message
app.get("/quote", (req, res) => {
  res.json({ message: "" });
});

//*~~~~ POST Endpoint ~~~~~

// Main POST endpoint for /quote, handles conversation with the AI
app.post("/quote", async (req, res) => {
  // Log the incoming request body for debugging
  console.log("Received POST request with body:", req.body);

  // Extract the conversation array from the request body
  const conversation = req.body.conversation;

  // Validate that conversation is a non-empty array
  if (!conversation || !Array.isArray(conversation) || conversation.length === 0) {
    return res.status(400).json({ error: "Missing or invalid 'conversation' array in request body" })
  }
  
  try {
    // Send the conversation history and system prompt to Gemini AI
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: conversation, // Pass the conversation array directly
      config: {
        systemInstruction: {
          role: "system",
          parts: [{ text: systemPrompt }],
        },
      },
    });

    // Log the raw response from Gemini for debugging
    console.log(response);

    // Extract the AI's reply from the response object
    const reply = response.candidates?.[0]?.content?.parts?.[0]?.text || "No AI response";
    console.log("Tina says:" + reply);

    // Append the AI's reply to the conversation array
    conversation.push({
      role: "model",
      parts: [{ text: reply }]
    });

    // Send the AI's reply back to the frontend
    res.send({ message: reply });
  } catch (error) {
    // Log and return any errors that occur during the AI request
    console.error(error);
    res.status(500).json({ error: "AI service error" });
  }
});

//*~~~~~ Start the server ~~~~~

// Start the Express server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});