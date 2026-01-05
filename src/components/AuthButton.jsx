import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function AuthButton() {
  const { isLogged, logout, user } = useAuth();
  const navigate = useNavigate();

  if (!isLogged) {
    return (
      <button
        onClick={() => navigate("/login")}
        className="
          bg-[#7fa7e0] border border-[#5c7eb0] text-white
          px-4 py-2 rounded shadow-[0_3px_0_#54739e]
        "
      >
        Login
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-[#6b5b4a] text-sm">
        {user.username}
      </span>

      <button
        onClick={() => {
          logout();
          navigate("/");
        }}
        className="
          bg-[#e57373] border border-[#b94f4f] text-white
          px-4 py-2 rounded shadow-[0_3px_0_#a23c3c]
        "
      >
        Logout
      </button>
    </div>
  );
}
