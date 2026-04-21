import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Lobby } from "./pages/Lobby";
import { Arena } from "./pages/Arena";
import { LiffProvider } from "./lib/liff";

function App() {
  const liffId = import.meta.env.VITE_LIFF_ID || "mock-liff-id";

  return (
    <LiffProvider liffId={liffId}>
      <Router>
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/arena" element={<Arena />} />
        </Routes>
      </Router>
    </LiffProvider>
  );
}

export default App;
