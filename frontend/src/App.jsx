import { useState, useEffect } from 'react'
// Replace the URL with your actual Render URL after you deploy
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  // Step 1: Ask the server for messages when the app opens
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/messages`)
      .then(res => res.json())
      .then(data => setMessages(data));
  }, []);

  // Step 2: Send a new message to the server
  const sendToServer = async () => {
    const response = await fetch(`${API_BASE_URL}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text })
    });
    const newMessage = await response.json();
    setMessages([...messages, newMessage]); // Update the screen
    setText(""); // Clear the input
  };
// 1. Add this function inside your App component
const deleteMessage = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/messages/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      // ONLY update the screen if the database says "OK"
      setMessages(messages.filter(m => m.id !== id));
    } else {
      alert("Cloud database refused to delete. Check your connection!");
    }
  } catch (err) {
    console.error("Connection failed:", err);
  }
};
// 2. Update your return/HTML section to include the button
return (
  /* The "Main Container" - Dark background, full height */
  <div className="min-h-screen bg-slate-900 text-white p-8 font-sans">
    <div className="max-w-2xl mx-auto">
      
      {/* Title */}
      <h1 className="text-4xl font-extrabold mb-8 text-blue-400 tracking-tight">
        Gordo's Cloud Board
      </h1>

      {/* Input Area */}
      <div className="flex gap-3 mb-10 bg-slate-800 p-4 rounded-2xl shadow-2xl border border-slate-700">
        {/* Change the <div> to a <form> and add onSubmit */}
<form 
  onSubmit={(e) => {
    e.preventDefault(); // This stops the page from refreshing
    sendToServer();
  }}
  className="flex gap-3 mb-10 bg-slate-800 p-4 rounded-2xl shadow-2xl border border-slate-700"
>
  <input 
    className="flex-1 bg-slate-700 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-slate-400"
    value={text} 
    onChange={(e) => setText(e.target.value)} 
    placeholder="What's on your mind?"
  />
  <button 
    type="submit" // Ensure this says type="submit"
    className="bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20"
  >
    Send
  </button>
</form>
      </div>

      {/* Message Feed */}
      <div className="space-y-4">
        {messages.map(m => (
  <div 
    key={m.id} 
    className={`p-4 rounded-2xl max-w-[80%] ${
      m.role === 'bot' 
        ? 'bg-blue-600 self-start' // Bot bubbles on the left
        : 'bg-slate-700 self-end ml-auto' // User bubbles on the right
    }`}
  >
    <p className="text-sm font-bold mb-1">
      {m.role === 'bot' ? '🤖 AI' : '👤 You'}
    </p>
    {m.text}
  </div>
))}
        
        {messages.length === 0 && (
          <p className="text-center text-slate-500 mt-10 italic">No messages yet. Be the first!</p>
        )}
      </div>
    </div>
  </div>
);
  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Gordo's Message Board</h1>
      <input 
        value={text} 
        onChange={(e) => setText(e.target.value)} 
        placeholder="Type a message..."
      />
      <button onClick={sendToServer}>Send to Backend</button>

      <hr />
      <ul>
        {messages.map(m => <li key={m.id}>{m.text}</li>)}
      </ul>
    </div>
  )
}

export default App