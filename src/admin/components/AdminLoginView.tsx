import React, { useState } from 'react';
import { Shield, Lock, User, ArrowLeft, AlertCircle, CheckCircle2, Eye, EyeOff, Sparkles } from 'lucide-react';
import { AdminAuthService } from '../services/adminAuthService';
import { AdminUser } from '../types';

interface AdminLoginViewProps {
  onLoginSuccess: (user: AdminUser) => void;
  onGoToMemberApp: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onLoginSuccess, onGoToMemberApp }) => {
  const [identifier, setIdentifier] = useState('johnmiko');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await AdminAuthService.login(identifier, password);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setError(result.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err: any) {
      setError(err?.message || 'A network error occurred while connecting to Supabase.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F3F0] text-[#1F1D1D] flex flex-col justify-between selection:bg-[#EBDCD5] selection:text-[#1F1D1D]">
      {/* Top Bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-[#EBDCD5] bg-white/70 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img 
            src="/icons/icon-192.png" 
            alt="BJC Logo" 
            className="w-9 h-9 rounded-full object-cover ring-2 ring-[#8C5858]/30 shadow-sm"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <div>
            <div className="font-serif tracking-wider font-bold text-xs uppercase text-[#8C5858]">Beholding Jesus Church</div>
            <div className="font-sans text-xs text-[#5C5654] font-medium">Administrator Portal</div>
          </div>
        </div>

        <button
          onClick={onGoToMemberApp}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#5C5654] hover:text-[#1F1D1D] px-3 py-1.5 rounded-lg border border-[#EBDCD5] hover:bg-white transition-all shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Member App</span>
        </button>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md bg-white rounded-2xl border border-[#E8DBD4] shadow-xl p-8 sm:p-10 relative overflow-hidden">
          {/* Subtle Top Accent Bar in BJC Rose/Mauve */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#C29B9B] via-[#8C5858] to-[#603D3D]" />

          {/* Crest & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#F8F3F0] border border-[#E8DBD4] text-[#8C5858] mb-4 shadow-inner">
              <Shield className="w-8 h-8 stroke-[1.75]" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1F1D1D]">
              Super Admin Access
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6360] mt-1.5 max-w-xs mx-auto">
              Designated management console for Beholding Jesus Church announcements & media
            </p>
          </div>

          {/* Security Notice Pill */}
          <div className="mb-6 p-3 rounded-xl bg-[#FBF7F5] border border-[#EEDFD8] flex items-start gap-3">
            <Lock className="w-4 h-4 text-[#8C5858] mt-0.5 shrink-0" />
            <div className="text-xs text-[#5C5654] leading-relaxed">
              <strong className="text-[#1F1D1D] block mb-0.5">Strict Authorized Access Only</strong>
              Public administrator sign-up is disabled. Only the designated church Super Admin is permitted.
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold block">Authentication Restricted</span>
                {error}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#4A4543] mb-1.5">
                Super Admin Username / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8380]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="johnmiko or johnmiko@beholdingjesus.org"
                  className="w-full pl-10 pr-3 py-2.5 bg-[#FAF7F5] border border-[#DDD0C8] rounded-xl text-sm text-[#1F1D1D] placeholder-[#A09894] focus:outline-none focus:ring-2 focus:ring-[#8C5858]/30 focus:border-[#8C5858] transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4A4543]">
                  Admin Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8380]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your master password"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#FAF7F5] border border-[#DDD0C8] rounded-xl text-sm text-[#1F1D1D] placeholder-[#A09894] focus:outline-none focus:ring-2 focus:ring-[#8C5858]/30 focus:border-[#8C5858] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8C8380] hover:text-[#1F1D1D]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#1F1D1D] hover:bg-[#383331] disabled:bg-[#706B68] text-white font-medium text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Enter Admin Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Designate Super Admin Hint for Convenience */}
          <div className="mt-8 pt-6 border-t border-[#EFE6E1] text-center">
            <p className="text-[11px] text-[#78716E]">
              Protected with Supabase SHA-256 salted encryption and RLS server-side policies.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5ECE8] text-[#8C5858] text-[11px] font-medium border border-[#EBDCD5]">
              <Sparkles className="w-3 h-3" />
              <span>Designated Owner: John Miko Sarsalijo</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-[#827A77] border-t border-[#EBDCD5]">
        Beholding Jesus Church &copy; {new Date().getFullYear()} &mdash; Admin Management Portal
      </footer>
    </div>
  );
};
