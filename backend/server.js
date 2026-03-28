require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

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
  console.log("Attempting to save:", req.body.text); // Audit 1

  const { data, error } = await supabase
    .from('messages')
    .insert([{ text: req.body.text }])
    .select();

  if (error) {
    console.error("Supabase Error:", error.message); // Audit 2
    return res.status(500).json(error);
  }

  console.log("Saved Successfully:", data[0]); // Audit 3
  res.json(data[0]);
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