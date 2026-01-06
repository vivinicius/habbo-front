import { useEffect, useState } from "react";
import api from "../services/api";

function Ganhador({ jogadorId, jogadores, totalPagues, onClose }) {
  const jogador = jogadores.find(
    (j) => j.id === Number(jogadorId)
  );

  const [movimentacoes, setMovimentacoes] = useState([]);

  useEffect(() => {
    if (!jogadorId) return;

    const carregarMovimentacoes = async () => {
      try {
        const res = await api.get(
          `/jogadores/${jogadorId}/movimentacoes`
        );
        setMovimentacoes(res.data);
      } catch (err) {
        console.error("Erro ao carregar movimentações", err);
      }
    };

    carregarMovimentacoes();
  }, [jogadorId]);

  if (!jogador) return null;

  // 🔢 Total pago pelo jogador
  const totalPagoJogador = movimentacoes.reduce(
    (acc, mov) => acc + mov.valor,
    0
  );

  // 💰 Valor restante do bolo
  const restante = totalPagues - totalPagoJogador;

  // ✅ REGRA FINAL GARANTIDA
  const ganhoGanhador = Math.round(restante * 0.65);
  const ganhoHost = restante - ganhoGanhador;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className="
          bg-[#fff8e8] w-[650px] p-6 rounded-xl
          border-[3px] border-[#d9b97a]
          shadow-[0_6px_0_#b09055]
        "
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl habbo-3d text-[#6b5b4a]">
            Ganhador: {jogador.nomeJogador}
          </h1>

          <button
            onClick={onClose}
            className="text-red-500 text-2xl hover:text-red-700"
            title="Fechar"
          >
            ✖
          </button>
        </div>

        {/* PAGAMENTOS */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-[#6b5b4a]">
            Pagamentos do Jogador
          </h3>

          {movimentacoes.length === 0 ? (
            <p className="text-gray-500 text-sm">
              Nenhuma movimentação encontrada.
            </p>
          ) : (
            <ul
              className="
                max-h-40 overflow-y-auto
                bg-[#fffdf8] border border-[#e1d2b5]
                rounded p-3 text-sm text-[#6b5b4a]
              "
            >
              {movimentacoes.map((m) => (
                <li
                  key={m.id}
                  className="flex justify-between border-b border-[#e8dcc3] py-1"
                >
                  <span>{m.descricao || "Moeda"}</span>
                  <strong>{m.valor} 💰</strong>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* RESUMO */}
        <div className="space-y-2 mb-6 text-[#6b5b4a]">
          <p>
            Total pago pelo jogador:{" "}
            <strong>{totalPagoJogador} 💰</strong>
          </p>

          <p>
            Total pagues:{" "}
            <strong>{totalPagues} 💰</strong>
          </p>

          <p>
            Restante:{" "}
            <strong>{restante} 💰</strong>
          </p>
        </div>

        {/* GANHOS */}
        <div className="space-y-3">
          <p
            className="
              p-3 bg-[#66CDAA] border border-[#5F9EA0]
              rounded shadow text-[#084c3a]
            "
          >
            Total Ganhador (65%):{" "}
            <strong>{ganhoGanhador} + Prêmio</strong>
          </p>

          <p
            className="
              p-3 bg-[#7fa7e0] border border-[#5c7eb0]
              rounded shadow text-white
            "
          >
            Total Host (35%):{" "}
            <strong>{ganhoHost}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Ganhador;
