
// src/pages/Login.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Eye, EyeOff, Loader2, ChevronRight, UserPlus,
  AlertCircle, CheckCircle2, HelpCircle, DoorOpen, ArrowRight
} from 'lucide-react';

// ── Reusable Input ────────────────────────────────────────────────────────
const InputField = ({ label, type = 'text', value, onChange, placeholder, error, required, hint }) => {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
        {label} {required && <span className="text-blue-400">*</span>}
      </label>
      <div className="relative">
        <input
          type={isPassword && !show ? 'password' : type === 'password' ? 'text' : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={isPassword ? 'current-password' : 'off'}
          className={[
            'w-full px-4 py-3 rounded-2xl border text-sm font-medium placeholder:text-slate-300 transition-all outline-none',
            error
              ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-400 focus:ring-2 focus:ring-red-400/20'
              : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white',
          ].join(' ')}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs font-semibold text-red-600 flex items-center gap-1">
          <AlertCircle size={11} className="shrink-0" /> {error}
        </p>
      )}
      {hint && !error && <p className="mt-1.5 text-[11px] text-slate-400 leading-relaxed">{hint}</p>}
    </div>
  );
};

// ── Decorative SVG: abstract gate/door shape ──────────────────────────────
const GateIllustration = () => (
  <svg viewBox="0 0 260 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[260px] mx-auto">
    <rect x="20" y="40" width="100" height="120" rx="8" fill="white" fillOpacity="0.08" stroke="white" strokeOpacity="0.15" strokeWidth="1.5" />
    <rect x="140" y="40" width="100" height="120" rx="8" fill="white" fillOpacity="0.08" stroke="white" strokeOpacity="0.15" strokeWidth="1.5" />
    <rect x="60" y="60" width="20" height="60" rx="4" fill="white" fillOpacity="0.12" />
    <rect x="180" y="60" width="20" height="60" rx="4" fill="white" fillOpacity="0.12" />
    <circle cx="108" cy="102" r="5" fill="white" fillOpacity="0.4" />
    <circle cx="152" cy="102" r="5" fill="white" fillOpacity="0.4" />
    <rect x="10" y="155" width="240" height="4" rx="2" fill="white" fillOpacity="0.1" />
    <path d="M110 40 Q130 20 150 40" stroke="white" strokeOpacity="0.2" strokeWidth="1.5" fill="none" />
    <circle cx="130" cy="18" r="6" fill="white" fillOpacity="0.15" />
  </svg>
);

