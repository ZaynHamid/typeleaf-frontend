"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();

  const submitForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("https://typeleaf-backend--zainhamid982.replit.applogin", { 
        email, 
        password 
      });
      
      const data = response.data;

      if (data.token) {
        localStorage.setItem("token", data.token);
        router.push("/dashboard");
      } else {
        setError(data.user?.message || "Invalid credentials.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#FAFAF8] flex flex-col"
      style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
    >
      <div className="h-[3px] bg-stone-900 w-full" />

      <nav className="border-b border-stone-200 bg-[#FAFAF8]">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-xs font-bold tracking-[0.2em] uppercase text-stone-400 hover:text-stone-900 transition-colors"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            ← Home
          </Link>
          <span
            className="text-xs tracking-widest uppercase text-stone-400"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            Authentication
          </span>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <header className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-stone-900 tracking-tight mb-2">
              Welcome Back
            </h1>
            <p 
              className="text-sm text-stone-400"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              Please enter your details to sign in
            </p>
          </header>

          <form onSubmit={submitForm} className="space-y-6">
            {error && (
              <div 
                className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs text-center"
                style={{ fontFamily: "system-ui, sans-serif" }}
              >
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label 
                className="text-xs font-bold uppercase tracking-widest text-stone-500"
                style={{ fontFamily: "system-ui, sans-serif" }}
              >
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-4 py-3 text-sm rounded-xl border border-stone-200 bg-white text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-400 transition-colors"
                style={{ fontFamily: "system-ui, sans-serif" }}
              />
            </div>

            <div className="space-y-2">
              <label 
                className="text-xs font-bold uppercase tracking-widest text-stone-500"
                style={{ fontFamily: "system-ui, sans-serif" }}
              >
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 text-sm rounded-xl border border-stone-200 bg-white text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-400 transition-colors"
                style={{ fontFamily: "system-ui, sans-serif" }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 transition-all disabled:bg-stone-300 disabled:cursor-not-allowed"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              {loading ? "Verifying..." : "Sign In →"}
            </button>
          </form>

          <footer className="mt-10 text-center">
            <p 
              className="text-xs text-stone-400"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              Don't have an account?{" "}
              <Link href="/signup" className="text-stone-900 font-semibold underline underline-offset-4 hover:text-stone-600 transition-colors">
                Register here
              </Link>
            </p>
          </footer>
        </div>
      </main>

      <div className="h-[2px] bg-stone-100 w-full" />
    </div>
  );
}