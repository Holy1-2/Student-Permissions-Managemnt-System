// src/pages/Gatekeeper.jsx
import { useState, useCallback, useRef } from 'react';
import {
  Search, LogIn, LogOut, Package, X, CheckCircle2, AlertTriangle,
  Loader2, ScanLine, User, Car, Building2, ArrowRightLeft, ShieldAlert,
  RotateCcw
} from 'lucide-react';
import { gateSearch, gateCheckpoint } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import PermissionCard from '../components/PermissionCard';

const ASSET_TYPES = [
  { value: 'Supply_Delivery', label: 'Igishoro cy\'amabuye | Commercial Supply' },
  { value: 'School_Property_Movement', label: 'Umutungo w\'ishuri | School Asset' },
  { value: 'Personal_Belongings', label: 'Ibikoresho by\'umuntu | Personal Luggage' }
];

const EntityTypeIcon = ({ type }) => {
  if (type === 'Student') return <User size={16} className="text-blue-600" />;
  if (type === 'School_Vehicle') return <Car size={16} className="text-indigo-600" />;
  if (type === 'Supplier') return <Building2 size={16} className="text-amber-600" />;
  return <User size={16} className="text-slate-400" />;
};

/**
 * Professional Gatekeeper – search only shows students with valid permission,
 * then displays the passport card and smart entry/exit buttons.
 */
