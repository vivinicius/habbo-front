import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import AuthButton from "../components/AuthButton";

function Home() {
  const [jogos, setJogos] = useState([]);
  const [nome, setNome] = useState("");
  const [valorInicial, setValorInicial] = useState("");
  const [percentualPague, setPercentualPague] = useState("");
  const { isAdmin } = useAuth();

  const [modalExcluir, setModalExcluir] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    carregarJogos();
  }, []);

  const carregarJogos = async () => {
    try {
      const res = await api.get("/jogos");
      setJogos(res.data);
    } catch (err) {
      console.error("Erro ao buscar jogos", err);
    }
  };

  const criarJogo = async (e) => {
    e.preventDefault();

    if (!percentualPague || percentualPague <= 0) {
      return alert("Informe um percentual válido para o PAGUE!");
    }

    try {
      await api.post("/jogos", {
        nome,
        valorInicial,
        percentualPague: Number(percentualPague),
      });

      setNome("");
      setValorInicial("");
      setPercentualPague("");
      carregarJogos();
    } catch (err) {
      console.error("Erro ao criar jogo", err);
      alert("Erro ao criar jogo.");
    }
  };

  const confirmarExcluir = async () => {
    if (!modalExcluir) return;

    try {
      await api.delete(`/jogos/${modalExcluir.id}`);
      setModalExcluir(null);
      carregarJogos();
    } catch (err) {
      console.error("Erro ao excluir jogo", err);
      alert("Não foi possível excluir o jogo.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f3eadd] p-8">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-6xl habbo-3d select-none">JOGOS</h1>
        <AuthButton />
      </div>

      {/* MENSAGEM VISITANTE */}
      {!isAdmin && (
        <div
          className="
            max-w-3xl mx-auto mb-10 text-center
            bg-[#fff8e8] border-[3px] border-[#d9b97a]
            rounded-xl p-4 shadow-[0_3px_0_#b09055]
          "
        >
          <p className="text-[#6b5b4a] text-lg">
            👀 <strong>Bem-vindo!</strong> Você está visualizando como visitante.
          </p>
          <p className="text-[#6b5b4a] text-sm mt-1">
            Faça login para gerenciar jogos e jogadores.
          </p>
        </div>
      )}

      {/* LISTA DE JOGOS */}
      <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {jogos.map((j) => (
          <div
            key={j.id}
            className="
              relative bg-[#fff8e8] p-5 rounded-xl border-[4px] border-[#d9b97a]
              shadow-[0_4px_0_#b09055] hover:shadow-[0_6px_0_#a08044]
              transition
            "
          >
            {/* EXCLUIR */}
            {isAdmin && (
              <button
                onClick={() => setModalExcluir({ id: j.id, nome: j.nome })}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xl"
                title="Excluir jogo"
              >
                ✖
              </button>
            )}

            <h2 className="text-2xl font-semibold text-[#6b5b4a] mb-2">
              {j.nome}
            </h2>

            <p className="text-[#6b5b4a]">
              Valor inicial: <strong>{j.valorInicial} 💰</strong>
            </p>

            <p className="text-[#6b5b4a]">
              Percentual Pague: <strong>{j.percentualPague}%</strong>
            </p>

            <button
              onClick={() => navigate(`/jogos/${j.id}`)}
              className="
                w-full mt-4 bg-[#7fa7e0] border border-[#5c7eb0] py-2
                text-white rounded shadow-[0_3px_0_#54739e]
                hover:translate-y-[1px] transition
              "
            >
              {isAdmin ? "Gerenciar" : "Visualizar"}
            </button>
          </div>
        ))}
      </div>

      {/* DIVISÃO */}
      <div className="max-w-3xl mx-auto my-12 border-t-4 border-[#d9b97a] shadow-[0_3px_0_#b09055]" />

      {/* CRIAR JOGO (ADMIN) */}
      {isAdmin && (
        <div
          className="
            max-w-xl mx-auto bg-[#fff8e8] p-6 rounded-xl border-[4px] border-[#d9b97a]
            shadow-[0_4px_0_#b09055]
          "
        >
          <h2 className="text-3xl font-bold habbo-3d mb-4 text-center">
            Criar Novo Jogo
          </h2>

          <form className="flex flex-col gap-4" onSubmit={criarJogo}>
            <input
              type="text"
              placeholder="Nome do jogo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="p-3 border border-[#d9b97a] rounded bg-[#fffdf8]"
            />

            <input
              type="number"
              placeholder="Valor inicial"
              value={valorInicial}
              onChange={(e) => setValorInicial(e.target.value)}
              className="p-3 border border-[#d9b97a] rounded bg-[#fffdf8]"
            />

            <input
              type="number"
              placeholder="Percentual do Pague (%)"
              value={percentualPague}
              onChange={(e) => setPercentualPague(e.target.value)}
              className="p-3 border border-[#d9b97a] rounded bg-[#fffdf8]"
            />

            <button
              type="submit"
              className="
                w-full bg-[#8ecd8a] border border-[#6cab68] text-white 
                py-3 text-lg rounded shadow-[0_3px_0_#558c55]
              "
            >
              Criar Jogo
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Home;
