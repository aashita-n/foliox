import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/dashboard";
import AiChat from "./components/AiChat";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ai-chat" element={<AiChat />} />
      </Routes>
    </Router>
  );
}

export default App;
