// src/components/PermissionCard.jsx
import { MapPin, Clock, ArrowUpRight, AlertTriangle, CheckCircle2, Timer, ShieldQuestion } from 'lucide-react';
import BarcodeVector from './BarcodeVector';

const STATUS_CONFIG = {
    Active: { label: 'ACTIVE', dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    Overdue: { label: 'OVERDUE', dot: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
    Approved: { label: 'APPROVED', dot: 'bg-blue-600', text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
    Returned: { label: 'RETURNED', dot: 'bg-zinc-400', text: 'text-zinc-600', bg: 'bg-zinc-100', border: 'border-zinc-200' },
};

const PermissionCard = ({ permission, penaltyRate = 2, onWaive, canWaive = false }) => {
    if (!permission) {
        return (
            <div className="relative rounded-3xl border border-zinc-100 bg-white shadow-sm p-8">
                <div className="flex flex-col items-center text-center gap-3">
                    <ShieldQuestion size={32} className="text-zinc-300" />
                    <p className="text-sm font-semibold text-zinc-500">No active permission data</p>
                </div>
            </div>
        );
    }

    const { id, entity_name, entity_type, academic_bridge_student_id, status = 'Approved', destination, reason, expected_departure, expected_return, marks_deducted_cache = 0, waived_reason, issued_by_name } = permission;
    
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Approved;
    const isOverdue = status === 'Overdue';
    const barcodeId = academic_bridge_student_id || String(id || 'GF-000');

    return (
        <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-lg shadow-blue-50/50 transition-all duration-500">
            {/* Geometric Blue Edge Patterns */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] pointer-events-none">
                <svg viewBox="0 0 100 100" className="w-full h-full text-blue-600 fill-current">
                    <path d="M100 0L0 100H100V0Z" />
                    <path d="M60 0L0 60V0H60Z" />
                </svg>
            </div>
            <div className="absolute bottom-0 left-0 w-24 h-24 opacity-[0.05] pointer-events-none">
                <svg viewBox="0 0 100 100" className="w-full h-full text-blue-600 fill-current">
                    <circle cx="0" cy="100" r="60" />
                </svg>
            </div>

            {/* Header */}
            <div className="relative flex items-center justify-between px-6 pt-6 pb-4">
                <div className="flex flex-col">
                    <span className="font-mono text-[10px] tracking-[0.2em] font-bold text-blue-600 uppercase">MIPC Access ID</span>
                    <span className="text-lg font-black text-zinc-900 tracking-tight">#{String(id || '0000').padStart(4, '0')}</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                    {cfg.label}
                </div>
            </div>

            {/* Content Body */}
            <div className="px-6 py-2 relative">
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <h3 className="text-xl font-extrabold text-zinc-950">{entity_name}</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-0.5">{entity_type}</p>
                    </div>
                    {/* Minimalist Student Graphic */}
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                        <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                    <InfoBox label="Destination" value={destination} icon={<MapPin size={12} />} />
                    <InfoBox label="Issued By" value={issued_by_name} icon={<ShieldQuestion size={12} />} />
                </div>
                
                <div className="bg-zinc-50 rounded-xl p-4 mt-4 border border-zinc-100/50">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Reason</p>
                    <p className="text-xs text-zinc-600 italic">"{reason || 'No reason provided'}"</p>
                </div>
            </div>

            {/* Footer */}
            <div className={`mt-6 px-6 py-4 border-t ${isOverdue ? 'bg-rose-50/30 border-rose-100' : 'bg-blue-50/30 border-blue-100/50'}`}>
                <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2">
                        {isOverdue ? <AlertTriangle size={16} className="text-rose-500" /> : <Clock size={16} className="text-blue-600" />}
                        <span className={`text-xs font-bold ${isOverdue ? 'text-rose-700' : 'text-blue-800'}`}>
                            {isOverdue ? 'Return deadline exceeded' : 'Awaiting transit'}
                        </span>
                    </div>
                    <BarcodeVector seed={barcodeId} width={70} height={20} color="#1e3a8a" />
                </div>
            </div>
        </div>
    );
};

const InfoBox = ({ label, value, icon }) => (
    <div>
        <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-1">{label}</p>
        <div className="flex items-center gap-1.5 text-sm font-semibold text-zinc-800">
            <span className="text-blue-500">{icon}</span>
            {value || '—'}
        </div>
    </div>
);

export default PermissionCard;