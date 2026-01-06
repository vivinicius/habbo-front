import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../auth/AuthContext";
import AuthButton from "../components/AuthButton";

function Jogo() {
  const { jogoId } = useParams();
  const { isAdmin } = useAuth();
  const movsAbertasRef = useRef({});

  const navigate = useNavigate();

  const [jogo, setJogo] = useState(null);
  const [valoresJogadores, setValoresJogadores] = useState({});
  const [descricoes, setDescricoes] = useState({});
  const [saldos, setSaldos] = useState({});
  const [novoJogador, setNovoJogador] = useState("");
  const [entrouComPague, setEntrouComPague] = useState(false);
  const [movsAbertas, setMovsAbertas] = useState({});
  const [movsJogadores, setMovsJogadores] = useState({});

  // 🔥 MODAIS
  const [modalExcluirJogador, setModalExcluirJogador] = useState(null);
  const [modalExcluirMov, setModalExcluirMov] = useState(null);
  const [modalErro, setModalErro] = useState(null);
  const [valorEntrada, setValorEntrada] = useState("");

  const Moeda = () => <span className="ml-1">💰</span>;

  useEffect(() => {
  movsAbertasRef.current = movsAbertas;
}, [movsAbertas]);

useEffect(() => {
  carregarJogo();

  const interval = setInterval(async () => {
    await carregarJogo();
    await atualizarMovimentacoesAbertas();
  }, 5000);

  return () => clearInterval(interval);
}, []);


const atualizarMovimentacoesAbertas = async () => {
  const abertas = Object.entries(movsAbertasRef.current)
    .filter(([_, aberta]) => aberta)
    .map(([jogadorId]) => jogadorId);

  for (const jogadorId of abertas) {
    try {
      const res = await api.get(`/jogadores/${jogadorId}/movimentacoes`);
      setMovsJogadores((prev) => ({
        ...prev,
        [jogadorId]: res.data,
      }));
    } catch (err) {
      console.error("Erro ao atualizar movimentações", err);
    }
  }
};


  const carregarJogo = async () => {
    try {
      const res = await api.get(`/jogos/${jogoId}`);
      setJogo(res.data);
      carregarSaldos(res.data.jogadores);
    } catch (err) {
      console.error("Erro ao carregar jogo", err);
      setModalErro("Erro ao carregar jogo.");
    }
  };

  const carregarSaldos = async (jogadores) => {
    const mapa = {};
    for (const j of jogadores) {
      try {
        const res = await api.get(`/jogadores/${j.id}/movimentacoes`);
        const movs = res.data;
        mapa[j.id] = movs.length ? movs[movs.length - 1].saldo : 0;
      } catch {
        mapa[j.id] = 0;
      }
    }
    setSaldos(mapa);
  };

  const confirmarExcluirJogador = async () => {
    if (!modalExcluirJogador) return;
    try {
      await api.delete(`/jogos/${jogoId}/jogadores/${modalExcluirJogador.id}`);
      setModalExcluirJogador(null);
      carregarJogo();
    } catch (err) {
      console.error(err);
      setModalExcluirJogador(null);
      setModalErro("Erro ao excluir jogador.");
    }
  };

  const confirmarExcluirMov = async () => {
    if (!modalExcluirMov) return;
    try {
      await api.delete(`/movimentacoes/${modalExcluirMov.movId}`);
      const res = await api.get(
        `/jogadores/${modalExcluirMov.jogadorId}/movimentacoes`
      );
      setMovsJogadores((prev) => ({
        ...prev,
        [modalExcluirMov.jogadorId]: res.data,
      }));
      setModalExcluirMov(null);
      carregarJogo();
    } catch (err) {
      console.error(err);
      setModalExcluirMov(null);
      setModalErro("Erro ao excluir movimentação.");
    }
  };

  const toggleMovs = async (jogadorId) => {
    setMovsAbertas((prev) => ({
      ...prev,
      [jogadorId]: !prev[jogadorId],
    }));

    try {
      const res = await api.get(`/jogadores/${jogadorId}/movimentacoes`);
      setMovsJogadores((prev) => ({
        ...prev,
        [jogadorId]: res.data,
      }));
    } catch (err) {
      console.error(err);
      setModalErro("Erro ao buscar movimentações.");
    }
  };

  const adicionarValor = async (jogadorId) => {
    const valor = valoresJogadores[jogadorId];
    const descricao = descricoes[jogadorId] || "";

    if (!valor || valor <= 0) {
      return setModalErro("Digite um valor válido!");
    }

    try {
      await api.post(
        `/jogos/${jogoId}/jogadores/${jogadorId}/movimentacoes/adicionar`,
        { valor: Number(valor), descricao }
      );

      setValoresJogadores({ ...valoresJogadores, [jogadorId]: "" });
      setDescricoes({ ...descricoes, [jogadorId]: "" });

      carregarJogo();

      if (movsAbertas[jogadorId]) {
        const res = await api.get(`/jogadores/${jogadorId}/movimentacoes`);
        setMovsJogadores((prev) => ({
          ...prev,
          [jogadorId]: res.data,
        }));
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.mensagem || "Erro ao adicionar valor.";
      setModalErro(msg);
    }
  };

  const adicionarJogador = async () => {
  if (!novoJogador.trim()) {
    return setModalErro("Digite o nome do jogador!");
  }

  if (entrouComPague) {
    if (!valorEntrada || Number(valorEntrada) <= 0) {
      return setModalErro("Informe o valor pago para entrar!");
    }
  }

  try {
    const rota = entrouComPague
      ? `/jogos/${jogoId}/jogadores/entrar-com-pague`
      : `/jogos/${jogoId}/jogadores`;

    const payload = entrouComPague
      ? {
          nomeJogador: novoJogador,
          valorPago: Number(valorEntrada),
        }
      : {
          nomeJogador: novoJogador,
        };

    await api.post(rota, payload);

    setNovoJogador("");
    setValorEntrada("");
    setEntrouComPague(false);
    carregarJogo();
  } catch (err) {
    console.error(err);
    const msg = err.response?.data?.mensagem || "Erro ao criar jogador.";
    setModalErro(msg);
  }
};


  const pagarComSaldo = async (jogadorId) => {
    try {
      const saldoAtual = saldos[jogadorId] ?? 0;
      const valorPague = jogo.valorPagamentoRodada;
      const saiuDoSaldo = Math.min(saldoAtual, valorPague);

      await api.post(
        `/jogos/${jogoId}/jogadores/${jogadorId}/movimentacoes/adicionar`,
        { valor: 0, descricao: `Pagou com saldo (-${saiuDoSaldo})` }
      );

      carregarJogo();

      if (movsAbertas[jogadorId]) {
        const res = await api.get(`/jogadores/${jogadorId}/movimentacoes`);
        setMovsJogadores((prev) => ({
          ...prev,
          [jogadorId]: res.data,
        }));
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.mensagem || "Saldo insuficiente!";
      setModalErro(msg);
    }
  };

  if (!jogo) return <h1 className="text-center text-xl">Carregando...</h1>;

  return (
    <div className="min-h-screen bg-[#f3eadd] p-6">

      {/* ============================ */}
      {/* MODAIS (SEM ANIMAÇÕES QUEBRADAS) */}
      {/* ============================ */}

      {modalErro && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div
            className="
              bg-[#fff8e8] border-[4px] border-[#d9b97a] rounded-xl
              shadow-[0_6px_0_#b09055] p-6 w-[350px]
              flex flex-col items-center text-center
            "
          >
            <h2 className="text-3xl habbo-3d mb-4">Erro</h2>

            <p className="text-[#6b5b4a] mb-6 whitespace-pre-line">
              {modalErro}
            </p>

            <button
              onClick={() => setModalErro(null)}
              className="
                w-full bg-[#e57373] border border-[#b94f4f] text-white 
                py-2 rounded shadow-[0_3px_0_#a23c3c]
              "
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {modalExcluirJogador && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div
            className="
              bg-[#fff8e8] border-[4px] border-[#d9b97a] rounded-xl
              shadow-[0_6px_0_#b09055] p-6 w-[330px]
              flex flex-col items-center text-center
            "
          >
            <h2 className="text-3xl habbo-3d mb-4">Confirmar</h2>

            <p className="text-[#6b5b4a] mb-6">
              Excluir jogador:
              <br />
              <strong>{modalExcluirJogador.nome}</strong>?
            </p>

            <div className="flex justify-center gap-4 w-full">
              <button
                onClick={() => setModalExcluirJogador(null)}
                className="
                  flex-1 bg-[#7fa7e0] border border-[#5c7eb0] text-white 
                  py-2 rounded shadow-[0_3px_0_#54739e]
                "
              >
                Cancelar
              </button>

              <button
                onClick={confirmarExcluirJogador}
                className="
                  flex-1 bg-[#e57373] border border-[#b94f4f] text-white 
                  py-2 rounded shadow-[0_3px_0_#a23c3c]
                "
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {modalExcluirMov && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div
            className="
              bg-[#fff8e8] border-[4px] border-[#d9b97a] rounded-xl
              shadow-[0_6px_0_#b09055] p-6 w-[330px]
              flex flex-col items-center text-center
            "
          >
            <h2 className="text-3xl habbo-3d mb-4">Confirmar</h2>

            <p className="text-[#6b5b4a] mb-6">
              Excluir movimentação?
              <br />
              <strong>Valor: {modalExcluirMov.valor} 💰</strong>
            </p>

            <div className="flex justify-center gap-4 w-full">
              <button
                onClick={() => setModalExcluirMov(null)}
                className="
                  flex-1 bg-[#7fa7e0] border border-[#5c7eb0] text-white 
                  py-2 rounded shadow-[0_3px_0_#54739e]
                "
              >
                Cancelar
              </button>

              <button
                onClick={confirmarExcluirMov}
                className="
                  flex-1 bg-[#e57373] border border-[#b94f4f] text-white 
                  py-2 rounded shadow-[0_3px_0_#a23c3c]
                "
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================ */}
      {/* HEADER GLOBAL */}
      {/* ============================ */}
      <div className="w-full flex items-center justify-between mb-10">
  <div className="flex items-center gap-4">
    <button onClick={() => navigate("/")} className="btn-habbo-back">
      <div className="arrow"></div>
    </button>

    <h1 className="text-6xl habbo-3d">{jogo.nome}</h1>
  </div>

  {/* LOGIN / LOGOUT */}
  <AuthButton />
</div>

      {/* ============================ */}
      {/* LAYOUT PRINCIPAL — 60/40 */}
      {/* ============================ */}
      <div className="flex gap-10 items-start">

        {/* ============================ */}
        {/* ESQUERDA — JOGADORES */}
        {/* ============================ */}
        <div className="w-[60%]">

          <h2 className="text-4xl habbo-3d mb-6">Jogadores</h2>

          <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(520px,1fr))] items-start">
            {[...jogo.jogadores]
              .sort((a, b) => b.valorPago - a.valorPago)
              .map((j) => {
                const saldoAtual = saldos[j.id] ?? 0;
                const faltaParaPagar = Math.max(
                  jogo.valorPagamentoRodada - saldoAtual,
                  0
                );

                return (
                  <div
                    key={j.id}
                    className="
                      bg-[#fff8e8] rounded-xl border-[3px] border-[#d9b97a]
                      shadow-[0_3px_0_#b09055] p-4 w-full min-w-[500px]
                    "
                  >
                    {/* HEADER */}
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold text-[#6b5b4a]">
                        {j.nomeJogador}
                      </h3>
                      {isAdmin && (
                      <button
                        onClick={() =>
                          setModalExcluirJogador({ id: j.id, nome: j.nomeJogador })
                        }
                        className="text-red-500 hover:text-red-700 text-xl"
                        title="Excluir jogador"
                      >
                        ✖
                      </button>
                      )}
                    </div>

                    {/* VALORES */}
                    <div className="text-sm text-[#6b5b4a] space-y-1 mb-3">
                      <p>Total Pago: <strong>{j.valorPago}<Moeda /></strong></p>
                      <p>
                        Saldo:{" "}
                        <strong className="text-green-700">
                          {saldoAtual}<Moeda />
                        </strong>
                      </p>
                      <p>Próximo pague: <strong>{faltaParaPagar}<Moeda /></strong></p>
                    </div>

                    {/* INPUTS + BOTÕES */}
                    <div className="flex flex-wrap md:flex-nowrap items-center gap-2 mb-3">
                      <input
  type="number"
  placeholder="Valor"
  value={valoresJogadores[j.id] || ""}
  disabled={!isAdmin}
  onChange={(e) =>
    setValoresJogadores({
      ...valoresJogadores,
      [j.id]: e.target.value,
    })
  }
  className={`
    flex-1 min-w-[120px] p-2 rounded text-sm border
    ${
      isAdmin
        ? "border-[#d9b97a] bg-[#fffdf8] text-[#6b5b4a]"
        : "border-gray-300 bg-gray-200 text-gray-400 cursor-not-allowed"
    }
  `}
/>

                      
                      <input
  type="text"
  placeholder="Descrição (Opcional)"
  value={descricoes[j.id] || ""}
  disabled={!isAdmin}
  onChange={(e) =>
    setDescricoes({ ...descricoes, [j.id]: e.target.value })
  }
  className={`
    flex-1 min-w-[180px] p-2 rounded text-sm border
    ${
      isAdmin
        ? "border-[#d9b97a] bg-[#fffdf8] text-[#6b5b4a]"
        : "border-gray-300 bg-gray-200 text-gray-400 cursor-not-allowed"
    }
  `}
/>



                      {/* ➕ */}
                      {isAdmin && (
                      <button
                        onClick={() => adicionarValor(j.id)}
                        className="
                          w-10 h-10 bg-[#8ecd8a] border border-[#6cab68]
                          text-white rounded shadow-[0_3px_0_#558c55]
                        "
                        title="Adicionar valor"
                      >
                        ➕
                      </button>
                      )}

                      {/* 💸 */}
                      {isAdmin && (
                      <button
                        onClick={() => pagarComSaldo(j.id)}
                        className="
                          w-10 h-10 bg-[#f3cc5c] border border-[#d2a84a]
                          text-white rounded shadow-[0_3px_0_#b28c3a]
                        "
                        title="Pagar com saldo"
                      >
                        💸
                      </button>
                      )}

                      {/* 👁 */}
                      <button
                        onClick={() => toggleMovs(j.id)}
                        className="
                          w-10 h-10 bg-[#6b81ad] border border-[#4f6285]
                          text-white rounded shadow-[0_3px_0_#4a5976]
                        "
                        title="Ver movimentações"
                      >
                        👁
                      </button>
                    </div>

                    {/* MOVIMENTAÇÕES */}
                    {movsAbertas[j.id] && (
                      <div className="mt-3 bg-[#fffdf8] p-3 rounded border border-[#e1d2b5]">
                        <h4 className="font-semibold text-[#6b5b4a] mb-1">
                          Movimentações
                        </h4>

                        <ul className="text-sm text-[#6b5b4a] space-y-1 max-h-40 overflow-y-auto">
                          {movsJogadores[j.id]?.map((m) => (
                            <li
                              key={m.id}
                              className="flex justify-between border-b border-[#e8dcc3] py-1"
                            >
                              <div>
                                +{m.valor} 💰{" "}
                                {m.descricao && (
                                  <span className="text-gray-600">({m.descricao})</span>
                                )}
                                {m.entradaComPague && (
                                  <span className="text-red-600 ml-1">(PAGUE x2)</span>
                                )}
                              </div>
                              {isAdmin && (
                              <button
                                onClick={() =>
                                  setModalExcluirMov({
                                    movId: m.id,
                                    jogadorId: j.id,
                                    valor: m.valor,
                                  })
                                }
                                className="text-red-500 hover:text-red-700"
                                title="Excluir movimentação"
                              >
                                ✖
                              </button>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* ============================ */}
        {/* DIREITA — PAINÉIS */}
        {/* ============================ */}
        <div className="w-[40%] flex flex-col gap-10 mt-14">
          <h2 className="text-4xl habbo-3d mb-2 text-center">Gerenciar</h2>

          {/* INFORMAÇÕES DO JOGO */}
          <div className="bg-[#fff8e8] p-6 rounded-xl border-[3px] border-[#d9b97a] shadow-[0_3px_0_#b09055]">
            <h2 className="text-xl font-semibold mb-4 text-[#6b5b4a]">
              Informações Gerais
            </h2>

            <p className="text-[#6b5b4a] mb-2">
              Valor inicial: <strong>{jogo.valorInicial}<Moeda /></strong>
            </p>

            <p className="text-[#6b5b4a] mb-2">
              Total pagues: <strong>{jogo.totalSemValorPremio}<Moeda /></strong>
            </p>

            <p className="text-[#6b5b4a] mb-2">
              Total acumulado: <strong>{jogo.totalSemValorPremio+jogo.valorInicial}<Moeda /></strong>
            </p>

{/* BLOCO DE VALORES */}
<div className="mt-4">
  <h3 className="text-lg font-semibold mb-3 text-[#6b5b4a]">
    Valores
  </h3>

  <div className="space-y-3">
    <p className="p-3 bg-[#ffeebc] border border-[#d9b97a] rounded shadow">
      Pague: <strong>{jogo.valorPagamentoRodada}<Moeda /></strong>
    </p>

    <p className="p-3 bg-[#66CDAA] border border-[#5F9EA0] rounded shadow">
      Entrar (Início):{" "}
      <strong>{Math.round(jogo.valorPagamentoRodada * 2)}<Moeda /></strong>
    </p>

    <p className="p-3 bg-[#F08080] border border-[#CD5C5C] rounded shadow">
      Entrar (Final):{" "}
      <strong>{Math.round(jogo.valorPagamentoRodada * 2.5)}<Moeda /></strong>
    </p>
  </div>
</div>

            {isAdmin && (
            <p className="mt-3 text-[#6b5b4a]">
              Ganhador: <strong>{jogo.lucroGanhador}<Moeda /></strong>
            </p>
            )}

            {isAdmin && (
            <p className="text-[#6b5b4a]">
              Host: <strong>{jogo.lucroHost}<Moeda /></strong>
            </p>
            )}
          </div>

          {/* ADICIONAR JOGADOR */}
          {isAdmin && (
          <div className="bg-[#fff8e8] p-5 rounded-xl border-[3px] border-[#d9b97a] shadow-[0_3px_0_#b09055]">
            <h2 className="text-xl font-semibold mb-3 text-[#6b5b4a]">
              Adicionar Jogador
            </h2>

            <input
              placeholder="Nome do jogador"
              value={novoJogador}
              onChange={(e) => setNovoJogador(e.target.value)}
              className="w-full p-2 border border-[#d9b97a] rounded bg-[#fffdf8] mb-3"
            />

            <label className="flex items-center gap-2 text-sm mb-3 text-[#6b5b4a]">
  <input
    type="checkbox"
    checked={entrouComPague}
    onChange={(e) => setEntrouComPague(e.target.checked)}
    className="w-4 h-4"
  />
  PAGOU PRA ENTRAR?
</label>

{entrouComPague && (
  <input
    type="number"
    placeholder="Valor pago para entrar"
    value={valorEntrada}
    onChange={(e) => setValorEntrada(e.target.value)}
    className="w-full p-2 border border-[#d9b97a] rounded bg-[#fffdf8] mb-4"
  />
)}

            <button
              onClick={adicionarJogador}
              className="
                w-full bg-[#7fa7e0] border border-[#5c7eb0] text-white
                py-2 rounded shadow-[0_3px_0_#54739e]
              "
            >
              Adicionar
            </button>
          </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Jogo;