// ── Main Login Page ───────────────────────────────────────────────────────
const Login = () => {
  const { login, signup } = useAuth();

  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [serverMsg, setServerMsg] = useState({ type: '', text: '' });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [role, setRole] = useState('Gatekeeper');
  const [activationCode, setActivationCode] = useState('');
  const [signupErrors, setSignupErrors] = useState({});

  const ROLES = ['Admin', 'DOD', 'Patron', 'Matron', 'Gatekeeper'];

  const clearMessages = () => setServerMsg({ type: '', text: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!email || !password) {
      setServerMsg({ type: 'error', text: 'Email na password ni ngombwa.' });
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setServerMsg({
        type: 'error',
        text: err.response?.data?.message || 'Kwinjira byanze. Ongera usuzume ibyanditse.',
      });
    } finally {
      setLoading(false);
    }
  };

  const validateSignup = () => {
    const errs = {};
    if (!signupName.trim()) errs.signupName = 'Izina ni ngombwa.';
    if (!signupEmail.trim()) errs.signupEmail = 'Email ni ngombwa.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail)) errs.signupEmail = 'Email itemewe.';
    if (!signupPassword || signupPassword.length < 6) errs.signupPassword = 'Password igomba kugira byibuze inyuguti 6.';
    if (role !== 'Admin' && !activationCode.trim()) errs.activationCode = 'Kode y\'uburenganzira irakenerwa.';
    setSignupErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!validateSignup()) return;
    setLoading(true);
    try {
      await signup({
        name: signupName.trim(),
        email: signupEmail.trim(),
        password: signupPassword,
        role,
        activationCode: role === 'Admin' ? undefined : activationCode.trim(),
      });
      setServerMsg({
        type: 'success',
        text: `Konti ya ${signupName} yashizweho neza. Ushobora kwinjira.`,
      });
      setMode('login');
      setEmail(signupEmail);
    } catch (err) {
      setServerMsg({
        type: 'error',
        text: err.response?.data?.message || 'Kwiyandikisha byanze.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row antialiased" style={{ background: 'linear-gradient(145deg, #1d4ed8 0%, #2563eb 40%, #1e40af 100%)' }}>

      {/* ── MOBILE HERO (visible only on mobile/tablet) ── */}
      <div className="lg:hidden flex flex-col items-center justify-center pt-12 pb-6 px-6 text-center relative flex-shrink-0">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-56 h-56 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #93c5fd, transparent)', transform: 'translate(-30%, -30%)' }} />
        <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #60a5fa, transparent)', transform: 'translate(30%, 20%)' }} />

        {/* Logo mark */}
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 relative z-10"
          style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}>
          <DoorOpen size={26} className="text-white" />
        </div>

        <div className="relative z-10 mb-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.18)' }}>
            MIPC Gate · Sisitemu y'Impushya
          </span>
        </div>

        <h1 className="text-2xl font-black text-white tracking-tight leading-tight mt-4 relative z-10">
          Genzura impushya<br />
          <span style={{ color: '#bfdbfe' }}>z'abanyeshuri.</span>
        </h1>
        <p className="text-sm mt-2 relative z-10" style={{ color: 'rgba(191,219,254,0.8)' }}>
          Injiza umwirondoro wawe kugira ngo ubashe kwinjira.
        </p>

        <GateIllustration />
      </div>

      {/* ── BOTTOM SHEET on mobile / Right panel on desktop ── */}
      {/* Mobile: sits at bottom as a rising sheet. Desktop: fills left side. */}
      <div
        className="w-full lg:hidden rounded-t-[32px] relative z-10 flex-1"
        style={{
          background: 'white',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
          minHeight: '75vh',
marginTop: '-20px',
        }}
      >
        <SheetHandle />
        <FormContent
          mode={mode} setMode={setMode} clearMessages={clearMessages}
          serverMsg={serverMsg}
          email={email} setEmail={setEmail}
          password={password} setPassword={setPassword}
          signupName={signupName} setSignupName={setSignupName}
          signupEmail={signupEmail} setSignupEmail={setSignupEmail}
          signupPassword={signupPassword} setSignupPassword={setSignupPassword}
          role={role} setRole={setRole}
          activationCode={activationCode} setActivationCode={setActivationCode}
          signupErrors={signupErrors}
          loading={loading}
          handleLogin={handleLogin}
          handleSignup={handleSignup}
          ROLES={ROLES}
          isMobile
        />
      </div>

      {/* ── DESKTOP: Left column (form) ── */}
      <div className="hidden lg:flex flex-col justify-between bg-white px-10 xl:px-16 py-10 lg:w-[52%] xl:w-[50%] z-10">
        {/* Brand bar */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
            <DoorOpen size={18} className="text-white" />
          </div>
          <div>
            <p className="font-black text-sm tracking-tight text-slate-900">MIPC Gate</p>
            <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase">Sisitemu y'impushya</p>
          </div>
        </div>

        <div className="my-auto w-full max-w-md">
          <FormContent
            mode={mode} setMode={setMode} clearMessages={clearMessages}
            serverMsg={serverMsg}
            email={email} setEmail={setEmail}
            password={password} setPassword={setPassword}
            signupName={signupName} setSignupName={setSignupName}
            signupEmail={signupEmail} setSignupEmail={setSignupEmail}
            signupPassword={signupPassword} setSignupPassword={setSignupPassword}
            role={role} setRole={setRole}
            activationCode={activationCode} setActivationCode={setActivationCode}
            signupErrors={signupErrors}
            loading={loading}
            handleLogin={handleLogin}
            handleSignup={handleSignup}
            ROLES={ROLES}
            isMobile={false}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 font-medium border-t border-slate-100 pt-4 mt-10">
          <p>© 2026 MIPC Institution</p>
          <a href="#help" className="flex items-center gap-1 hover:text-slate-600 transition-colors">
            <HelpCircle size={12} /> <span>Ubufasha</span>
          </a>
        </div>
      </div>

      {/* ── DESKTOP: Right blue panel ── */}
      <div className=" hidden lg:flex lg:w-[48%] xl:w-[50%] flex-col justify-between p-12 xl:p-16 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #1d4ed8 0%, #2563eb 50%, #1e40af 100%)' }}>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }} />
        {/* Glow orbs */}
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.08), transparent 70%)' }} />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)' }} />

        <div className="relative z-10">
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.18)' }}>
            Kuri Gate
          </span>
        </div>

        <div className="relative z-10 my-auto">
          <h1 className="text-4xl xl:text-5xl font-black text-white tracking-tight leading-[1.1] mb-6">
            Genzura impushya<br />
            z'abanyeshuri<br />
            mu buryo{' '}
            <span style={{ color: '#bfdbfe' }}>bworoshye.</span>
          </h1>
          <p className="text-sm leading-relaxed max-w-xs font-medium" style={{ color: 'rgba(191,219,254,0.8)' }}>
            Urubuga rwo kugenzuriraho no gutanga impushya mu buryo bworoshye.
          </p>

          <GateIllustration />
        </div>

        <div className="relative z-10 text-xs font-bold" style={{ color: 'rgba(255,255,255,0.35)' }}>
          © 2026 MIPC
        </div>
      </div>

    </div>
  );
};

