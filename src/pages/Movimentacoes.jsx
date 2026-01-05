import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

function Movimentacoes() {
  const { jogoId, jogadorId } = useParams();
  const navigate = useNavigate();
  const [movs, setMovs] = useState([]);

  useEffect(() => {
    carregarMovs();
  }, []);

  const carregarMovs = async () => {
    const res = await api.get(
      `/jogos/${jogoId}/jogadores/${jogadorId}/movimentacoes`
    );
    setMovs(res.data);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <button
        onClick={() => navigate(`/jogos/${jogoId}`)}
        className="text-blue-600 underline mb-4"
      >
        ⬅ Voltar
      </button>

      <h1 className="text-3xl font-bold mb-4">
        Movimentações do Jogador {jogadorId}
      </h1>

      <div className="bg-white p-5 rounded shadow border mt-4">
        <ul className="space-y-2">
          {movs.map((m) => (
            <li
              key={m.id}
              className="p-3 bg-gray-50 rounded border flex justify-between"
            >
              <span>Valor inserido: <strong>R$ {m.valor}</strong></span>
              <span>Saldo: <strong className="text-green-600">R$ {m.saldo}</strong></span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Movimentacoes;
