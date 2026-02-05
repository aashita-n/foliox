import { useState } from "react";
import { Button, Input, Card, CardBody } from "@heroui/react";

export default function AiChat() {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hi 👋 I'm your FolioX AI assistant. Ask me anything about your portfolio." }
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
      // Send the question to the Flask AI chat API (proxied by Vite)
      const response = await fetch("http://localhost:5001/ai-chat", {
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 h-16 !bg-white shadow-sm border-b border-slate-200 flex items-center px-10">
        <h1 className="text-xl font-bold tracking-wide text-primary-600">FolioX</h1>
        <span className="mx-3 text-slate-300">|</span>
        <span className="text-slate-600 font-medium">AI Assistant</span>
      </div>

      {/* Chat Container */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-6 flex flex-col">
        {/* Welcome Card */}
        <Card className="mb-6 shadow-sm border border-slate-200">
          <CardBody className="p-6 text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">AI Portfolio Assistant</h2>
            <p className="text-slate-500">Ask me about risk analysis, returns, diversification, or portfolio rebalancing.</p>
          </CardBody>
        </Card>

        {/* Messages */}
        <Card className="flex-1 shadow-sm border border-slate-200 bg-white">
          <CardBody className="p-6 flex flex-col h-[60vh]">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                      msg.sender === "user"
                        ? "bg-primary-600 text-white rounded-br-md"
                        : "bg-slate-100 text-slate-800 rounded-bl-md"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-bl-md">
                    <span className="flex gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex gap-3">
                <Input
                  fullWidth
                  placeholder="Ask about risk, returns, rebalancing..."
                  value={input}
                  onValueChange={setInput}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  size="lg"
                  variant="bordered"
                  classNames={{
                    inputWrapper: "border-slate-200 hover:border-primary-400 focus-within:border-primary-500",
                  }}
                />
                <Button
                  color="primary"
                  size="lg"
                  onClick={sendMessage}
                  className="font-medium px-8"
                >
                  Send
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

