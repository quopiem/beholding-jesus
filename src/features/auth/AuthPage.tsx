import React, { useState, useEffect } from 'react';
import { 
  Shield, Lock, User, KeyRound, CheckCircle2, AlertCircle, 
  Eye, EyeOff, ArrowRight, Sparkles, HelpCircle, UserPlus, LogIn, Heart,
  Smartphone, Download
} from 'lucide-react';
import { AuthService } from '../../services/authService';
import { CHURCH_INFO } from '../../services/churchInfo';
import { UserProfile, RegistrationData } from '../../types';
import { DownloadAppModal } from '../../components/DownloadAppModal';

interface AuthPageProps {
  onAuthSuccess: (user: UserProfile) => void;
  initialTab?: 'login' | 'register' | 'recovery';
}

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
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Registration Form State
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regShowPassword, setRegShowPassword] = useState(false);
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

  // -------------------------------------------------------------
  // HANDLER: LOGIN WORKFLOW
  // -------------------------------------------------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginUsername.trim() || !loginPassword) {
      setLoginError('Please enter both your username and password.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const result = await AuthService.login(loginUsername, loginPassword);
      if (result.success && result.user) {
        onAuthSuccess(result.user);
      } else {
        setLoginError(result.error || 'Invalid username or password. Please try again.');
      }
    } catch {
      setLoginError('An unexpected authentication error occurred.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // -------------------------------------------------------------
  // HANDLER: REGISTRATION WORKFLOW
  // -------------------------------------------------------------
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegErrors({});

    const data: RegistrationData = {
      fullName: regFullName.trim(),
      username: regUsername.trim(),
      password: regPassword,
      confirmPassword: regConfirmPassword
    };

    const validation = AuthService.validateRegistration(data);
    if (!validation.valid) {
      setRegErrors(validation.errors);
      return;
    }

    setIsRegistering(true);
    try {
      const res = await AuthService.register(data);
      if (res.success && res.user) {
        // Step 9: Redirect the member to the login tab with pre-filled username
        setTab('login');
        setLoginUsername(data.username.toLowerCase());
        setLoginPassword('');
        setRegSuccessBanner(`Account @${data.username} created successfully with Church Member role. Please sign in below.`);
        // Reset registration form
        setRegFullName('');
        setRegUsername('');
        setRegPassword('');
        setRegConfirmPassword('');
      } else {
        setRegErrors({ form: res.error || 'Failed to create church identity.' });
      }
    } catch {
      setRegErrors({ form: 'An unexpected error occurred during account creation.' });
    } finally {
      setIsRegistering(false);
    }
  };

  // -------------------------------------------------------------
  // HANDLER: ACCOUNT RECOVERY WORKFLOW
  // -------------------------------------------------------------
  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRecResult(null);

    if (!recUsername.trim()) {
      setRecResult({ type: 'error', message: 'Please enter your church username.' });
      return;
    }

    setIsRecovering(true);
    try {
      const res = AuthService.requestAccountRecovery(recUsername, recReason);
      setRecResult({
        type: 'success',
        message: res.message
      });
      setRecReason('');
    } catch {
      setRecResult({
        type: 'error',
        message: 'Could not submit recovery request. Please try again.'
      });
    } finally {
      setIsRecovering(false);
    }
  };

  const handleSelectDemoAccount = (username: string, pass: string) => {
    setLoginUsername(username);
    setLoginPassword(pass);
    setLoginError(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F3] dark:bg-slate-950 flex flex-col justify-center items-center px-4 py-8 sm:py-12 transition-colors">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-radial-gradient from-amber-100/30 dark:from-slate-900/40 via-transparent to-transparent pointer-events-none" />

      <div className="relative w-full max-w-md space-y-6 z-10">
        
        {/* Church Branding Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white dark:bg-slate-900 shadow-elevated border border-gold/30 dark:border-slate-800 p-2 mx-auto">
            <img 
              src="/icons/church-seal-gold.png" 
              alt="Beholding Jesus Church" 
              className="w-16 h-16 object-contain drop-shadow-sm" 
            />
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white uppercase tracking-wider">
            Beholding Jesus
          </h1>
          <div className="text-xs font-bold tracking-[0.25em] text-slate-400 dark:text-slate-500 uppercase">
            Church Community Platform
          </div>
          <div className="text-[11px] font-bold text-gold uppercase tracking-wider">
            {CHURCH_INFO.primaryMotto} • {CHURCH_INFO.secondaryMotto}
          </div>
        </div>

        {/* Sacred Welcome Greeting */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-gold/15 to-amber-600/10 dark:from-gold/15 dark:via-amber-500/10 dark:to-transparent border border-gold/30 p-4 text-center space-y-1.5 shadow-sm">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/20 border border-gold/30 text-gold text-[10px] font-bold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>Welcome to Beholding Jesus Church</span>
          </div>
          <h2 className="font-serif font-bold text-base sm:text-lg text-slate-900 dark:text-amber-100">
            Welcome to Our Church Family
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans max-w-sm mx-auto">
            "Grace to you and peace from God our Father and the Lord Jesus Christ."
          </p>
          <div className="text-[10px] font-serif italic text-gold/90 font-medium">
            — 1 Corinthians 1:3 • Camella Springville, Molino 3, Bacoor
          </div>
        </div>

        {/* Auth Card Container */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-elevated border border-slate-200/80 dark:border-slate-800 overflow-hidden">
          
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 p-1.5 gap-1">
            <button
              onClick={() => { setTab('login'); setLoginError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-2xl transition flex items-center justify-center gap-1.5 ${
                tab === 'login'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-soft'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              onClick={() => { setTab('register'); setRegErrors({}); setRegSuccessBanner(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-2xl transition flex items-center justify-center gap-1.5 ${
                tab === 'register'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-soft'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>

            <button
              onClick={() => { setTab('recovery'); setRecResult(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-2xl transition flex items-center justify-center gap-1.5 ${
                tab === 'recovery'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-soft'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Recovery</span>
            </button>
          </div>

          {/* ========================================================== */}
          {/* TAB 1: LOGIN FORM                                          */}
          {/* ========================================================== */}
          {tab === 'login' && (
            <div className="p-6 sm:p-8 space-y-4">
              
              {/* Success Banner */}
              {regSuccessBanner && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Registration Successful</div>
                    <div className="text-[11px] mt-0.5 leading-relaxed">{regSuccessBanner}</div>
                  </div>
                </div>
              )}

              {/* Error Banner */}
              {loginError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-bold">Sign In Notice</div>
                    <div className="text-[11px] mt-0.5 leading-relaxed">{loginError}</div>
                    {loginError.includes('locked') && (
                      <button
                        type="button"
                        onClick={() => setTab('recovery')}
                        className="mt-2 inline-flex items-center gap-1 font-bold text-rose-700 dark:text-rose-300 underline text-[11px]"
                      >
                        Request Administrator Password Reset <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Username Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      autoCapitalize="none"
                      autoCorrect="off"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="Enter username (e.g. johnmiko or member)"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setTab('recovery')}
                      className="text-[11px] text-gold hover:underline font-semibold"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={loginShowPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter secure password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition"
                    />
                    <button
                      type="button"
                      onClick={() => setLoginShowPassword(!loginShowPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {loginShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Sign In Submit Button */}
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 rounded-2xl bg-primary hover:bg-slate-800 text-white font-bold text-xs sm:text-sm tracking-wider uppercase shadow-soft transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isLoggingIn ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Church Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Demo Accounts Quick Fill Helper */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Authorized Church Accounts</span>
                  <Sparkles className="w-3 h-3 text-gold" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleSelectDemoAccount('johnmiko', 'Password123!')}
                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-gold/10 text-left transition"
                  >
                    <div className="font-bold text-slate-900 dark:text-white">John Miko</div>
                    <div className="text-[10px] text-gold font-semibold">App Owner / Finance</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectDemoAccount('danielsantos', 'Pastor2026!')}
                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-gold/10 text-left transition"
                  >
                    <div className="font-bold text-slate-900 dark:text-white">Ptr. Daniel</div>
                    <div className="text-[10px] text-slate-500">Senior Pastor</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectDemoAccount('micaramos', 'Worship2026!')}
                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-gold/10 text-left transition"
                  >
                    <div className="font-bold text-slate-900 dark:text-white">Mica Ramos</div>
                    <div className="text-[10px] text-slate-500">Worship Leader</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectDemoAccount('mariasantos', 'Member2026!')}
                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-gold/10 text-left transition"
                  >
                    <div className="font-bold text-slate-900 dark:text-white">Maria Santos</div>
                    <div className="text-[10px] text-slate-500">Regular Member</div>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 2: REGISTRATION FORM                                   */}
          {/* ========================================================== */}
          {tab === 'register' && (
            <div className="p-6 sm:p-8 space-y-4">
              
              <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-gold" />
                  <span>New Member Registration</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Join the church fellowship. Enter your real name and choose an easy username. New accounts receive standard Church Member access.
                </p>
              </div>

              {regErrors.form && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{regErrors.form}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-3.5">
                {/* 1. Full Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    1. Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="e.g. Timothy Reyes"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition"
                  />
                  {regErrors.fullName && (
                    <p className="text-[11px] text-rose-500 font-medium">{regErrors.fullName}</p>
                  )}
                </div>

                {/* 2. Unique Username */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      2. Choose Username *
                    </label>
                    {usernameStatus.checked && (
                      <span className={`text-[10px] font-bold flex items-center gap-1 ${
                        usernameStatus.available ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                      }`}>
                        {usernameStatus.available ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        <span>{usernameStatus.message}</span>
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                      @
                    </div>
                    <input
                      type="text"
                      required
                      autoCapitalize="none"
                      autoCorrect="off"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                      placeholder="timothy (3-20 letters/numbers)"
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition"
                    />
                  </div>
                  {regErrors.username && (
                    <p className="text-[11px] text-rose-500 font-medium">{regErrors.username}</p>
                  )}
                </div>

                {/* 3. Password */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      3. Create Password *
                    </label>
                    <span className="text-[10px] text-slate-400">Min 8 chars, letters & numbers</span>
                  </div>
                  <div className="relative">
                    <input
                      type={regShowPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full px-3.5 pr-10 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition"
                    />
                    <button
                      type="button"
                      onClick={() => setRegShowPassword(!regShowPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {regShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {regErrors.password && (
                    <p className="text-[11px] text-rose-500 font-medium">{regErrors.password}</p>
                  )}
                </div>

                {/* 4. Confirm Password */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Confirm Password *
                  </label>
                  <input
                    type={regShowPassword ? 'text' : 'password'}
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Re-enter password to confirm"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition"
                  />
                  {regErrors.confirmPassword && (
                    <p className="text-[11px] text-rose-500 font-medium">{regErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Submit Registration Button */}
                <button
                  type="submit"
                  disabled={isRegistering || (usernameStatus.checked && !usernameStatus.available)}
                  className="w-full mt-2 py-3 rounded-2xl bg-gold hover:bg-[#b08e57] text-slate-950 font-bold text-xs sm:text-sm tracking-wider uppercase shadow-soft transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isRegistering ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin"></div>
                      <span>Creating Church Identity...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-2 text-xs text-slate-500">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="text-gold font-bold hover:underline"
                >
                  Sign In
                </button>
              </div>

            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 3: ACCOUNT RECOVERY FORM                               */}
          {/* ========================================================== */}
          {tab === 'recovery' && (
            <div className="p-6 sm:p-8 space-y-4">
              
              <div className="text-xs text-slate-600 dark:text-slate-400 bg-amber-50/70 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-gold/30 space-y-1">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-gold-dark dark:text-gold">
                  <HelpCircle className="w-4 h-4 text-gold" />
                  <span>Pastoral Account Assistance</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  For spiritual accountability and security, password resets are verified and resolved by church pastoral leadership. Submit your username and reason below.
                </p>
              </div>

              {recResult && (
                <div className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 ${
                  recResult.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                }`}>
                  {recResult.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold">
                      {recResult.type === 'success' ? 'Request Submitted' : 'Notice'}
                    </div>
                    <div className="text-[11px] mt-0.5 leading-relaxed">{recResult.message}</div>
                  </div>
                </div>
              )}

              <form onSubmit={handleRecoverySubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Church Username *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-xs font-bold">
                      @
                    </div>
                    <input
                      type="text"
                      required
                      value={recUsername}
                      onChange={(e) => setRecUsername(e.target.value.toLowerCase())}
                      placeholder="Enter registered username"
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Reason for Recovery Request *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={recReason}
                    onChange={(e) => setRecReason(e.target.value)}
                    placeholder="e.g. Changed mobile phone and forgot password. Need access for youth fellowship."
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isRecovering}
                  className="w-full py-3 rounded-2xl bg-primary hover:bg-slate-800 text-white font-bold text-xs sm:text-sm tracking-wider uppercase shadow-soft transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isRecovering ? (
                    <span>Submitting to Pastoral Team...</span>
                  ) : (
                    <>
                      <span>Submit Recovery Request</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 text-center text-xs text-slate-500">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="text-gold font-bold hover:underline"
                >
                  Back to Sign In
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Mobile App Download Card */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl p-4 border border-gold/30 dark:border-gold/20 shadow-soft flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold/20 to-gold/10 flex items-center justify-center text-gold flex-shrink-0 shadow-inner">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                Get BJC Mobile App
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">iOS & Android</span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Install directly to your phone screen</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsDownloadModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gold hover:bg-gold/90 text-slate-900 rounded-xl font-bold text-xs shadow-sm transition active:scale-95 flex-shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 space-y-1">
          <p>© {new Date().getFullYear()} Beholding Jesus Church. All rights reserved.</p>
          <p className="text-[11px] text-slate-400/80">A place of worship, discipleship, and prayer.</p>
        </div>

      </div>

      <DownloadAppModal 
        isOpen={isDownloadModalOpen} 
        onClose={() => setIsDownloadModalOpen(false)} 
      />

    </div>
  );
};
