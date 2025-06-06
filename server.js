//*~~~~~ Imports ~~~~~

require("dotenv").config();
const { GoogleGenAI } = require('@google/genai');
const axios = require('axios');
const express = require('express')
const app = express();

//~~~~~

const port = 3000;

//*~~~~~ Variables ~~~~~

const API_KEY = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY });

//*~~~~~ Middleware ~~~~~

app.use(express.json());

//*~~~~ POST Endpoint ~~~~~

app.post("./echo", (req, res) => {
    res.json({
        message: "You sent this",
        data: req.body,
    });
});

//*~~~~~ Initial AI Function ~~~~~

async function main() {
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: "Explain how AI works in a few words",
    });
    console.log(response.text);
}

main();




//*~~~~~ Start the server ~~~~~

app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});