import { useState } from "react";
import api from "../services/api";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setErro(null);

    if (!username || !password) {
      return setErro("Informe usuário e senha");
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        username,
        password,
      });

      login(res.data);
      navigate("/");
    } catch (err) {
      console.error(err);
      setErro("Usuário ou senha inválidos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3eadd]">
      <div className="bg-[#fff8e8] p-6 rounded-xl border-[4px] border-[#d9b97a] shadow-[0_4px_0_#b09055] w-[320px]">

        {/* 🔙 BOTÃO VOLTAR (MESMO DO JOGO) */}
        <div className="flex items-center mb-4 gap-3">
          <button onClick={() => navigate("/")} className="btn-habbo-back">
            <div className="arrow"></div>
          </button>

          <h2 className="text-3xl habbo-3d text-center flex-1">
            Login
          </h2>
        </div>

        <input
          placeholder="Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 border border-[#d9b97a] rounded mb-3 bg-[#fffdf8]"
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border border-[#d9b97a] rounded mb-4 bg-[#fffdf8]"
          disabled={loading}
        />

        {erro && (
          <p className="text-red-600 text-sm mb-3 text-center">
            {erro}
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className={`
            w-full text-white py-2 rounded shadow
            ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#7fa7e0] hover:bg-[#6d95cf]"
            }
          `}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </div>
    </div>
  );
}

export default Login;
