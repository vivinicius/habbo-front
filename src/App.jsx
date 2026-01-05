import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Jogo from "./pages/Jogo.jsx";
import Movimentacoes from "./pages/Movimentacoes";
import Login from "./auth/Login";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<Home />} />

      <Route path="/jogos/:jogoId" element={<Jogo />} />

      <Route
        path="/jogos/:jogoId/jogadores/:jogadorId/movimentacoes"
        element={<Movimentacoes />}
      />
    </Routes>
  );
}
