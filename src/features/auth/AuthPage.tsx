import React, { useState, useEffect } from 'react';
import { 
  Shield, Lock, User, CheckCircle2, AlertCircle, 
  Eye, EyeOff, ArrowRight, Sparkles, HelpCircle,
  Smartphone, Download, Clock, Users
} from 'lucide-react';
import { AuthService } from '../../services/authService';
import { CHURCH_INFO } from '../../services/churchInfo';
import { UserProfile, RegistrationData } from '../../types';
import { DownloadAppModal } from '../../components/DownloadAppModal';

interface AuthPageProps {
  onAuthSuccess: (user: UserProfile) => void;
  initialTab?: 'login' | 'register' | 'recovery';
}

// Vector emblem matching the Holy Bible, White Dove & Gold Halo
const ChurchDoveEmblem: React.FC<{ className?: string }> = ({ className = 'w-14 h-12' }) => (
  <svg viewBox="0 0 100 80" className={`${className} shrink-0 drop-shadow-[0_4px_12px_rgba(229,179,88,0.45)]`} fill="none">
    <defs>
      <linearGradient id="bjcGoldHalo" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="50%" stopColor="#E5B358" />
        <stop offset="100%" stopColor="#B47B25" />
      </linearGradient>
      <linearGradient id="bjcDoveShade" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#E2E8F0" />
      </linearGradient>
    </defs>
    {/* Glowing Gold Halo Arc */}
    <path
      d="M 16 34 A 36 36 0 0 1 84 34"
      stroke="url(#bjcGoldHalo)"
      strokeWidth="3.2"
      strokeLinecap="round"
      fill="none"
      opacity="0.95"
    />
    {/* Holy Spirit White Dove */}
    <path
      d="M 50 14 C 54 18 64 16 72 21 C 66 23 60 24 56 26 C 59 29 65 34 63 38 C 58 35 54 32 50 30 C 46 32 42 35 37 38 C 35 34 41 29 44 26 C 40 24 34 23 28 21 C 36 16 46 18 50 14 Z"
      fill="url(#bjcDoveShade)"
      stroke="url(#bjcGoldHalo)"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    {/* Open Holy Bible Pages */}
    <path
      d="M 50 44 C 40 40 24 40 12 45 C 12 51 24 49 50 54 C 76 49 88 51 88 45 C 76 40 60 40 50 44 Z"
      fill="#FFFFFF"
      stroke="url(#bjcGoldHalo)"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    <path
      d="M 12 45 L 12 53 C 24 48 40 48 50 53 C 60 48 76 48 88 53 L 88 45"
      stroke="url(#bjcGoldHalo)"
      strokeWidth="2.2"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Center Spine */}
    <line x1="50" y1="44" x2="50" y2="54" stroke="url(#bjcGoldHalo)" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

