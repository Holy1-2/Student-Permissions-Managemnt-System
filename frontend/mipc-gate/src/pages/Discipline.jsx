import { useState, useEffect, useCallback, useRef } from 'react';
import {
    Users, AlertTriangle, Plus, X, Loader2, RefreshCw,
    MapPin, Clock, ChevronRight, Shield, CheckCircle2,
    User, Search, FileText, Calendar, ArrowRight, Table2, Eye
} from 'lucide-react';
import { permissionsActive, permissionsAll, permissionIssue, permissionWaive, entitiesAll } from '../lib/api';
import { useAuth } from '../context/AuthContext';

// ── DIGITAL LEAVE SLIP PREVIEW MODAL (Uruhushya mu buryo bwa Digital) ──
const ViewSlipModal = ({ permission, onClose }) => {
    if (!permission) return null;
    
    const fmtLongDate = (dt) => dt ? new Date(dt).toLocaleString('en-US', { 
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    }) : '—';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden relative animate-scaleIn">
                {/* Decorative GateFlow Header Blueprint */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white text-center relative">
                    <div className="absolute top-4 right-4">
                        <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all">
                            <X size={16} />
                        </button>
                    </div>
                    <span className="text-[10px] font-mono tracking-widest bg-blue-500/40 px-2.5 py-1 rounded-full uppercase border border-white/10">
                        MIPC Gate Ledger Pass
                    </span>
                    <h2 className="text-xl font-black mt-2 tracking-tight">#{String(permission.id).padStart(4, '0')}</h2>
                    <div className="mt-1 flex items-center justify-center gap-1.5">
                        <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full border ${
                            permission.status === 'Active' ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30' :
                            permission.status === 'Overdue' ? 'bg-rose-500/20 text-rose-200 border-rose-400/30' :
                            permission.status === 'Approved' ? 'bg-amber-500/20 text-amber-200 border-amber-400/30' :
                            'bg-slate-500/20 text-slate-200 border-slate-400/30'
                        }`}>
                            {permission.status}
                        </span>
                    </div>
                </div>

                {/* Ticket Body Content */}
                <div className="p-6 space-y-5 bg-white font-sans">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Umunyeshuri / Student</label>
                        <p className="text-base font-bold text-slate-950">{permission.entity_name || 'Unknown Student'}</p>
                        <p className="text-xs text-slate-500 font-mono">Bridge ID: {permission.academic_bridge_student_id || permission.student_bridge_id || '—'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-4 bg-slate-50/50 rounded-xl px-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Ahagana / Destination</label>
                            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                                <MapPin size={12} className="text-blue-500" />
                                {permission.destination || '—'}
                            </span>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Issued By</label>
                            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                                <User size={12} className="text-indigo-500" />
                                {permission.issued_by_name || 'DOD Office'}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-start gap-2.5">
                            <Calendar size={14} className="text-slate-400 mt-0.5 shrink-0" />
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gusohoka / Departure</label>
                                <p className="text-xs font-medium text-slate-700">{fmtLongDate(permission.expected_departure)}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                            <Clock size={14} className="text-slate-400 mt-0.5 shrink-0" />
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kugaruka / Return Expected</label>
                                <p className="text-xs font-medium text-slate-700">{fmtLongDate(permission.expected_return)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <FileText size={11} /> Impamvu / Reason
                        </label>
                        <p className="text-xs text-slate-700 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            "{permission.reason || 'Nta mpamvu yanditswe.'}"
                        </p>
                    </div>

                    {/* Discipline Penalties Section */}
                    {permission.status === 'Overdue' && (
                        <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertTriangle size={16} className="text-rose-600" />
                                <div>
                                    <p className="text-xs font-bold text-rose-950">Deduction Penalty Cached</p>
                                    {permission.waived_reason && <p className="text-[10px] text-emerald-700 font-medium">Waived: {permission.waived_reason}</p>}
                                </div>
                            </div>
                            <span className="text-sm font-black font-mono text-rose-700">
                                -{permission.marks_deducted_cache || 0} Marks
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ── ISSUE PERMISSION MODAL (Uruhushya Rishya) ─────────────────────────
const IssueModal = ({ onClose, onSuccess }) => {
    const [entities, setEntities] = useState([]);
    const [entityQuery, setEntityQuery] = useState('');
    const [entityId, setEntityId] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [filtered, setFiltered] = useState([]);
    const [reason, setReason] = useState('');
    const [destination, setDestination] = useState('');
    const [departure, setDeparture] = useState('');
    const [returnTime, setReturnTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingEntities, setLoadingEntities] = useState(true);
    const [error, setError] = useState('');
    const debounceTimeout = useRef(null);

    useEffect(() => {
        entitiesAll('Student')
            .then(r => {
                const data = r.data || [];
                setEntities(data);
                setFiltered(data);
            })
            .catch(() => {
                setEntities([]);
                setFiltered([]);
            })
            .finally(() => setLoadingEntities(false));
    }, []);

    useEffect(() => {
        if (!entityQuery.trim()) {
            setFiltered(entities);
            setIsSearching(false);
            return;
        }
        setIsSearching(true);
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(() => {
            const matches = entities.filter(e =>
                e.name.toLowerCase().includes(entityQuery.toLowerCase()) ||
                (e.academic_bridge_student_id || '').toLowerCase().includes(entityQuery.toLowerCase())
            );
            setFiltered(matches);
            setIsSearching(false);
        }, 300);
        return () => clearTimeout(debounceTimeout.current);
    }, [entityQuery, entities]);

    const handleSelectStudent = (student) => {
        setEntityId(student.id); 
        setSelectedStudent(student);
        setEntityQuery('');
    };

    const handleClearSelection = () => {
        setEntityId('');
        setSelectedStudent(null);
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // 1. Check for completely empty fields or fields with just spaces
    if (
        !entityId.toString().trim() || 
        !reason.trim() || 
        !destination.trim() || 
        !departure || 
        !returnTime
    ) {
        setError('Uzuza imyanya yose yajyanywemo nshuti!');
        return;
    }
    
    // 2. Clear and strong validation for Entity ID
    const parsedEntityId = parseInt(entityId, 10);    
    if (isNaN(parsedEntityId) || parsedEntityId <= 0) {
        setError('ID y\'umunyeshuri ntabwo iboneye cyangwa ntiyemewe.');
        return;
    }

    // 3. Length validations to prevent spam or data truncation errors
    if (reason.trim().length < 5) {
        setError('Impamvu ni ngufi cyane. Sobanura neza.');
        return;
    }

    if (destination.trim().length < 3) {
        setError('Ahantu ujya ni hagufi cyane. Andika hagaragara.');
        return;
    }

    // 4. Date and Time Validations
    const dateDeparture = new Date(departure);
    const dateReturn = new Date(returnTime);
    const now = new Date();

    // Ensure departure isn't in the deep past (allowing a 5-minute grace period for form filling)
    if (dateDeparture < new Date(now.getTime() - 5 * 60000)) {
        setError('Igihe cyo guhaguruka nticyakuba mu gihe cyahise!');
        return;
    }

    // Ensure return time is strictly after departure time
    if (dateReturn <= dateDeparture) {
        setError('Igihe cyo kugarukira kigomba kuba nyuma y\'igihe cyo guhaguruka!');
        return;
    }

    // 5. Submit Form data if all validations pass
    setLoading(true);

    const payload = {
        entity_id: parsedEntityId,
        reason: reason.trim(),
        destination: destination.trim(),
        expected_departure: dateDeparture.toISOString(),
        expected_return: dateReturn.toISOString(),
    };

    try {
        await permissionIssue(payload);
        onSuccess();
        onClose();
    } catch (err) {
        setError(err.response?.data?.message || 'Gutanga uruhushya byanze. Ongera ugerageze.');
    } finally {
        setLoading(false);
    }
};
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200/80 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-sm font-bold text-slate-950 tracking-tight flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                            Tanga Uruhushya <span className="text-slate-400 font-normal">/ Issue Leave</span>
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                    {error && (
                        <div className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-100 text-xs font-medium text-rose-700 flex items-center gap-2">
                            <AlertTriangle size={14} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Shakisha Umunyeshuri <span className="text-rose-500">*</span>
                        </label>
                        {!selectedStudent ? (
                            <>
                                <div className="relative">
                                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Andika izina cyangwa Numero y'ishuri (ID)..."
                                        value={entityQuery}
                                        onChange={e => setEntityQuery(e.target.value)}
                                        className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 bg-slate-50/50"
                                    />
                                    {isSearching && (
                                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                                            <Loader2 size={14} className="animate-spin text-blue-500" />
                                        </div>
                                    )}
                                </div>
                                {loadingEntities ? (
                                    <div className="flex items-center justify-center py-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                        <Loader2 size={16} className="animate-spin text-blue-600 mr-2" />
                                        <span className="text-xs text-slate-400">Umutandiko urimo gushakwa...</span>
                                    </div>
                                ) : (
                                    <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200/80 bg-white shadow-inner divide-y divide-slate-50">
                                        {filtered.slice(0, 15).map(entity => (
                                            <button
                                                key={entity.id}
                                                type="button"
                                                onClick={() => handleSelectStudent(entity)}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 group"
                                            >
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-slate-200 bg-slate-50">
                                                    <User size={14} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-slate-900 truncate">{entity.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono truncate">{entity.academic_bridge_student_id || `ID: ${entity.id}`}</p>
                                                </div>
                                                <ChevronRight size={12} className="text-slate-300" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50/30 rounded-xl border border-blue-100 shadow-sm">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                                        <CheckCircle2 size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-950 truncate">{selectedStudent.name}</p>
                                        <p className="text-[10px] text-blue-600 font-mono">{selectedStudent.academic_bridge_student_id || `ID: ${selectedStudent.id}`}</p>
                                    </div>
                                </div>
                                <button type="button" onClick={handleClearSelection} className="p-1.5 rounded-lg bg-white text-slate-400 hover:text-rose-600 border">
                                    <X size={13} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Ahagirwa <span className="text-rose-500">*</span></label>
                        <div className="relative">
                            <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" placeholder="Urugero: Kigali, Muhanga..." value={destination} onChange={e => setDestination(e.target.value)} className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Impamvu <span className="text-rose-500">*</span></label>
                        <div className="relative">
                            <FileText size={14} className="absolute left-3.5 top-3 text-slate-400" />
                            <textarea placeholder="Sobanura impamvu..." value={reason} onChange={e => setReason(e.target.value)} rows={2} className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium resize-none" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Gusohoka</label>
                            <div className="relative">
                                <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="datetime-local" value={departure} onChange={e => setDeparture(e.target.value)} className="w-full pl-8 pr-2 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Kugaruka</label>
                            <div className="relative">
                                <Clock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="datetime-local" value={returnTime} onChange={e => setReturnTime(e.target.value)} className="w-full pl-8 pr-2 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold" />
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold py-3 rounded-xl shadow-md">
                        {loading ? <Loader2 size={15} className="animate-spin" /> : (<><span>Emeza Uruhushya / Confirm</span><ArrowRight size={15} /></>)}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ── WAIVE PENALTY MODAL (Gukuraho Ibano) ────────────────────────────────
const WaiveModal = ({ permission, onClose, onSuccess }) => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason.trim()) { setError('Impamvu isabwa ihari / Justification is required.'); return; }
        setLoading(true);
        try {
            await permissionWaive(permission.id, reason.trim());
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Gukuraho igihano byanze.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/80 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-rose-50/30 to-white">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                            <Shield size={15} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-950">Gukuraho Igihano</h2>
                            <p className="text-[10px] text-slate-400">Override & Waive Fine</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                        <X size={16} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div className="p-4 bg-gradient-to-br from-rose-50/60 to-orange-50/30 rounded-xl border border-rose-100/80 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-rose-200/60 flex items-center justify-center text-rose-600">
                            <User size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-950 truncate">{permission.entity_name}</p>
                            <p className="font-mono text-xs font-black text-rose-700">-{permission.marks_deducted_cache} Marks</p>
                        </div>
                    </div>
                    {error && <p className="text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2.5 rounded-xl">{error}</p>}
                    <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Impamvu Yemewe <span className="text-rose-500">*</span></label>
                        <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Andika impamvu..." rows={3} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium resize-none" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-slate-950 text-white text-xs font-bold py-3 rounded-xl">
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
                        <span>{loading ? 'Bihinduka...' : 'Emeza Gukuraho Igihano'}</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

// ── MAIN DISCIPLINE DASHBOARD ──────────────────────────────────────────
const Discipline = () => {
    const { isRole } = useAuth();
    const canWaive = isRole('Admin', 'DOD');

    const [activePermissions, setActivePermissions] = useState([]);
    const [allPermissions, setAllPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('active');
    const [showIssue, setShowIssue] = useState(false);
    const [waiveTarget, setWaiveTarget] = useState(null);
    const [viewTarget, setViewTarget] = useState(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [active, all] = await Promise.all([
                permissionsActive(),
                permissionsAll(100, 0),
            ]);
            setActivePermissions(active.data || []);
            setAllPermissions(all.data || []);
        } catch (err) {
            console.error("Failed fetching ledger data:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const permissions = tab === 'active' ? activePermissions : allPermissions;
    const overdueCount = allPermissions.filter(p => p.status === 'Overdue' && !p.waived_reason).length;

    const fmtDate = (dt) => dt ? new Date(dt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            {/* Header banner layout */}
            <div className="border-b border-slate-200/80 px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-700 sticky top-0 z-20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-md shadow-blue-900/5">
                <div>
                    <h1 className="text-lg font-black text-white tracking-tight">Gate Disciplinary Management Ledger</h1>
                    <p className="text-xs font-medium text-blue-100 mt-0.5">Track active pass permissions, view cards, and override penalties</p>
                </div>
                <div className="flex items-center gap-2.5 self-end sm:self-auto">
                    <button onClick={loadData} disabled={loading} className="p-2.5 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all">
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={() => setShowIssue(true)} className="flex items-center gap-2 px-4 py-2.5 bg-white text-blue-700 text-xs font-extrabold rounded-xl hover:bg-slate-50 shadow-md transition-all active:scale-95">
                        <Plus size={14} /> Issue Permission Slip
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl w-full mx-auto">
                {/* Metric Overrides */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner"><Users size={16} /></div>
                            <div><span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Leaves</span><p className="text-xs text-slate-500 font-medium">Students outside school gates</p></div>
                        </div>
                        <p className="mt-3 text-4xl font-black text-slate-950 tracking-tight">{activePermissions.length}</p>
                    </div>
                    <div className={`bg-white rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md ${overdueCount > 0 ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200/70'}`}>
                        <div className="flex items-center gap-2.5">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-inner ${overdueCount > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-50 text-slate-400'}`}><AlertTriangle size={16} /></div>
                            <div><span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Overdue Returns</span><p className="text-xs text-slate-500 font-medium">Automatic penalty deduction triggers</p></div>
                        </div>
                        <p className={`mt-3 text-4xl font-black tracking-tight ${overdueCount > 0 ? 'text-rose-600' : 'text-slate-950'}`}>{overdueCount}</p>
                    </div>
                </div>

                {/* Tab Filtering Block */}
                <div className="flex bg-slate-200/50 p-1.5 rounded-xl max-w-sm border border-slate-200/40 shadow-inner">
                    {[
                        { id: 'active', label: 'Currently Out', count: activePermissions.length },
                        { id: 'all', label: 'All History Log', count: allPermissions.length }
                    ].map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 py-2 px-3 rounded-lg transition-all text-xs font-bold tracking-tight ${tab === t.id ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                            {t.label} ({t.count})
                        </button>
                    ))}
                </div>

                {/* Refactored Permissions Table Frame */}
                {loading ? (
                    <div className="flex items-center justify-center py-24 bg-white rounded-2xl border border-slate-100">
                        <Loader2 size={24} className="animate-spin text-blue-600 mr-2" />
                        <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Loading Gate Logs...</span>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                <tr>
                                    <th className="pl-6 py-4">Slip ID</th>
                                    <th className="py-4">Student Name</th>
                                    <th className="py-4">Bridge student ID</th>
                                    <th className="py-4">Destination</th>
                                    <th className="py-4">Departed Time</th>
                                    <th className="py-4">Expected Return</th>
                                    <th className="py-4">Status Flag</th>
                                    <th className="py-4">Penalties</th>
                                    <th className="py-4 pr-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                                {permissions.map((perm) => {
                                    const isOverdue = perm.status === 'Overdue';
                                    const isApproved = perm.status === 'Approved';
                                    const canOverride = canWaive && isOverdue && !perm.waived_reason;
                                    
                                    // Fallback structural assignments prevent blank cells across table matrices
                                    const bridgeId = perm.academic_bridge_student_id || perm.student_bridge_id || '—';
                                    const studentName = perm.entity_name || perm.student_name || 'Unknown Student';

                                    return (
                                        <tr key={perm.id} className="hover:bg-slate-50/70 transition-colors group">
                                            <td className="pl-6 py-4 font-mono font-bold text-slate-400">#{String(perm.id).padStart(4,'0')}</td>
                                            <td className="py-4 font-bold text-slate-950 truncate max-w-[160px]">{studentName}</td>
                                            <td className="py-4 font-mono text-slate-500 tracking-tight">{bridgeId}</td>
                                            <td className="py-4 text-slate-600">{perm.destination || '—'}</td>
                                            <td className="py-4 text-slate-500">{fmtDate(perm.expected_departure)}</td>
                                            <td className="py-4 text-slate-500">{fmtDate(perm.expected_return)}</td>
                                            <td className="py-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                                                    perm.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                    perm.status === 'Overdue' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                    isApproved ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                    'bg-slate-100 text-slate-600 border-slate-200'
                                                }`}>{perm.status}</span>
                                            </td>
                                            <td className="py-4">
                                                {isOverdue ? (
                                                    <span className="font-mono font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                                                        -{perm.marks_deducted_cache || 0}
                                                        {perm.waived_reason && <span className="text-emerald-600 ml-1 font-sans font-bold">(Waived)</span>}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300 font-mono">—</span>
                                                )}
                                            </td>
                                            <td className="py-4 pr-6 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button 
                                                        onClick={() => setViewTarget(perm)}
                                                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors" 
                                                        title="View Digital Slip"
                                                    >
                                                        <Eye size={15} />
                                                    </button>
                                                    
                                                    {canOverride ? (
                                                        <button
                                                            onClick={() => setWaiveTarget(perm)}
                                                            className="text-xs font-bold text-rose-600 hover:text-rose-800 border border-rose-200 hover:bg-rose-50/50 px-2 py-1 rounded-lg transition-all"
                                                        >
                                                            Waive Fine
                                                        </button>
                                                    ) : (
                                                        <span className="text-slate-300 pr-2">—</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {permissions.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="text-center py-16 text-slate-400 bg-white">
                                            <div className="flex flex-col items-center gap-2 max-w-xs mx-auto">
                                                <Table2 size={24} className="text-slate-300" />
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">No Ledger Logs Available</span>
                                                <p className="text-[11px] text-slate-400 leading-normal">There are currently no matching records generated inside this filtered view data.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Components */}
            {showIssue && <IssueModal onClose={() => setShowIssue(false)} onSuccess={loadData} />}
            {waiveTarget && <WaiveModal permission={waiveTarget} onClose={() => setWaiveTarget(null)} onSuccess={loadData} />}
            {viewTarget && <ViewSlipModal permission={viewTarget} onClose={() => setViewTarget(null)} />}
        </div>
    );
};

export default Discipline;