import { useState } from 'react';
import {
  ScanLine, ClipboardList, Settings, LogOut, Shield,
  Menu, X, ChevronRight, Users, DoorOpen
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Gatekeeper from './pages/Gatekeeper';
import Discipline from './pages/Discipline';
import AdminSettings from './pages/AdminSettings';
import RegisterStudent from './pages/RegisterStudent'; // Imported registration view node
import PWAInstaller from './components/PWAInstaller';

// ── Nav definitions per role — Only Admin (Principal/TSS) sees 'register' ──
const getNavItems = (role) => {
  const items = [];

  if (['Admin', 'DOD', 'Patron', 'Matron', 'Gatekeeper'].includes(role)) {
    items.push({ id: 'gate', icon: ScanLine, label: 'Gate', sublabel: 'Checkpoint Terminal' });
  }
  if (['Admin', 'DOD', 'Patron', 'Matron'].includes(role)) {
    items.push({ id: 'discipline', icon: ClipboardList, label: 'Impushya', sublabel: 'Leave & Passes' });
  }
  if (role === 'Admin') {
    // Only the Principal/TSS Admin receives the registration view stream pointer
    items.push({ id: 'register', icon: Users, label: 'Kwandika Abanyeshuri', sublabel: 'Student Registrar' });
    items.push({ id: 'admin', icon: Settings, label: 'Ubuyobozi', sublabel: 'Architecture Suite' });
  }

  return items;
};

const ROLE_BADGES = {
  Admin: { label: 'UMUYOBOSI MUKURU', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  DOD: { label: 'DOD / DISCIPLINE', bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  Patron: { label: 'PATRON', bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-500' },
  Matron: { label: 'MATRON', bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-500' },
  Gatekeeper: { label: 'GATEKEEPER', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
};

const ProAvatar = ({ className = "w-10 h-10" }) => (
  <div className={`relative ${className} rounded-full bg-gradient-to-tr from-blue-50 to-indigo-100 border border-blue-200/80 shadow-inner flex items-center justify-center overflow-hidden shrink-0`}>
    <svg 
      className="w-[85%] h-[85%] text-blue-600/80 absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[5%]" 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path fillRule="evenodd" clipRule="evenodd" d="M12 4a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm-5.5 3.5a5.5 5.5 0 1111 0 5.5 5.5 0 01-11 0z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M12 12.5c-3.141 0-6.052 1.222-8.032 3.424a1.25 1.25 0 00-.323.945C3.89 19.341 5.86 21 12 21c6.14 0 8.11-1.659 8.355-4.131a1.25 1.25 0 00-.323-.945C18.052 13.722 15.141 12.5 12 12.5z" />
    </svg>
    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
  </div>
);

const Sidebar = ({ navItems, activeView, onNavigate, user, onLogout }) => {
  const badge = ROLE_BADGES[user?.role] || ROLE_BADGES.Gatekeeper;

  return (
    <aside className="hidden lg:flex flex-col w-70 xl:w-72 shrink-0 bg-white border-r border-slate-200 h-screen sticky top-0 text-slate-800">
      <div className="flex items-center gap-3.5 px-6 py-5 border-b border-slate-100 bg-slate-50/50">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-blue-600/15">
          <DoorOpen size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-extrabold text-slate-950 tracking-tight">Mipc Gate</p>
          <p className="text-[10px] text-blue-600 font-mono tracking-wider uppercase font-bold">Kuri Gate</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-left transition-all relative group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/15 font-bold'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={16} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600 transition-colors'} />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold tracking-tight ${isActive ? 'text-white' : 'text-slate-800'}`}>{item.label}</p>
                <p className={`text-[10px] font-medium ${isActive ? 'text-blue-100/90' : 'text-slate-400'}`}>{item.sublabel}</p>
              </div>
              {isActive && <ChevronRight size={13} className="text-white/80 shrink-0" />}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 bg-slate-50/30">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200/80 shadow-sm mb-2">
          <ProAvatar className="w-9 h-9" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-extrabold text-slate-900 truncate">{user?.name}</p>
            <span className={`inline-flex items-center gap-1 text-[8px] font-black px-2 py-0.5 mt-1 rounded-full ${badge.bg} ${badge.text}`}>
              <span className={`w-1 h-1 rounded-full ${badge.dot}`} />
              {badge.label}
            </span>
          </div>
        </div>
        
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all text-xs font-bold"
        >
          <LogOut size={13} />
          <span>Sohoka / Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

const BottomNav = ({ navItems, activeView, onNavigate }) => (
  <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-slate-200 safe-bottom shadow-lg">
    <div className="flex items-stretch justify-around h-16">
      {navItems.map((item) => {
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all ${
              isActive ? 'text-blue-600' : 'text-slate-400'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-blue-50 text-blue-600' : ''}`}>
              <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[9px] font-bold tracking-tight ${isActive ? 'text-slate-950 font-extrabold' : 'text-slate-400'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  </nav>
);

const MobileHeader = ({ user, activeItem, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const badge = ROLE_BADGES[user?.role] || ROLE_BADGES.Gatekeeper;

  return (
    <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-30 text-slate-900">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
          <Shield size={14} className="text-white" />
        </div>
        <div>
          <p className="text-xs font-black tracking-tight text-slate-950">GateFlow</p>
          <p className="text-[9px] text-blue-600 font-mono tracking-wide uppercase font-extrabold">{activeItem?.label}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ProAvatar className="w-7 h-7" />
        <button
          onClick={() => setMenuOpen(m => !m)}
          className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-950"
          aria-label="Menu"
        >
          {menuOpen ? <X size={15} /> : <Menu size={15} />}
        </button>
      </div>

      {menuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-xl z-40">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <ProAvatar className="w-10 h-10" />
            <div>
              <p className="text-xs font-extrabold text-slate-950">{user?.name}</p>
              <span className={`inline-block text-[8px] font-black px-2 py-0.5 rounded-full ${badge.bg} ${badge.text} mt-1`}>
                {badge.label}
              </span>
            </div>
          </div>
          <button
            onClick={() => { setMenuOpen(false); onLogout(); }}
            className="w-full flex items-center gap-2 px-5 py-4 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut size={14} />
            <span>Sohoka Kuri Konti / Sign Out</span>
          </button>
        </div>
      )}
    </header>
  );
};

const AppShell = () => {
  const { user, logout, loading } = useAuth();
  const [activeView, setActiveView] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-600/10">
            <DoorOpen size={20} className="text-white animate-pulse" />
          </div>
          <p className="text-[10px] text-blue-600 font-mono font-bold tracking-widest uppercase animate-pulse">
            Tegereza ...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return <Login />;

  const navItems = getNavItems(user.role);
  const defaultView = navItems[0]?.id || 'gate';
  const currentView = activeView || defaultView;
  const activeItem = navItems.find(n => n.id === currentView);

  // Guard: If the user changes roles during their session, prevent access to unauthorized views
  const isViewAllowed = navItems.some(item => item.id === currentView);
  const secureView = isViewAllowed ? currentView : defaultView;

  const renderPage = () => {
    switch (secureView) {
      case 'gate': return <Gatekeeper />;
      case 'discipline': return <Discipline />;
      case 'register': return <RegisterStudent />; // Safely mounts RegisterStudent page asset
      case 'admin': return <AdminSettings />;
      default: return <Gatekeeper />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50/50 overflow-hidden font-sans">
      <Sidebar
        navItems={navItems}
        activeView={secureView}
        onNavigate={setActiveView}
        user={user}
        onLogout={logout}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MobileHeader user={user} activeItem={activeItem} onLogout={logout} />

        <main className="flex-1 overflow-hidden pb-16 lg:pb-0">
          <div className="h-full overflow-y-auto">
            <div className="w-full h-full p-4">
              {renderPage()}
            </div>
          </div>
        </main>

        <BottomNav
          navItems={navItems}
          activeView={secureView}
          onNavigate={setActiveView}
        />
      </div>

      <PWAInstaller />
    </div>
  );
};

export default AppShell;