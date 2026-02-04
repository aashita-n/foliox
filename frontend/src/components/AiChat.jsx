import { Box, Card, CardContent, Typography, TextField, Button, CircularProgress } from "@mui/material";
import { useState } from "react";

export default function AiChat() {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hi 👋 I’m your FolioX AI assistant. Ask me anything about your portfolio." }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add the user's message to the conversation
    setMessages([
      ...messages,
      { sender: "user", text: input },
      { sender: "ai", text: "Loading..." } // Placeholder while waiting for AI response
    ]);
    setIsTyping(true);
    setInput("");

    try {
      // Send the question to the backend API
      const response = await fetch("http://localhost:5173/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: input }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update the conversation with the AI's response
        setMessages((prevMessages) => [
          ...prevMessages.slice(0, prevMessages.length - 1), // Remove "Loading..."
          { sender: "ai", text: data.response }
        ]);
      } else {
        // Handle API error
        setMessages((prevMessages) => [
          ...prevMessages.slice(0, prevMessages.length - 1),
          { sender: "ai", text: "Sorry, something went wrong. Please try again." }
        ]);
      }
    } catch (error) {
      // Handle any fetch errors
      setMessages((prevMessages) => [
        ...prevMessages.slice(0, prevMessages.length - 1),
        { sender: "ai", text: "An error occurred. Please try again." }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "#E0F7FA", // bg-cyan-50 color
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        p: 3
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 800 }}>
        <Typography variant="h4" fontWeight="bold" mb={2}>
          AI Portfolio Assistant
        </Typography>

        <Card sx={{ borderRadius: 3, mb: 2, height: "60vh", overflowY: "auto" }}>
          <CardContent>
            {messages.map((msg, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                  mb: 1
                }}
              >
                <Box
                  sx={{
                    backgroundColor: msg.sender === "user" ? "#2563EB" : "#E5E7EB",
                    color: msg.sender === "user" ? "white" : "black",
                    p: 1.5,
                    borderRadius: 2,
                    maxWidth: "70%",
                    transition: "all 0.3s ease-in-out",
                  }}
                >
                  {msg.text}
                </Box>
              </Box>
            ))}
            {isTyping && (
              <Box sx={{ fontStyle: "italic", color: "gray", textAlign: "center" }}>
                AI is typing...
              </Box>
            )}
          </CardContent>
        </Card>

        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Ask about risk, returns, rebalancing..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button variant="contained" onClick={sendMessage}>
            Send
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
