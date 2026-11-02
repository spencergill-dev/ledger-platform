import React, { useState } from 'react';
import { Layers, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface PasswordGateProps {
  onUnlock: () => void;
}

export function PasswordGate({ onUnlock }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(false);

    const validPassword = (import.meta as any).env?.VITE_APP_PASSWORD || 'praxus2026';

    setTimeout(() => {
      if (password === validPassword) {
        localStorage.setItem('praxus_authenticated', 'true');
        onUnlock();
      } else {
        setError(true);
        setIsSubmitting(false);
      }
    }, 200);
  };

  return (
    <div className="min-h-screen w-full bg-[#0B1121] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden select-none font-sans">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-sm z-10 space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-900/50">
            <Layers className="h-6 w-6 text-white stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-cal">
              Praxus
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Institutional Strategic Intelligence
            </p>
          </div>
        </div>

        {/* Password Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-5">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 border-b border-slate-800 pb-3">
            <Lock className="h-3.5 w-3.5 text-blue-400" />
            <span>Restricted Access Environment</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Access Passcode
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(false);
                  }}
                  autoFocus
                  placeholder="Enter passcode..."
                  className={`w-full h-10 pl-3 pr-10 rounded-lg bg-slate-950/70 border ${
                    error ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-700 focus:border-blue-500 focus:ring-blue-500'
                  } text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-1.5 text-rose-400 text-xs pt-1">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>Invalid passcode. Please try again.</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!password || isSubmitting}
              className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <span>{isSubmitting ? 'Verifying...' : 'Unlock Platform'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
