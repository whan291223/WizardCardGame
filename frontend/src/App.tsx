import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Lobby } from "./pages/Lobby";
import { Arena } from "./pages/Arena";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/arena" element={<Arena />} />
      </Routes>
    </Router>
  );
}

export default App;
