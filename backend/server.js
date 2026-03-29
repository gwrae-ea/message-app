require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// GET messages from the real database
app.get('/api/messages', async (req, res) => {
  const { data, error } = await supabase.from('messages').select('*');
  res.json(data);
});

// POST a new message to the real database
app.post('/api/messages', async (req, res) => {
  const { text } = req.body;
  console.log("User sent:", text);

  try {
    // Try 'gemini-1.5-flash' or 'gemini-1.5-pro'
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Explicitly call the content generation
    const result = await model.generateContent(text);
    const response = await result.response;
    const aiResponse = response.text();

    console.log("AI says:", aiResponse);

    // ... your Supabase save logic here ...
    
    res.json({ text: aiResponse, role: 'bot' });
  } catch (error) {
    console.error("Detailed AI Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE a message by its ID
// Change app.post to app.delete
app.delete('/api/messages/:id', async (req, res) => {
  const { id } = req.params; // We get the ID from the URL now
  console.log("Deleting ID from Supabase:", id);

  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Supabase Delete Error:", error.message);
    return res.status(500).json(error);
  }

  res.json({ success: true });
});

app.listen(5000, () => console.log("Server connected to Cloud Database!"));