const Gatekeeper = () => {
  const { user } = useAuth();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState('');

  const [selected, setSelected] = useState(null); // holds entity + permission
  const [direction, setDirection] = useState(null);
  const [showAssets, setShowAssets] = useState(false);
  const [assetDesc, setAssetDesc] = useState('');
  const [assetType, setAssetType] = useState('Personal_Belongings');

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const debounceRef = useRef(null);

  const showToast = (type, msg, data = null) => {
    setToast({ type, msg, data });
    setTimeout(() => setToast(null), 8000);
  };

  // Search only entities that currently hold a valid gate permission.
  const handleSearch = useCallback((value) => {
    setQuery(value);
    setSearchErr('');
    clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        // The API must return entities with their active/approved permission object.
        const res = await gateSearch(value.trim());
        const records = res.data || [];

        setResults(records);

        if (records.length === 0) {
          setSearchErr('Nta muntu ufite uruhushya rukora rwabonetse muri sisitemu.');
        }
      } catch (err) {
        setSearchErr(err.response?.data?.message || 'Isano na sisitemu yananiranye.');
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  }, []);

  // Select an entity, close dropdown, prepare for checkpoint.
  // Select an entity, close dropdown, prepare for checkpoint.
const handleSelectEntity = (entity) => {
    // 1. Explicitly check if a permission record exists on this student record
    const hasPermission = !!(entity.permission_id || entity.id_permission);

    // 2. Safely capture the status directly from the database without guessing 'Approved'
    // If the student has an active pass out, use it; otherwise, default to 'Approved' for safe display
    const explicitStatus = entity.status || (hasPermission ? 'Approved' : 'No Permission');

    const normalizedPermission = {
        id: entity.permission_id, 
        entity_name: entity.name || entity.entity_name,
        entity_type: entity.entity_type || 'Student',
        academic_bridge_student_id: entity.academic_bridge_student_id,
        status: explicitStatus, 
        destination: entity.destination || 'Nshingiro',
        reason: entity.reason || 'Kujya mu kiruhuko',
        expected_departure: entity.expected_departure,
        expected_return: entity.expected_return,
        marks_deducted_cache: entity.marks_deducted_cache || 0,
        waived_reason: entity.waived_reason || null,
        issued_by_name: entity.issued_by_name || 'DOD'
    };
    
    setSelected({
        ...entity,
        id: entity.entity_id || entity.id, 
        // Only attach the permission object if it actually exists in your DB!
        permission: hasPermission ? normalizedPermission : null
    });
    
    setResults([]);
    setQuery('');
    setDirection(null);
    setShowAssets(false);
    setAssetDesc('');
};

  // Clear selection and return to search.
  const handleClearSelection = () => {
    setSelected(null);
    setSearchErr('');
  };

  // Determine button states based on permission status.
  // - 'Active' or 'Overdue' → student is outside → only Entry enabled.
  // - 'Approved' → student is still inside → only Exit enabled.
  // - No permission → both disabled (shouldn't happen because search filters).
// ── ROBUST BUTTON STATE MATRIX ──
const permStatus = selected?.permission?.status;
const isOutside = permStatus === 'Active' || permStatus === 'Overdue';

// Disable button actions completely if no permission object is attached to the selected student record
const canEnter = selected?.permission && isOutside;
const canExit = selected?.permission && permStatus === 'Approved';
  const handleCheckpoint = async (dir) => {
    if (!selected) return;
    setDirection(dir);
    setSubmitting(true);
    try {
      const payload = {
        entity_id: selected.id || selected.student_id,
        direction: dir,
        items_moved: showAssets && assetDesc.trim()
          ? { description: assetDesc.trim(), type: assetType }
          : undefined
      };

      const res = await gateCheckpoint(payload);

      showToast(
        'success',
        dir === 'IN'
          ? `Kwinjira kwa ${selected.name} kwemejwe.`
          : `Gusohoka kwa ${selected.name} kwemejwe.`,
        res.data
      );
      // After successful scan, the permission status changes.
      // Clear selection so the user must search again (reflects new state).
      setSelected(null);
      setShowAssets(false);
      setAssetDesc('');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Guhuriza amakuru byananiwe.');
    } finally {
      setSubmitting(false);
      setDirection(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/40">
      {/* Header Bar */}
      <div className="border-b border-slate-200/80 px-6 py-4 bg-blue-600 sticky top-0 z-20 flex items-center justify-between shadow-md shadow-blue-600/10">
        <div>
          <h1 className="text-base font-black text-white tracking-tight flex items-center gap-2">
            <ScanLine size={18} />
            Irembo Rya MIPC
            <span className="text-blue-200 font-normal">|</span>
            <span className="text-white font-semibold">Securite</span>
          </h1>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 border border-white/20 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span className="text-xs font-bold text-white tracking-tight font-mono">Sisitemu irakora neza</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-5xl w-full mx-auto">
        {/* Search Terminal */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ScanLine size={12} className="text-blue-600" />
            Shakisha Umunyeshuri (Abafite uruhushya gusa)
          </label>
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Andika izina, ID y'ishuri, cyangwa scan ikarita ya RFID..."
              className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-slate-200 text-sm font-semibold bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 shadow-sm transition-all"
            />
            {searching && (
              <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600 animate-spin" />
            )}
            {query && !searching && (
              <button
                onClick={() => { setQuery(''); setResults([]); setSearchErr(''); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Compact Search Results Dropdown */}
          {results.length > 0 && !selected && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xl max-h-64 overflow-y-auto divide-y divide-slate-100 animate-slideDown">
              {results.map((entity) => (
                <button
                  key={entity.id || entity.student_id}
                  onClick={() => handleSelectEntity(entity)}
                  className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-blue-50/50 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:border-blue-200 transition-colors shadow-sm">
                    <EntityTypeIcon type={entity.entity_type || 'Student'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                      {entity.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate uppercase tracking-tight">
                      {entity.combination || 'General'} · ID: {entity.student_id || entity.id}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                      entity.permission?.status === 'Active' || entity.permission?.status === 'Overdue'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {entity.permission?.status === 'Active' || entity.permission?.status === 'Overdue'
                        ? 'Outside'
                        : 'Permitted'}
                    </span>
                    <ArrowRightLeft size={14} className="text-slate-300 group-hover:text-blue-500 shrink-0 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchErr && !selected && (
            <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-white text-center">
              <p className="text-xs font-medium text-slate-400">{searchErr}</p>
            </div>
          )}
        </div>

        {/* Selected Entity Passport & Checkpoint Controls */}
        {selected && (
          <div className="space-y-6 animate-fadeIn">
            {/* Permission Card (reused from Discipline) */}
            <PermissionCard
              permission={selected.permission}
              penaltyRate={2}
              canWaive={false} // gatekeepers don't waive
            />

            {/* Action Buttons with smart muting */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => handleCheckpoint('IN')}
                disabled={submitting || !canEnter}
                title={!canEnter ? 'Student is already inside or no valid permission' : 'Allow student to enter'}
                className={`flex items-center justify-center gap-2.5 text-xs font-bold py-4 rounded-xl shadow-lg active:scale-[0.99] transition-all
                  ${canEnter
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/10'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  } disabled:opacity-100`}
              >
                {submitting && direction === 'IN' ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <LogIn size={15} strokeWidth={2.5} />
                )}
                <span>EMEZA KWINJIRA / VERIFY ENTRY</span>
              </button>

              <button
                onClick={() => handleCheckpoint('OUT')}
                disabled={submitting || !canExit}
                title={!canExit ? 'Student is already outside or no approved permission' : 'Allow student to exit'}
                className={`flex items-center justify-center gap-2.5 text-xs font-bold py-4 rounded-xl shadow-lg active:scale-[0.99] transition-all
                  ${canExit
                    ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/10'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  } disabled:opacity-100`}
              >
                {submitting && direction === 'OUT' ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <LogOut size={15} strokeWidth={2.5} />
                )}
                <span>EMEZA GUSOHOKA / VERIFY EXIT</span>
              </button>
            </div>

            {/* Asset Logistics */}
            <div>
              <button
                type="button"
                onClick={() => setShowAssets(s => !s)}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed text-xs font-bold transition-all ${
                  showAssets
                    ? 'border-blue-300 bg-blue-50/40 text-blue-700'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Package size={14} />
                <span>{showAssets ? 'Kuraho Umutungo / Remove Asset Manifest' : 'Ongeraho Ikigendwa / Declare Accompanying Luggage'}</span>
              </button>

              {showAssets && (
                <div className="mt-4 p-5 bg-slate-50/50 rounded-2xl border border-slate-200/80 space-y-4 animate-slideDown">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Ibisobanuro by'ikigendwa
                      </label>
                      <input
                        type="text"
                        value={assetDesc}
                        onChange={e => setAssetDesc(e.target.value)}
                        placeholder="Urugero: Laptop, Ibitabo, n'ibindi..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-900 focus:outline-none focus:border-blue-600 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Ubwoko bw'Ikigendwa
                      </label>
                      <div className="relative">
                        <select
                          value={assetType}
                          onChange={e => setAssetType(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-900 focus:outline-none focus:border-blue-600 appearance-none cursor-pointer"
                        >
                          {ASSET_TYPES.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Clear selection to search again */}
            <div className="text-center">
              <button
                onClick={handleClearSelection}
                className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
              >
                <RotateCcw size={13} />
                Shakisha undi munyeshuri
              </button>
            </div>
          </div>
        )}

        {/* Realtime Feedback Toasts */}
        {toast && (
          <div
            className={`rounded-2xl border p-4 shadow-lg animate-fadeIn transition-all ${
              toast.type === 'success'
                ? 'bg-emerald-50/80 border-emerald-200 shadow-emerald-500/5 text-emerald-900'
                : 'bg-rose-50/80 border-rose-200 shadow-rose-500/5 text-rose-900'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className="shrink-0 mt-0.5">
                {toast.type === 'success' ? (
                  <CheckCircle2 size={18} className="text-emerald-600" />
                ) : (
                  <AlertTriangle size={18} className="text-rose-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold leading-relaxed">{toast.msg}</p>
                {toast.data?.overdueReport && (
                  <div className="mt-3 rounded-xl bg-white border border-rose-200/60 p-4 shadow-inner space-y-1">
                    <div className="flex items-center gap-1.5 text-rose-700 font-black text-xs font-mono tracking-wide">
                      <ShieldAlert size={14} />
                      <span>IHANO RYAGARAGAYE / OVERDUE VIOLATION DETECTED</span>
                    </div>
                    <p className="text-[11px] font-medium text-slate-500">
                      Uyu munyeshuri yarengeje amasaha y'uruhushya mu buryo butemewe. Sisitemu yakatye amanota mu buryo bwikora.
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono font-bold">
                      <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-slate-700">
                        Amasaha yarengeje: <span className="text-rose-600 font-extrabold">{toast.data.overdueReport.hoursOverdue}h</span>
                      </div>
                      <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-slate-700">
                        Amanota akuweho: <span className="text-rose-600 font-extrabold">-{toast.data.overdueReport.marksDeducted} Pts</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <button onClick={() => setToast(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 shrink-0">
                <X size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gatekeeper;