// ── Sheet drag handle ─────────────────────────────────────────────────────
const SheetHandle = () => (
  <div className="flex justify-center pt-3 pb-1">
    <div className="w-10 h-1 rounded-full bg-slate-200" />
  </div>
);

// ── Shared Form Block ─────────────────────────────────────────────────────
const FormContent = ({
  mode, setMode, clearMessages, serverMsg,
  email, setEmail, password, setPassword,
  signupName, setSignupName, signupEmail, setSignupEmail,
  signupPassword, setSignupPassword, role, setRole,
  activationCode, setActivationCode, signupErrors,
  loading, handleLogin, handleSignup, ROLES, isMobile,
}) => {
  return (
    <div className={isMobile ? 'px-6 pt-2 pb-10' : ''}>
      {/* Heading */}
      <div className="mb-6">
        <h2 className={`font-black tracking-tight text-slate-900 mb-1.5 ${isMobile ? 'text-xl' : 'text-2xl lg:text-3xl'}`}>
          {mode === 'login' ? 'Injira Ku Rubuga' : 'Gufungura Konti'}
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          {mode === 'login'
            ? 'Injiza umwirondoro wawe ukoresha kugira ngo ubashe kwinjira.'
            : 'Iyandikishe muri sisitemu ukoresheje amakuru n\'icyiciro cy\'akazi.'}
        </p>
      </div>

      {/* Tab Toggle */}
      <div className="flex bg-slate-100 rounded-2xl p-1 mb-5 border border-slate-200/50">
        {[
          { id: 'login', label: 'Injira', sublabel: 'Sign In' },
          { id: 'signup', label: 'Iyandikishe', sublabel: 'Register' },
        ].map(m => (
          <button
            key={m.id}
            type="button"
            onClick={() => { setMode(m.id); clearMessages(); }}
            className="flex-1 py-2.5 px-3 rounded-xl transition-all text-center"
            style={mode === m.id ? {
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: 'white',
              boxShadow: '0 3px 10px rgba(37,99,235,0.3)',
            } : { color: '#94a3b8' }}
          >
            <span className="block text-xs font-bold">{m.label}</span>
            <span className="block text-[9px] opacity-70 mt-0.5">{m.sublabel}</span>
          </button>
        ))}
      </div>

      {/* Alert */}
      {serverMsg.text && (
        <div className={[
          'mb-5 px-4 py-3 rounded-xl border text-xs font-semibold flex items-start gap-2.5',
          serverMsg.type === 'error'
            ? 'bg-red-50 border-red-100 text-red-700'
            : 'bg-emerald-50 border-emerald-100 text-emerald-700',
        ].join(' ')}>
          {serverMsg.type === 'error'
            ? <AlertCircle size={14} className="shrink-0 text-red-500 mt-0.5" />
            : <CheckCircle2 size={14} className="shrink-0 text-emerald-500 mt-0.5" />}
          <span className="leading-normal">{serverMsg.text}</span>
        </div>
      )}

      {/* LOGIN FORM */}
      {mode === 'login' && (
        <form onSubmit={handleLogin} className="space-y-4">
          <InputField
            label="Email cyangwa Izina ry'akazi"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="umuyobozi@mipc.rw"
            required
          />
          <InputField
            label="Ijambo ry'ibanga"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 text-white text-xs font-bold uppercase tracking-wider py-3.5 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            style={{
              background: loading ? '#93c5fd' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              boxShadow: loading ? 'none' : '0 6px 18px rgba(37,99,235,0.38)',
            }}
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
            {loading ? 'Umutekano uri kurizwa…' : 'Emeza Kwinjira'}
          </button>
        </form>
      )}

      {/* SIGNUP FORM */}
      {mode === 'signup' && (
        <form onSubmit={handleSignup} className="space-y-4">
          <InputField
            label="Amazina Yose"
            value={signupName}
            onChange={e => setSignupName(e.target.value)}
            placeholder="urugero: Hirwa Amani"
            error={signupErrors.signupName}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Email ya MIPC"
              type="email"
              value={signupEmail}
              onChange={e => setSignupEmail(e.target.value)}
              placeholder="username@mipc.rw"
              error={signupErrors.signupEmail}
              required
            />
            <InputField
              label="Ijambo ry'ibanga"
              type="password"
              value={signupPassword}
              onChange={e => setSignupPassword(e.target.value)}
              placeholder="Nibura inyuguti 6"
              error={signupErrors.signupPassword}
              required
            />
          </div>

          {/* Role selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Inshingano ushinzwe <span className="text-blue-500">*</span>
            </label>
            <div className="relative">
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium bg-slate-50 text-slate-800 hover:border-slate-300 transition-all outline-none appearance-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 cursor-pointer"
              >
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                  <path d="M1 1L5 5L9 1" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          {role !== 'Admin' && (
            <InputField
              label={role === 'Gatekeeper' ? "Kode y'Irembo · Gate Code" : "Kode y'Uburenganzira · Auth Code"}
              value={activationCode}
              onChange={e => setActivationCode(e.target.value)}
              placeholder={role === 'Gatekeeper' ? 'GATE-2026-MIPC' : 'DISC-2026-DOD'}
              error={signupErrors.activationCode}
              required
              hint="Saba ubuyobozi bukuru bw'ishuri (Admin) kugira ngo uhabwe iyi kode."
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 text-white text-xs font-bold uppercase tracking-wider py-3.5 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            style={{
              background: loading ? '#93c5fd' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              boxShadow: loading ? 'none' : '0 6px 18px rgba(37,99,235,0.38)',
            }}
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
            {loading ? 'Gutunganya konti…' : 'Koresha Kwiyandikisha'}
          </button>
        </form>
      )}

      {/* Footer (mobile only) */}
      {isMobile && (
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium border-t border-slate-100 pt-5 mt-6">
          <p>© 2026 MIPC</p>
          <a href="#help" className="flex items-center gap-1 hover:text-slate-600 transition-colors">
            <HelpCircle size={12} /> Ubufasha
          </a>
        </div>
      )}
    </div>
  );
};

export default Login;
