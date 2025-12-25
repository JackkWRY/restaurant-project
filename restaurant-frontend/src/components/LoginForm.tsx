"use client";

import { API_URL } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, LogIn, UtensilsCrossed, Globe } from "lucide-react";
import type { Dictionary } from "@/locales/dictionary";
import Link from "next/link";
import { ROLE } from "@/config/enums";

export default function LoginForm({ 
  dict, 
  lang 
}: { 
  dict: Dictionary, 
  lang: string 
}) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleLang = lang === 'en' ? 'th' : 'en';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Store both access token and refresh token
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        document.cookie = `token=${data.accessToken}; path=/; max-age=86400; SameSite=Lax`;

        if (data.user.role === ROLE.ADMIN) {
            router.push(`/${lang}/admin`);
        } else if (data.user.role === ROLE.KITCHEN) {
            router.push(`/${lang}/kitchen`);
        } else {
            router.push(`/${lang}/staff`);
        }

      } else {
        setError(data.error || dict.auth.loginFailed);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(dict.common.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 relative">
      
      <Link 
        href={`/${toggleLang}/login`}
        className="absolute top-4 right-4 flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm hover:shadow-md transition-all text-sm font-bold text-slate-600"
      >
        <Globe size={16} /> {dict.common.switchLang}
      </Link>

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-slate-200">
        <div className="text-center mb-8">
          <div className="bg-slate-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
             <UtensilsCrossed className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">{dict.auth.title}</h1>
          <p className="text-slate-500 text-sm mt-1">{dict.auth.subtitle}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{dict.auth.username}</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-400" size={18} />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{dict.auth.password}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg transition-all flex justify-center items-center gap-2 shadow-md disabled:bg-slate-400"
          >
            {loading ? dict.auth.loggingIn : <><LogIn size={20} /> {dict.auth.loginBtn}</>}
          </button>
        </form>
      </div>
    </div>
  );
}