export const AuthPage: React.FC<AuthPageProps> = ({
  onAuthSuccess,
  initialTab = 'login'
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'recovery'>(initialTab);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // Login Form State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginShowPassword, setLoginShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    try {
      return localStorage.getItem('bjc_remember_me') === 'true';
    } catch {
      return true;
    }
  });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Registration Form State
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [regRole, setRegRole] = useState<'regular_member' | 'ministry_member'>('regular_member');
  const [regMinistryId, setRegMinistryId] = useState<'ministry-worship' | 'ministry-usher' | 'ministry-multimedia'>('ministry-worship');
  const [regMinistryMessage, setRegMinistryMessage] = useState('');
  const [pendingApprovalUser, setPendingApprovalUser] = useState<UserProfile | null>(null);
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});
  const [usernameStatus, setUsernameStatus] = useState<{ checked: boolean; available: boolean; message?: string }>({
    checked: false,
    available: false
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [regSuccessBanner, setRegSuccessBanner] = useState<string | null>(null);

  // Recovery Form State
  const [recUsername, setRecUsername] = useState('');
  const [recReason, setRecReason] = useState('');
  const [recResult, setRecResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);

  // Load remembered username on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('bjc_saved_username');
      if (savedUser && rememberMe) {
        setLoginUsername(savedUser);
      }
    } catch {}
  }, []);

  // Real-time username availability check on registration
  useEffect(() => {
    if (!regUsername.trim()) {
      setUsernameStatus({ checked: false, available: false });
      return;
    }

    const timer = setTimeout(() => {
      const check = AuthService.checkUsernameAvailability(regUsername);
      setUsernameStatus({
        checked: true,
        available: check.available,
        message: check.available ? 'Username is available' : check.error
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [regUsername]);

  // Scroll to top when switching tabs
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [tab]);

  // -------------------------------------------------------------
  // HANDLER: LOGIN
  // -------------------------------------------------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setPendingApprovalUser(null);

    if (!loginUsername.trim() || !loginPassword) {
      setLoginError('Please enter both your username and password.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const result = await AuthService.login(loginUsername, loginPassword);
      if (result.success && result.user) {
        // Save remember-me state
        try {
          if (rememberMe) {
            localStorage.setItem('bjc_remember_me', 'true');
            localStorage.setItem('bjc_saved_username', loginUsername.trim());
          } else {
            localStorage.removeItem('bjc_remember_me');
            localStorage.removeItem('bjc_saved_username');
          }
        } catch {}

        onAuthSuccess(result.user);
      } else if (result.isPendingApproval && result.user) {
        setPendingApprovalUser(result.user);
      } else {
        setLoginError(result.error || 'Invalid username or password. Please try again.');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'A network error occurred while signing in.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // -------------------------------------------------------------
  // HANDLER: REGISTRATION
  // -------------------------------------------------------------
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegErrors({});
    setRegSuccessBanner(null);

    const errors: Record<string, string> = {};
    if (!regFullName.trim() || regFullName.trim().length < 3) {
      errors.fullName = 'Full Name must be at least 3 characters.';
    }
    if (!regUsername.trim() || regUsername.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters.';
    }
    if (!regPassword || regPassword.length < 8) {
      errors.password = 'Password must be at least 8 characters with numbers.';
    }
    if (regPassword !== regConfirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setRegErrors(errors);
      return;
    }

    setIsRegistering(true);
    try {
      const regData: RegistrationData = {
        fullName: regFullName.trim(),
        username: regUsername.trim().toLowerCase(),
        password: regPassword,
        confirmPassword: regConfirmPassword,
        role: regRole,
        targetMinistryId: regRole === 'ministry_member' ? regMinistryId : undefined,
        ministryMessage: regRole === 'ministry_member' ? regMinistryMessage.trim() : undefined
      };

      const result = await AuthService.register(regData);

      if (result.success && result.user) {
        if (result.isPendingApproval) {
          setPendingApprovalUser(result.user);
          setTab('login');
        } else {
          setRegSuccessBanner('Welcome! Your church account has been created. You can sign in immediately.');
          setLoginUsername(regUsername.trim().toLowerCase());
          setLoginPassword(regPassword);
          setTab('login');
        }
      } else {
        setRegErrors({ form: result.error || 'Failed to complete registration.' });
      }
    } catch (err: any) {
      setRegErrors({ form: err?.message || 'Error communicating with server.' });
    } finally {
      setIsRegistering(false);
    }
  };

  // -------------------------------------------------------------
  // HANDLER: ACCOUNT RECOVERY
  // -------------------------------------------------------------
  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecResult(null);

    if (!recUsername.trim()) {
      setRecResult({ type: 'error', message: 'Please enter your church username.' });
      return;
    }

    setIsRecovering(true);
    try {
      const result = await AuthService.requestAccountRecovery(recUsername.trim(), recReason.trim());
      if (result.success) {
        setRecResult({
          type: 'success',
          message: 'Your assistance request has been submitted to the Super Administrator. Once reviewed, your access will be restored.'
        });
        setRecUsername('');
        setRecReason('');
      } else {
        setRecResult({
          type: 'error',
          message: result.message || 'Could not locate account. Please verify username.'
        });
      }
    } catch (err: any) {
      setRecResult({ type: 'error', message: err?.message || 'Network error occurred.' });
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#08150c] relative flex flex-col justify-between items-center text-white overflow-x-hidden font-sans selection:bg-[#E5B358] selection:text-[#1a1204]">
      
      {/* 1. Cinematic Background Artwork with Sunset, Cross, and Mountains */}
      <div 
        className="fixed inset-0 bg-cover bg-top sm:bg-center pointer-events-none transition-all duration-700" 
        style={{ backgroundImage: "url('/images/church_login_bg.jpg')" }} 
      />

      {/* 2. Deep Emerald Gradient & Radial Vignette for Content Contrast */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/25 via-[#06180e]/60 to-[#020b05]/95 pointer-events-none" />
      <div className="fixed inset-0 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />

      {/* 3. Main Center Content Container */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md mx-auto px-5 py-6 sm:py-8 flex flex-col justify-between min-h-screen">
        
        {/* ============================================================== */}
        {/* TOP BRANDING & LOGO                                            */}
        {/* ============================================================== */}
        <header className="pt-2 sm:pt-4 text-center space-y-2">
          
          {/* Logo with Dove & Golden Typography */}
          <div className="inline-flex items-center justify-center gap-3.5 mx-auto">
            <ChurchDoveEmblem className="w-13 h-11 sm:w-14 sm:h-12" />
            <div className="text-left border-l border-[#E5B358]/35 pl-3.5">
              <div className="text-[10px] sm:text-[11px] font-sans tracking-[0.26em] text-[#E7DECD] uppercase font-semibold">
                BEHOLDING
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-black tracking-wider text-white leading-tight drop-shadow-sm">
                JESUS
              </div>
              <div className="text-[9px] tracking-[0.35em] text-[#E5B358] font-bold uppercase flex items-center gap-1.5 mt-0.5">
                <span className="w-3.5 h-[1px] bg-[#E5B358]/60" />
                CHURCH
                <span className="w-3.5 h-[1px] bg-[#E5B358]/60" />
              </div>
            </div>
          </div>

          {/* Scripture Verse */}
          <div className="pt-1.5 space-y-0.5">
            <p className="font-serif italic text-xs sm:text-[13px] text-[#F3EAD9] font-medium tracking-wide">
              &ldquo;Fix your eyes on Jesus...&rdquo;
            </p>
            <p className="text-[11px] font-serif text-[#E5B358] font-semibold tracking-wider">
              Hebrews 12:2
            </p>
          </div>
        </header>

        {/* ============================================================== */}
        {/* CENTER CARD / ACTIVE FORM VIEW                                 */}
        {/* ============================================================== */}
        <main className="my-auto py-4 space-y-4">

          {/* ------------------------------------------------------------ */}
          {/* VIEW 1: LOGIN (EXACT DESIGN MATCH)                           */}
          {/* ------------------------------------------------------------ */}
          {tab === 'login' && (
            <div className="space-y-4 animate-fade-in">

              {/* PENDING APPROVAL NOTICE */}
              {pendingApprovalUser ? (
                <div className="p-6 rounded-3xl bg-[#081c11]/80 backdrop-blur-md border border-amber-500/40 text-center space-y-4 shadow-xl">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-[#E5B358]">
                    <Clock className="w-7 h-7 text-[#E5B358] animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-[#E5B358] font-bold uppercase tracking-wider">
                      Pending Admin Verification
                    </span>
                    <h3 className="font-serif font-bold text-xl text-white pt-1">
                      Registration Under Review
                    </h3>
                    <p className="text-xs text-[#D7CEBD] leading-relaxed max-w-xs mx-auto">
                      God bless you, <span className="font-bold text-white">{pendingApprovalUser.name}</span>. Your ministry membership request is pending confirmation by our Pastoral Team.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingApprovalUser(null);
                      setLoginPassword('');
                    }}
                    className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <>
                  {/* Greeting & Gold Cross Divider */}
                  <div className="text-center space-y-1">
                    <h1 className="font-serif font-bold text-3xl sm:text-4xl text-white tracking-wide drop-shadow-md">
                      Welcome Back!
                    </h1>
                    <p className="text-xs sm:text-sm text-[#D7CEBD] font-sans">
                      Be part of our church family.
                    </p>

                    {/* Gold Cross Divider: ——— ✝ ——— */}
                    <div className="flex items-center justify-center gap-3 pt-2 pb-1">
                      <div className="w-16 sm:w-24 h-[1px] bg-gradient-to-r from-transparent via-[#C5A46D] to-[#C5A46D]/40" />
                      <span className="text-[#E5B358] text-base leading-none select-none drop-shadow-[0_0_8px_rgba(229,179,88,0.7)] font-serif">
                        ✝
                      </span>
                      <div className="w-16 sm:w-24 h-[1px] bg-gradient-to-l from-transparent via-[#C5A46D] to-[#C5A46D]/40" />
                    </div>
                  </div>

                  {/* Success Banner */}
                  {regSuccessBanner && (
                    <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 backdrop-blur-md text-emerald-200 text-xs flex items-start gap-2.5 shadow-lg">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold">Registration Successful</div>
                        <div className="text-[11px] mt-0.5 leading-relaxed">{regSuccessBanner}</div>
                      </div>
                    </div>
                  )}

                  {/* Error Banner */}
                  {loginError && (
                    <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500/50 backdrop-blur-md text-rose-200 text-xs flex items-start gap-2.5 shadow-lg">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-bold">Sign In Notice</div>
                        <div className="text-[11px] mt-0.5 leading-relaxed">{loginError}</div>
                      </div>
                    </div>
                  )}

                  {/* Login Form */}
                  <form onSubmit={handleLogin} className="space-y-3.5">
                    
                    {/* 1. Username Field (Pill shape, dark emerald glass) */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#9FB5A6]">
                        <User className="w-5 h-5 stroke-[1.75]" />
                      </div>
                      <input
                        type="text"
                        required
                        autoCapitalize="none"
                        autoCorrect="off"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        placeholder="Username"
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#081810]/75 hover:bg-[#0b2116]/85 focus:bg-[#0c2418]/90 backdrop-blur-md border border-[#2d553d]/80 focus:border-[#E5B358] text-white placeholder:text-[#88A692] text-sm focus:outline-none focus:ring-2 focus:ring-[#E5B358]/40 transition shadow-inner"
                      />
                    </div>

                    {/* 2. Password Field (Pill shape, dark emerald glass) */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#9FB5A6]">
                        <Lock className="w-5 h-5 stroke-[1.75]" />
                      </div>
                      <input
                        type={loginShowPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-[#081810]/75 hover:bg-[#0b2116]/85 focus:bg-[#0c2418]/90 backdrop-blur-md border border-[#2d553d]/80 focus:border-[#E5B358] text-white placeholder:text-[#88A692] text-sm focus:outline-none focus:ring-2 focus:ring-[#E5B358]/40 transition shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => setLoginShowPassword(!loginShowPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#9FB5A6] hover:text-[#E0D7C6] transition cursor-pointer"
                        title={loginShowPassword ? 'Hide password' : 'Show password'}
                      >
                        {loginShowPassword ? (
                          <EyeOff className="w-5 h-5 stroke-[1.75]" />
                        ) : (
                          <Eye className="w-5 h-5 stroke-[1.75]" />
                        )}
                      </button>
                    </div>

                    {/* 3. Remember Me & Forgot Password Row */}
                    <div className="flex items-center justify-between text-xs pt-1 px-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none text-[#D7CEBD] hover:text-white transition">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded border-[#385e44] bg-[#081810]/90 text-[#E5B358] focus:ring-[#E5B358] accent-[#E5B358] cursor-pointer"
                        />
                        <span className="font-medium">Remember Me</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setTab('recovery')}
                        className="text-[#E5B358] hover:text-[#f8d48e] underline underline-offset-2 font-medium transition cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>

                    {/* 4. Main Login Button (Radiant Gold Gradient Pill) */}
                    <button
                      type="submit"
                      disabled={isLoggingIn}
                      className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#F3C675] via-[#E5B358] to-[#C78B30] hover:from-[#fbe1b3] hover:to-[#db9d41] text-[#1a1204] font-bold text-base tracking-wide shadow-[0_4px_25px_rgba(229,179,88,0.35)] hover:shadow-[0_6px_30px_rgba(229,179,88,0.5)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-1"
                    >
                      {isLoggingIn ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#1a1204]/40 border-t-[#1a1204] rounded-full animate-spin" />
                          <span>Logging in...</span>
                        </>
                      ) : (
                        <>
                          <span>Login</span>
                          <span className="text-xl leading-none font-bold">›</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* 5. Divider (or) */}
                  <div className="relative flex items-center justify-center py-1">
                    <div className="w-full border-t border-[#234330]/80" />
                    <span className="px-3 bg-transparent text-[11px] text-[#A6BDAE] uppercase tracking-widest font-semibold">
                      or
                    </span>
                    <div className="w-full border-t border-[#234330]/80" />
                  </div>

                  {/* 6. Admin Access Button (Outlined Golden Pill) */}
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = '/admin.html';
                    }}
                    className="w-full py-3 px-5 rounded-2xl border border-[#C5A46D]/60 hover:border-[#E5B358] bg-[#081810]/60 hover:bg-[#0c2317]/85 backdrop-blur-md transition-all flex items-center justify-center gap-3 group cursor-pointer shadow-soft"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#C5A46D]/15 border border-[#C5A46D]/40 text-[#E5B358] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Shield className="w-4 h-4 text-[#E5B358]" />
                    </div>
                    <div className="text-left">
                      <div className="text-white font-bold text-sm tracking-wide group-hover:text-[#F3C675] transition">
                        Admin Access
                      </div>
                      <div className="text-[10px] text-[#C5A46D]/90 italic font-serif leading-none mt-0.5">
                        For authorized administrators only
                      </div>
                    </div>
                  </button>

                  {/* 7. Register Link */}
                  <div className="text-center pt-2 text-xs text-[#D7CEBD]">
                    <span>Don&apos;t have an account? </span>
                    <button
                      type="button"
                      onClick={() => {
                        setTab('register');
                        setRegErrors({});
                        setRegSuccessBanner(null);
                      }}
                      className="font-bold text-[#E5B358] hover:text-[#f8d48e] underline underline-offset-2 transition ml-1 cursor-pointer"
                    >
                      Register Now
                    </button>
                  </div>
                </>
              )}

            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* VIEW 2: REGISTRATION                                         */}
          {/* ------------------------------------------------------------ */}
          {tab === 'register' && (
            <div className="p-5 sm:p-6 rounded-3xl bg-[#081c11]/85 backdrop-blur-md border border-[#2d553d]/80 space-y-4 animate-fade-in shadow-2xl">
              
              <div className="text-center space-y-1">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#E5B358]/20 text-[#E5B358] font-bold uppercase tracking-wider">
                  New Member Signup
                </span>
                <h2 className="font-serif font-bold text-2xl text-white">
                  Join Our Church Family
                </h2>
                <p className="text-xs text-[#D7CEBD]">
                  Connect with worship, fellowship, prayer, and discipleship.
                </p>
              </div>

              {regErrors.form && (
                <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{regErrors.form}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-3.5">
                
                {/* Role choice */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#E0D7C6]">
                    Registering As *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegRole('regular_member')}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        regRole === 'regular_member'
                          ? 'bg-[#E5B358] text-[#1a1204] border-[#E5B358] font-bold shadow-md'
                          : 'bg-[#06140b]/70 border-[#2d553d] text-[#D7CEBD] hover:border-[#E5B358]/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Users className="w-4 h-4" />
                        <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-black/15 font-semibold">Immediate</span>
                      </div>
                      <div className="text-xs font-bold mt-1">Church Member</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegRole('ministry_member')}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        regRole === 'ministry_member'
                          ? 'bg-[#E5B358] text-[#1a1204] border-[#E5B358] font-bold shadow-md'
                          : 'bg-[#06140b]/70 border-[#2d553d] text-[#D7CEBD] hover:border-[#E5B358]/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-black/15 font-semibold">Review</span>
                      </div>
                      <div className="text-xs font-bold mt-1">Ministry Member</div>
                    </button>
                  </div>
                </div>

                {/* If Ministry Member */}
                {regRole === 'ministry_member' && (
                  <div className="p-3.5 rounded-2xl bg-[#0c2417]/80 border border-[#E5B358]/40 space-y-2.5 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-[#E5B358]">
                        Choose Ministry Team *
                      </label>
                      <select
                        value={regMinistryId}
                        onChange={(e) => setRegMinistryId(e.target.value as any)}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#07150c] border border-[#2d553d] text-white text-xs outline-none"
                      >
                        <option value="ministry-worship">Worship Team (Praise & Vocals)</option>
                        <option value="ministry-usher">Ushering Team (Hospitality & Welcome)</option>
                        <option value="ministry-multimedia">Multimedia Team (Sound & Tech)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#E5B358]">
                        Heart to Serve / Note (Optional)
                      </label>
                      <textarea
                        value={regMinistryMessage}
                        onChange={(e) => setRegMinistryMessage(e.target.value)}
                        placeholder="Tell leadership about your instrument, vocals, or heart to serve..."
                        rows={2}
                        className="w-full mt-1 p-2 rounded-xl bg-[#07150c] border border-[#2d553d] text-white text-xs outline-none resize-none placeholder:text-[#6e8a77]"
                      />
                    </div>
                  </div>
                )}

                {/* Full Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#E0D7C6]">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="e.g. John Emmanuel"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#07150c] border border-[#2d553d] text-white placeholder:text-[#6e8a77] text-xs sm:text-sm focus:outline-none focus:border-[#E5B358]"
                  />
                  {regErrors.fullName && (
                    <p className="text-[10px] text-rose-400">{regErrors.fullName}</p>
                  )}
                </div>

                {/* Username */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#E0D7C6]">
                      Username *
                    </label>
                    {usernameStatus.checked && (
                      <span className={`text-[10px] font-bold ${
                        usernameStatus.available ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {usernameStatus.message}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                    placeholder="e.g. johnemmanuel (letters & numbers)"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#07150c] border border-[#2d553d] text-white placeholder:text-[#6e8a77] text-xs sm:text-sm focus:outline-none focus:border-[#E5B358]"
                  />
                  {regErrors.username && (
                    <p className="text-[10px] text-rose-400">{regErrors.username}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#E0D7C6]">
                    Password * (Min 8 chars)
                  </label>
                  <div className="relative">
                    <input
                      type={regShowPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full px-4 pr-10 py-2.5 rounded-2xl bg-[#07150c] border border-[#2d553d] text-white placeholder:text-[#6e8a77] text-xs sm:text-sm focus:outline-none focus:border-[#E5B358]"
                    />
                    <button
                      type="button"
                      onClick={() => setRegShowPassword(!regShowPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#9FB5A6]"
                    >
                      {regShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {regErrors.password && (
                    <p className="text-[10px] text-rose-400">{regErrors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#E0D7C6]">
                    Confirm Password *
                  </label>
                  <input
                    type={regShowPassword ? 'text' : 'password'}
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#07150c] border border-[#2d553d] text-white placeholder:text-[#6e8a77] text-xs sm:text-sm focus:outline-none focus:border-[#E5B358]"
                  />
                  {regErrors.confirmPassword && (
                    <p className="text-[10px] text-rose-400">{regErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Register Submit */}
                <button
                  type="submit"
                  disabled={isRegistering || (usernameStatus.checked && !usernameStatus.available)}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#F3C675] via-[#E5B358] to-[#C78B30] text-[#1a1204] font-bold text-sm tracking-wide shadow-lg hover:brightness-105 transition disabled:opacity-50 cursor-pointer mt-1"
                >
                  {isRegistering ? 'Registering Account...' : 'Complete Registration ›'}
                </button>
              </form>

              <div className="text-center pt-1 text-xs text-[#D7CEBD]">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="text-[#E5B358] font-bold hover:underline"
                >
                  Sign In Here
                </button>
              </div>

            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* VIEW 3: RECOVERY                                             */}
          {/* ------------------------------------------------------------ */}
          {tab === 'recovery' && (
            <div className="p-5 sm:p-6 rounded-3xl bg-[#081c11]/85 backdrop-blur-md border border-[#2d553d]/80 space-y-4 animate-fade-in shadow-2xl">
              
              <div className="text-center space-y-1">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#E5B358]/20 text-[#E5B358] font-bold uppercase tracking-wider">
                  Account Assistance
                </span>
                <h2 className="font-serif font-bold text-2xl text-white">
                  Reset Password
                </h2>
                <p className="text-xs text-[#D7CEBD]">
                  Pastoral administrators will verify and restore your access.
                </p>
              </div>

              {recResult && (
                <div className={`p-3 rounded-2xl text-xs flex items-start gap-2.5 ${
                  recResult.type === 'success'
                    ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/80 border border-rose-500/50 text-rose-200'
                }`}>
                  {recResult.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold">{recResult.type === 'success' ? 'Submitted' : 'Notice'}</div>
                    <div className="text-[11px] mt-0.5 leading-relaxed">{recResult.message}</div>
                  </div>
                </div>
              )}

              <form onSubmit={handleRecoverySubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#E0D7C6]">
                    Church Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={recUsername}
                    onChange={(e) => setRecUsername(e.target.value.toLowerCase())}
                    placeholder="Enter registered username"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#07150c] border border-[#2d553d] text-white placeholder:text-[#6e8a77] text-xs sm:text-sm focus:outline-none focus:border-[#E5B358]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#E0D7C6]">
                    Reason for Recovery *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={recReason}
                    onChange={(e) => setRecReason(e.target.value)}
                    placeholder="e.g. Changed phone, need access for Sunday service..."
                    className="w-full p-3 rounded-2xl bg-[#07150c] border border-[#2d553d] text-white placeholder:text-[#6e8a77] text-xs sm:text-sm focus:outline-none focus:border-[#E5B358] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isRecovering}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#F3C675] via-[#E5B358] to-[#C78B30] text-[#1a1204] font-bold text-sm tracking-wide shadow-lg hover:brightness-105 transition disabled:opacity-50 cursor-pointer"
                >
                  {isRecovering ? 'Submitting Request...' : 'Send Recovery Request ›'}
                </button>
              </form>

              <div className="text-center pt-1 text-xs text-[#D7CEBD]">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="text-[#E5B358] font-bold hover:underline"
                >
                  Back to Sign In
                </button>
              </div>

            </div>
          )}

        </main>

        {/* ============================================================== */}
        {/* FOOTER & MOBILE PWA SHORTCUT                                   */}
        {/* ============================================================== */}
        <footer className="pt-3 pb-2 text-center space-y-2.5">
          
          {/* Subtle Mobile App Promo Pill */}
          <div className="inline-flex items-center justify-between gap-3 px-3.5 py-1.5 rounded-full bg-[#081810]/70 border border-[#C5A46D]/30 backdrop-blur-md mx-auto shadow-sm">
            <div className="flex items-center gap-2 text-left">
              <Smartphone className="w-3.5 h-3.5 text-[#E5B358]" />
              <span className="text-[10px] text-[#D7CEBD]">
                Install BJC Church Mobile App
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsDownloadModalOpen(true)}
              className="text-[10px] font-bold text-[#E5B358] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Install</span>
              <Download className="w-3 h-3" />
            </button>
          </div>

          <div className="text-[10px] text-[#8AA492]/80">
            © {new Date().getFullYear()} Beholding Jesus Church • Bacoor, Cavite
          </div>
        </footer>

      </div>

      <DownloadAppModal 
        isOpen={isDownloadModalOpen} 
        onClose={() => setIsDownloadModalOpen(false)} 
      />

    </div>
  );
};
