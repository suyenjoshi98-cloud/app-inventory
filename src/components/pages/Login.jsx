import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const pendingMessage = location.state?.message || "";

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    setError("");

    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!form.email.endsWith("@gmail.com")) {
      setError("Only @gmail.com addresses are allowed.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const users = JSON.parse(localStorage.getItem("users") || "[]");

      if (users.length === 0) {
        setError("No account found. Please sign up first.");
        return;
      }

      const matchedUser = users.find(
        (u) => u.email === form.email && u.password === form.password,
      );

      if (!matchedUser) {
        setError("Incorrect email or password.");
        return;
      }
      console.log("User status:", matchedUser.status);
      console.log("Status check:", matchedUser.status === "Inactive");

      // Block pending users
      if (matchedUser.status === "pending") {
        setError("Your account is pending admin approval. Please wait.");
        return;
      }

      // Block explicitly rejected users
      if (matchedUser.status === "rejected") {
        setError("Your account has been rejected. Contact the administrator.");
        return;
      }

      // Block InActive user as a deactivate

      if (
        matchedUser.status === "inactive" ||
        matchedUser.status === "Inactive"
      ) {
        setError(
          "Your account has been deactivated. Contact the administrator.",
        );
        return;
      }

      localStorage.setItem("user", JSON.stringify(matchedUser));
      localStorage.setItem("isLoggedIn", "true");

      navigate("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 bg-[#e8533a] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-base">SM</span>
          </div>
          <div>
            <p className="font-bold text-sm text-gray-900">StockMaster</p>
            <p className="text-[10px] text-gray-400">Inventory App</p>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back</h1>
        <p className="text-sm text-gray-400 mb-6">Sign in to your account</p>

        {/* Pending approval message from signup redirect */}
        {pendingMessage && (
          <div className="bg-amber-50 text-amber-600 text-sm px-4 py-3 rounded-xl mb-4 border border-amber-100">
            {pendingMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-xl mb-4 border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-1.5">
              Email
            </label>
            <input
              type="email"
              placeholder="you@gmail.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8533a] transition-colors placeholder-gray-300"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-1.5">
              Password
            </label>
            <div className="relative w-full border border-gray-200 rounded-xl focus-within:border-[#e8533a] transition-colors">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 pr-16 text-sm outline-none bg-transparent rounded-xl"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <span className="text-sm text-[#e8533a] cursor-pointer hover:underline">
              Forgot password?
            </span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#e8533a] hover:bg-[#d4472f] text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </div>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400">or continue with</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <button className="w-full border border-gray-200 rounded-xl py-3 text-sm text-gray-600 font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Google
        </button>

        <p className="text-center text-sm text-gray-400 mt-6">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-[#e8533a] font-semibold hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
