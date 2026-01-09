/**
 * @file Login Form Component
 * @description Authentication form for staff/admin login
 * 
 * This component handles:
 * - User authentication via username/password
 * - JWT token storage (access + refresh tokens)
 * - Role-based routing (admin/kitchen/staff)
 * - Language switching
 * - Error handling and display
 * - Loading states
 * 
 * State management:
 * - Local state for form inputs
 * - Local state for error and loading
 * - localStorage for token persistence
 * - Cookie for SSR token access
 * 
 * Features:
 * - Form validation
 * - Role-based redirect
 * - Token storage (localStorage + cookie)
 * - Language toggle
 * - Error messages
 * 
 * @module components/common/LoginForm
 * @requires react
 * @requires next/navigation
 * @requires lucide-react
 * 
 * @see {@link AdminDashboard} for admin destination
 * @see {@link StaffDashboard} for staff destination
 * @see {@link KitchenDashboard} for kitchen destination
 */

"use client";

import { authService } from "@/services/authService";
import { logger } from "@/lib/logger";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, LogIn, UtensilsCrossed, Globe } from "lucide-react";
import type { Dictionary } from "@/locales/dictionary";
import Link from "next/link";
import { ROLE } from "@/config/enums";

/**
 * Login Form Component
 * 
 * Handles user authentication and role-based routing.
 * Stores JWT tokens for session management.
 * 
 * @param props - Component props
 * @param props.dict - Internationalization dictionary
 * @param props.lang - Current language code
 * @returns JSX.Element
 * 
 * @example
 * <LoginForm dict={dictionary} lang="th" />
 */
export default function LoginForm({ 
  dict, 
  lang 
}: { 
  dict: Dictionary, 
  lang: string 
}) {
  // Router for navigation after login
  const router = useRouter();
  // Form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Language toggle
  const toggleLang = lang === 'en' ? 'th' : 'en';

  /**
   * Handle login form submission
   * Authenticates user and redirects based on role
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authService.login(username, password);

      if (data.status === 'success' && data.data) {
        // Response format: { status: 'success', data: { accessToken, refreshToken, user } }
        const { accessToken, refreshToken, user } = data.data as { accessToken: string; refreshToken: string; user: { role: string } };
        
        // Store both access token and refresh token
        localStorage.setItem("token", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
        
        document.cookie = `token=${accessToken}; path=/; max-age=86400; SameSite=Lax`;

        if (user.role === ROLE.ADMIN) {
            router.push(`/${lang}/admin`);
        } else if (user.role === ROLE.KITCHEN) {
            router.push(`/${lang}/kitchen`);
        } else {
            router.push(`/${lang}/staff`);
        }

      } else {
        // Error format: { status: 'error', message: '...' }
        setError(data.message || dict.auth.loginFailed);
      }
    } catch (err) {
      logger.error("Login error:", err);
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
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">{dict.auth.username}</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-400" size={18} />
              <input 
                id="username"
                name="username"
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
                required
                aria-label="Username"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">{dict.auth.password}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
              <input 
                id="password"
                name="password"
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
                required
                aria-label="Password"
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            aria-label="Login button"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg transition-all flex justify-center items-center gap-2 shadow-md disabled:bg-slate-400"
          >
            {loading ? dict.auth.loggingIn : <><LogIn size={20} /> {dict.auth.loginBtn}</>}
          </button>
        </form>
      </div>
    </div>
  );
}