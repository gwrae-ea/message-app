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

  // 1. Save User Message to Supabase
  const { data: userMsg, error: userErr } = await supabase
    .from('messages')
    .insert([{ text, role: 'user' }]) // Added a 'role' column
    .select();

  // 2. Talk to the AI
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(text);
  const aiResponse = result.response.text();

  // 3. Save AI Message to Supabase
  const { data: aiMsg, error: aiErr } = await supabase
    .from('messages')
    .insert([{ text: aiResponse, role: 'bot' }])
    .select();

  res.json(aiMsg[0]); // Send the bot's response back to the UI
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