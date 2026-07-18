// ============================================================
// Login Page — Supabase Auth with Magic Links
// Dev mode: instant login (VITE_AUTH_MODE=dev)
// Production: sends magic link email, user clicks to verify
// ============================================================
import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, LogIn, AlertCircle, CheckCircle, Shield, ShieldCheck, Lock, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { user, login, isLoading, authMode } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      navigate('/team', { replace: true });
    }
  }, [user, isLoading, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError('');
    setIsSubmitting(true);
    setMagicLinkSent(false);

    const result = await login(email);
    if (result.success) {
      if (result.magicLinkSent) {
        // Magic link mode: show "check your email" message
        setMagicLinkSent(true);
      } else {
        // Dev mode: instant login
        navigate('/team', { replace: true });
      }
    } else {
      setError(result.error || 'Login failed');
      setShakeKey(prev => prev + 1);
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#F43F85] mb-5 shadow-md">
            <img src="/favicon.svg" alt="Service Alignment" className="w-14 h-14 rounded-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Service Alignment GTM Workspace
          </h1>
          <p className="mt-2 text-sm text-stone-500">Sign in to access your dashboard</p>
        </div>

        {/* Login Card */}
        <motion.div
          key={shakeKey}
          animate={shakeKey > 0 ? { x: [0, -12, 12, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="bg-white border border-stone-200/60 rounded-2xl p-8 shadow-sm"
        >
          {/* Magic Link Sent Confirmation */}
          {magicLinkSent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <h2 className="text-lg font-semibold text-stone-900 mb-2">Check your email</h2>
              <p className="text-sm text-stone-500 mb-4">
                We sent a secure login link to <strong className="text-stone-700">{email}</strong>
              </p>
              <p className="text-xs text-stone-400 mb-6">Click the link in the email to sign in. It expires in 1 hour.</p>
              <button
                onClick={() => { setMagicLinkSent(false); setEmail(''); }}
                className="text-sm text-stone-500 hover:text-stone-700 underline underline-offset-2"
              >
                Use a different email
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-stone-500 mb-1.5 uppercase tracking-wider">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@servicealignment.com"
                    required
                    autoComplete="email"
                    className="w-full bg-stone-50 border border-stone-200/60 rounded-xl py-3 pl-10 pr-4 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-300 transition-all"
                  />
                </div>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200/60 rounded-lg px-3 py-2.5"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    {authMode === 'magic_link' ? 'Send Login Link' : 'Sign In'}
                  </>
                )}
              </button>

              {/* Auth Mode Indicator */}
              {authMode === 'magic_link' && (
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-400">
                  <Shield size={10} />
                  <span>Passwordless authentication via email</span>
                </div>
              )}
            </form>
          )}
        </motion.div>

        {/* Security Trust Badges */}
        <div className="mt-6 grid grid-cols-2 gap-2.5">
          <div className="flex items-center gap-2 bg-white/60 border border-stone-100 rounded-lg px-3 py-2">
            <Shield size={13} className="text-emerald-600 flex-shrink-0" />
            <span className="text-[10px] text-stone-500 leading-tight">Passwordless auth<br/><span className="text-stone-400">Magic link — no passwords stored</span></span>
          </div>
          <div className="flex items-center gap-2 bg-white/60 border border-stone-100 rounded-lg px-3 py-2">
            <Lock size={13} className="text-emerald-600 flex-shrink-0" />
            <span className="text-[10px] text-stone-500 leading-tight">Row-Level Security<br/><span className="text-stone-400">Reps only see their own data</span></span>
          </div>
          <div className="flex items-center gap-2 bg-white/60 border border-stone-100 rounded-lg px-3 py-2">
            <ShieldCheck size={13} className="text-emerald-600 flex-shrink-0" />
            <span className="text-[10px] text-stone-500 leading-tight">SOC 2 Type II infra<br/><span className="text-stone-400">Supabase + Railway certified</span></span>
          </div>
          <div className="flex items-center gap-2 bg-white/60 border border-stone-100 rounded-lg px-3 py-2">
            <Clock size={13} className="text-emerald-600 flex-shrink-0" />
            <span className="text-[10px] text-stone-500 leading-tight">Auto session timeout<br/><span className="text-stone-400">30 min idle · 24h max</span></span>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-stone-400 mt-5">
          Service Alignment GTM Workspace &middot; v1.0
          {authMode === 'dev' && (
            <span className="ml-2 text-amber-500 font-medium">[DEV MODE]</span>
          )}
        </p>
      </motion.div>
    </div>
  );
}
