import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const ROLES = {
  ADMIN: "ADMIN",
  SALES_MANAGER: "SALES MANAGER",
  PURCHASE_MANAGER: "PURCHASE MANAGER",
};

function RoleDropdown({ onChange }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const handleRole = (role, checked) => {
    const next = checked ? role : "";
    setSelected(next);
    onChange(next);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full border border-gray-200 px-4 py-3 rounded-xl text-sm flex items-center justify-between outline-none focus:border-[#e8533a] transition-colors bg-white"
      >
        <span className={!selected ? "text-gray-300" : "text-gray-900"}>
          {selected ? ROLES[selected] : "Select a role"}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {Object.entries(ROLES).map(([key, value]) => (
            <label
              key={key}
              className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input
                type="radio"
                name="role"
                checked={selected === key}
                onChange={(e) => handleRole(key, e.target.checked)}
                className="mt-1 cursor-pointer accent-[#e8533a]"
              />
              <div>
                <p className="text-sm font-medium text-gray-800">{value}</p>
                <p className="text-xs text-gray-400">
                  {key === "ADMIN"
                    ? "Full system access"
                    : key === "SALES_MANAGER"
                      ? "Manages sales and orders"
                      : "Manages procurement"}
                </p>
              </div>
            </label>
          ))}
        </div>
      )}

      {selected && (
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="text-xs bg-orange-50 text-[#e8533a] border border-orange-200 rounded-lg px-2.5 py-1 font-medium">
            {ROLES[selected]}
          </span>
        </div>
      )}
    </div>
  );
}

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    role: "",
  });

  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");

    if (!form.name || !form.email || !form.password || !form.confirm) {
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

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!form.role) {
      setError("Please select a role.");
      return;
    }

    try {
      const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");

      const emailExists = existingUsers.find((u) => u.email === form.email);
      if (emailExists) {
        setError("Email already registered. Please login.");
        return;
      }

      const newUser = {
        id: Date.now(),
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      };

      existingUsers.push(newUser);
      localStorage.setItem("users", JSON.stringify(existingUsers));

      const existingRoles = JSON.parse(localStorage.getItem("roles") || "[]");
      const roleLevel = {
        ADMIN: "Admin",
        SALES_MANAGER: "Moderator",
        PURCHASE_MANAGER: "User",
      };

      const roleEntry = {
        id: Date.now() + 1,
        roleName: form.name,
        description: form.email,
        level: roleLevel[form.role],
        status: "Active",
      };

      existingRoles.push(roleEntry);
      localStorage.setItem("roles", JSON.stringify(existingRoles));

      navigate("/login");
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-2">Create Account</h1>
        <p className="text-sm text-gray-400 mb-6">
          Start managing your inventory
        </p>

        {error && (
          <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-xl mb-4 border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            autoComplete="off"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8533a]"
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            autoComplete="off"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8533a]"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-16 text-sm outline-none focus:border-[#e8533a]"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              autoComplete="new-password"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-16 text-sm outline-none focus:border-[#e8533a]"
            />
            <button
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500"
            >
              {showConfirm ? "Hide" : "Show"}
            </button>
          </div>

          <RoleDropdown
            onChange={(role) => setForm((prev) => ({ ...prev, role: role }))}
          />

          <button
            onClick={handleSubmit}
            className="w-full bg-[#e8533a] hover:bg-[#d4472f] text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            Create Account
          </button>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-[#e8533a] font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
