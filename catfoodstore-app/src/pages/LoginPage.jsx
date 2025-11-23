import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    try {
      // ⭐ เชื่อม backend โดยตรงผ่าน port 8080
      const res = await axios.post("http://localhost:8080/api/login", {
        email,
        password,
      });

      const { id, email: userEmail, role, token } = res.data;

      // ⭐ เก็บ token ไว้ใช้กับ API อื่น ๆ
      localStorage.setItem("token", token);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", userEmail);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", id);

      alert("เข้าสู่ระบบสำเร็จ!");

      if (role === "admin") {
        navigate("/admin/products");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.log("Login error:", err);
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">
          เข้าสู่ระบบ
        </h1>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              อีเมล
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg bg-gray-50 
                focus:ring-red-300 focus:border-red-500 outline-none"
              placeholder="กรอกอีเมล"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              รหัสผ่าน
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg bg-gray-50 
                focus:ring-red-300 focus:border-red-500 outline-none"
              placeholder="กรอกรหัสผ่าน"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          <button
            type="button"
            onClick={handleLogin}
            className="w-full bg-red-600 text-white py-3 rounded-lg 
              font-semibold hover:bg-red-700 transition"
          >
            เข้าสู่ระบบ
          </button>
        </form>
      </div>
    </div>
  );
}
