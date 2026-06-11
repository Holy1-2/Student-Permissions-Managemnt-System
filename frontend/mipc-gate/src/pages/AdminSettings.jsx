// src/pages/AdminSettings.jsx
import { useState, useEffect, useCallback } from 'react';
import {
  Database, Users, Key, Zap, RefreshCw, Shield, Save, Loader2,
  CheckCircle2, AlertTriangle, RotateCcw, Activity, Settings,
  Table, Lock, UserCog, Eye, EyeOff
} from 'lucide-react';
import { adminGetConfig, adminUpdatePenalty, adminRotateCodes } from '../lib/api';

// Reusable section card
const SectionCard = ({
  icon: Icon, title, subtitle,
  iconColor = 'text-blue-600', iconBg = 'bg-blue-50',
  children
}) => (
  <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md/50">
    <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100 bg-zinc-50/30">
      <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center shrink-0 shadow-sm`}>
        <Icon size={15} className={iconColor} />
      </div>
      <div>
        <h3 className="text-sm font-bold text-zinc-900 tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    <div className="p-5">{children}</div>
  </div>
); 

// Status badge
const StatusBadge = ({ type, children }) => {
  const cfg = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    error: 'bg-rose-50 border-rose-200 text-rose-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700'
  }[type] || 'bg-zinc-50 border-zinc-200 text-zinc-600';
  const Icon =
    type === 'success' ? CheckCircle2 : type === 'error' ? AlertTriangle : Activity;
  return (
    <div className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-xs font-medium ${cfg} animate-fadeIn`}>
      <Icon size={14} className="shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
};

