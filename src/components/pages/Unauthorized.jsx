import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text 8xl mb-6">🚫</div>

        <h1 className="text-4xl font-semibold text-gray-900 font-sora mb-3">
          403-Unauthorized
        </h1>
        <p className="text-gray-400 text-sm mb-2">
          You don't have permission to access this page.
        </p>
        <p className="text-gray-400 text-sm mb-8">
          Please contact your administrator if it's a mistake.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 bg-[#e8533a] hover:bg-[#d4472f] text-white font-semibold"
          >
            ← Go to DashBoard.
          </button>
        </div>
      </div>
    </div>
  );
}