// Input row with optional mask
const InputRow = ({ label, type = 'text', value, onChange, placeholder, hint, masked }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">{label}</label>
      <div className="relative">
        <input
          type={masked && !show ? 'password' : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-medium text-zinc-900 bg-white placeholder:text-zinc-400 hover:border-zinc-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
        />
        {masked && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1 rounded-md hover:bg-zinc-50 transition-colors"
          >
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
      {hint && <p className="text-[11px] text-zinc-400 leading-normal">{hint}</p>}
    </div>
  );
};

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('settings'); // 'settings', 'security', 'users'
  const [config, setConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Frontend sandbox states connected to live endpoint
  const [mockStudents, setMockStudents] = useState(() => {
    const local = localStorage.getItem('sandbox_students_registry');
    return local ? JSON.parse(local) : [];
  });
  const [mockSize, setMockSize] = useState('30'); // DummyJSON defaults to 30 elements on direct limit
  const [mockCombo, setMockCombo] = useState('ALL');
  const [sandboxStatus, setSandboxStatus] = useState(null);
  const [generatingMock, setGeneratingMock] = useState(false);

  // Penalty rate
  const [penaltyRate, setPenaltyRate] = useState('');
  const [savingPenalty, setSavingPenalty] = useState(false);
  const [penaltyStatus, setPenaltyStatus] = useState(null);

  // Activation codes
  const [gatekeeperCode, setGatekeeperCode] = useState('');
  const [disciplineCode, setDisciplineCode] = useState('');
  const [savingCodes, setSavingCodes] = useState(false);
  const [codesStatus, setCodesStatus] = useState(null);

  // Role list for users section
  const users = [
    { role: 'Admin', code: '—', count: 1 },
    { role: 'DOD', code: config?.activation_code_discipline, count: 2 },
    { role: 'Gatekeeper', code: config?.activation_code_gatekeeper, count: 3 }
  ];

  const loadConfig = useCallback(async () => {
    setLoadingConfig(true);
    try {
      const res = await adminGetConfig();
      const cfg = res.data;
      setConfig(cfg);
      setPenaltyRate(String(cfg.marks_penalty_per_hour || 2));
      setGatekeeperCode(cfg.activation_code_gatekeeper || '');
      setDisciplineCode(cfg.activation_code_discipline || '');
    } catch {
      // silent fallback
    } finally {
      setLoadingConfig(false);
    }
  }, []);

  useEffect(() => { loadConfig(); }, [loadConfig]);

  // Live Sandbox generation fetching from DummyJSON real user API
  // Live Integration with your friend's Student Management System API
  const handleSeedSandbox = async (e) => {
    e.preventDefault();
    setGeneratingMock(true);
    setSandboxStatus(null);
// Replace with your friend's IP
const PORT = "https://playpen-gimmick-showpiece.ngrok-free.app";


    // Friend's custom system deployment endpoint URL

    try {
      const response = await fetch(`${PORT}`);
      if (!response.ok) throw new Error('Byanze kwakira amakuru yonekeza ku muryango wa API.');
      
      const data = await response.json();
      const externalStudents = Array.isArray(data) ? data : (data.students || data.data || []);

      const combos = ['SOD', 'MCE', 'ACC'];
      const transformedStudents = externalStudents.map((extStudent, i) => {
        const combo = mockCombo === 'ALL' ? combos[Math.floor(Math.random() * combos.length)] : mockCombo;
        const generatedRfid = Math.floor(10000000 + Math.random() * 90000000).toString();

        return {
          student_id: extStudent.reg_number || extStudent.student_code || `MIPC-2026-${1000 + i}`,
          name: extStudent.full_name || `${extStudent.firstName || extStudent.name} ${extStudent.lastName || ''}`.trim(),
          combination: extStudent.department || extStudent.combo || combo,
          class_level: extStudent.level || 'Level 5',
          discipline_marks: Number(extStudent.marks || 100),
          card_status: extStudent.status || 'ACTIVE',
          rfid_card_number: extStudent.rfid || extStudent.card_uid || generatedRfid
        };
      });

      // CRITICAL DIRECT INTERACT: Save the payload straight to YOUR backend MySQL database
      await adminSyncStudentsWithDB(transformedStudents);

      // Keep client state up to date
      setMockStudents(transformedStudents);
      setSandboxStatus({
        type: 'success',
        msg: `Byabashije! Abanyeshuri ${transformedStudents.length} banyujijwe muri API ya mugenzi wawe kandi babitswe neza muri Database yawe.`
      });
    } catch (err) {
      setSandboxStatus({
        type: 'error',
        msg: err.response?.data?.message || err.message || 'Haza ikibazo mu gushaka cyangwa kubika amakuru.'
      });
    } finally {
      setGeneratingMock(false);
    }
  };
  const handleClearSandbox = () => {
    localStorage.removeItem('sandbox_students_registry');
    setMockStudents([]);
    setSandboxStatus({ type: 'info', msg: 'Ububiko bw\'ibanze bwasibwe.' });
  };

  const handleSavePenalty = async (e) => {
    e.preventDefault();
    const rate = parseInt(penaltyRate);
    if (isNaN(rate) || rate < 0) {
      setPenaltyStatus({ type: 'error', msg: 'Igiciro cy\'ibihano kigomba kuba umubare utari mubi.' });
      return;
    }
    setSavingPenalty(true);
    setPenaltyStatus(null);
    try {
      await adminUpdatePenalty(rate);
      setPenaltyStatus({ type: 'success', msg: `Igiciro cy'ibihano cyahinduwe: ${rate} amanota/isaha.` });
      loadConfig();
    } catch (err) {
      setPenaltyStatus({ type: 'error', msg: err.response?.data?.message || 'Byanze.' });
    } finally {
      setSavingPenalty(false);
    }
  };

  const handleSaveCodes = async (e) => {
    e.preventDefault();
    if (!gatekeeperCode.trim() || !disciplineCode.trim()) {
      setCodesStatus({ type: 'error', msg: 'Kode zombi zirakenewe.' });
      return;
    }
    setSavingCodes(true);
    setCodesStatus(null);
    try {
      await adminRotateCodes({
        gatekeeper_code: gatekeeperCode.trim(),
        discipline_code: disciplineCode.trim()
      });
      setCodesStatus({ type: 'success', msg: 'Kode z\'uburenganzira zahinduwe neza.' });
      loadConfig();
    } catch (err) {
      setCodesStatus({ type: 'error', msg: err.response?.data?.message || 'Byanze.' });
    } finally {
      setSavingCodes(false);
    }
  };

  if (loadingConfig) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 size={24} className="animate-spin text-blue-600" />
      </div>
    );
  }

  const tabs = [
    { id: 'settings', label: 'Igenamiterere rya Sandbox', icon: Settings },
    { id: 'security', label: 'Umutekano n\'Ibihano', icon: Lock },
    { id: 'users', label: 'Abakoresha Sisitemu', icon: UserCog }
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-50/40">
      {/* Header */}
      <div className="border-b border-zinc-200/80 px-6 py-4 bg-blue-600 sticky top-0 z-10 shadow-md shadow-blue-600/10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Igenzura rya Sisitemu (Admin)
            </h1>
            <p className="text-xs text-blue-100 mt-0.5">
              Gucunga igenamiterere, ibihano, n'ubushakashatsi bw'ibanze bwa MIPC
            </p>
          </div>
          <button
            onClick={loadConfig}
            className="p-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all active:scale-95"
            aria-label="Vugurura Sisitemu"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Vertical tabs (left panel) */}
        <div className="w-60 border-r border-zinc-200 bg-zinc-50/70 p-4 space-y-1 hidden sm:block">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all text-xs font-semibold',
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm border border-zinc-200/80'
                  : 'text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-800'
              ].join(' ')}
            >
              <tab.icon size={14} className={activeTab === tab.id ? 'text-blue-600' : 'text-zinc-400'} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Content area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl">
          
          {/* TAB: Kwiha Igenamiterere */}
          {activeTab === 'settings' && (
            <>
              {/* Config mini dashboard counters */}
              {config && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Igiciro cy\'ibihano', value: `${config.marks_penalty_per_hour} amanota/saha`, color: 'text-blue-600' },
                    { label: 'Abanyeshuri muri API', value: `${mockStudents.length} Bapimwe`, color: 'text-indigo-600' },
                    { label: 'Kode y\'Irembo Ikora', value: config.activation_code_gatekeeper || '—', color: 'text-emerald-600', isMono: true }
                  ].map(item => (
                    <div key={item.label} className="bg-white rounded-xl border border-zinc-200 p-4 shadow-sm">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                        {item.label}
                      </p>
                      <p className={`text-sm font-bold ${item.isMono ? 'font-mono' : ''} ${item.color}`}>{item.value}</p>
                    </div>
                  ))}
                </div>
              )}



              {/* Sandbox DummyJSON Loader engine */}
              <SectionCard
                icon={Database}
                title="Guhuriza Amakuru kuri DummyJSON API"
                subtitle="Kura amakuru y'abanyeshuri ku rubuga rw'izone rwa API kugira ngo upime sisitemu"
                iconColor="text-blue-600"
                iconBg="bg-blue-50"
              >
                <form onSubmit={handleSeedSandbox} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        Umubare w'Abanyeshuri ushaka (Kuri API)
                      </label>
                      <select
                        value={mockSize}
                        onChange={e => setMockSize(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm font-medium bg-white hover:border-zinc-300 transition-all outline-none focus:border-blue-500"
                      >
                        <option value="10">10 Abanyeshuri</option>
                        <option value="30">30 Abanyeshuri (Standard)</option>
                        <option value="50">50 Abanyeshuri</option>
                        <option value="100">100 Abanyeshuri</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        Amashami (Shyira mu matsinda)
                      </label>
                      <select
                        value={mockCombo}
                        onChange={e => setMockCombo(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm font-medium bg-white hover:border-zinc-300 transition-all outline-none focus:border-blue-500"
                      >
                        <option value="ALL">Yose (Ivunnye)</option>
                        <option value="SOD">Software Dev (SOD)</option>
                        <option value="MCE">Masonry & Civil Eng (MCE)</option>
                        <option value="ACC">Accounting & Finance (ACC)</option>
                      </select>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Iri genzura rya Sandbox ririzana amakuru nyayo ava hanze (Live remote context) bityo rifasha kwerekana uburyo amakarita ya RFID yakira amakuru mu irembo nta kibazo.
                  </p>
                  
                  {sandboxStatus && <StatusBadge type={sandboxStatus.type}>{sandboxStatus.msg}</StatusBadge>}
                  
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={generatingMock}
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-500/10 transition-all disabled:opacity-50"
                    >
                      {generatingMock ? <Loader2 size={13} className="animate-spin" /> : <Database size={13} />}
                      {generatingMock ? 'Amakuru ari Gukurwa kuri API...' : 'Kurura Amakuru kuri API'}
                    </button>
                    {mockStudents.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearSandbox}
                        className="flex items-center gap-2 px-4 py-2.5 border border-zinc-200 text-zinc-600 text-xs font-semibold rounded-xl hover:bg-zinc-50 hover:text-zinc-800 transition-colors"
                      >
                        Siba Amakuru ya Sandbox
                      </button>
                    )}
                  </div>
                </form>
              </SectionCard>
            </>
          )}

          {/* TAB: Umutekano (Security) */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <SectionCard
                icon={Activity}
                title="Igiciro n'Ikigereranyo cy'Ibihano"
                subtitle="Gucunga amanota akurwaho buri saha umunyeshuri arengereye uruhushya"
                iconColor="text-rose-600"
                iconBg="bg-rose-50"
              >
                <form onSubmit={handleSavePenalty} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Amanota akurwaho buri saha
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        value={penaltyRate}
                        onChange={e => setPenaltyRate(e.target.value)}
                        className="w-24 px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm font-bold text-zinc-900 bg-white text-center focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
                      />
                      <span className="text-xs font-medium text-zinc-500">amanota / isaha imwe yakerewe</span>
                    </div>
                  </div>
                  {penaltyStatus && <StatusBadge type={penaltyStatus.type}>{penaltyStatus.msg}</StatusBadge>}
                  <button
                    type="submit"
                    disabled={savingPenalty}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/10 transition-colors disabled:opacity-50"
                  >
                    {savingPenalty ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                    {savingPenalty ? 'Irimo guhindurwa...' : 'Emeza Impinduka z\'Ibihano'}
                  </button>
                </form>
              </SectionCard>

              <SectionCard
                icon={RotateCcw}
                title="Guhindura Kode z'Uburenganzira bwa Sisitemu"
                subtitle="Shyiraho kode nshya abakozi n'abashinzwe ikinyabupfura bakoresha basaba konti"
                iconColor="text-amber-600"
                iconBg="bg-amber-50"
              >
                <form onSubmit={handleSaveCodes} className="space-y-5">
                  <InputRow
                    label="Kode y'Irembo (Activation Code - Gatekeeper)"
                    value={gatekeeperCode}
                    onChange={e => setGatekeeperCode(e.target.value)}
                    placeholder="GATE-2026-X"
                    hint="Iyi kode ikoreshwa n'abarinzi b'irembo mu kwandika amakarita ya RFID."
                  />
                  <InputRow
                    label="Kode y'Indero (Activation Code - DOD / Animateur)"
                    value={disciplineCode}
                    onChange={e => setDisciplineCode(e.target.value)}
                    placeholder="DISC-2026-Y"
                    hint="Iyi kode itanga uburenganzira mu gukuraho ibihano cyangwa gutanga impushya nshya."
                  />
                  {codesStatus && <StatusBadge type={codesStatus.type}>{codesStatus.msg}</StatusBadge>}
                  <button
                    type="submit"
                    disabled={savingCodes}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/10 transition-colors disabled:opacity-50"
                  >
                    {savingCodes ? <Loader2 size={13} className="animate-spin" /> : <Shield size={13} />}
                    {savingCodes ? 'Kode ziri guhindurwa...' : 'Emeza Gukwirakwiza Kode Nshya'}
                  </button>
                </form>
              </SectionCard>
            </div>
          )}

          {/* TAB: Abakoresha (Users) */}
          {activeTab === 'users' && (
            <SectionCard
              icon={Users}
              title="Inshingano n'Abakoresha ba Sisitemu"
              subtitle="Urutonde rw'abafite uburenganzira buhinduka mu kigo"
              iconColor="text-blue-600"
              iconBg="bg-blue-50"
            >
              <div className="overflow-x-auto border border-zinc-100 rounded-xl">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="text-left text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 bg-zinc-50/50">
                      <th className="p-3">Inshingano (Role)</th>
                      <th className="p-3">Kode Isanzwe muri Sisitemu</th>
                      <th className="p-3 text-right">Umubare</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {users.map(u => (
                      <tr key={u.role} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="p-3 font-semibold text-zinc-800">{u.role}</td>
                        <td className="p-3 font-mono text-xs text-blue-600 font-medium">{u.code || '—'}</td>
                        <td className="p-3 text-zinc-600 text-right font-semibold">{u.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-zinc-400 mt-4 leading-normal">
                Izi kode z'uburenganzira zikoreshwa mu gihe cyo kwiyandikisha gusa (Registration phase) kugira ngo hirindwe abinjira mu buryo butemewe. Zishobora guhindurwa n'umuyobozi mukuru igihe cyose.
              </p>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;