import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Search, Upload, FolderOpen, User,
  Bell, LogOut, Menu, X, ChevronRight, GraduationCap, MessageSquare,
  Users, FileText, Shield, Flame
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import api from '../../services/api'
import ThemeToggle from '../shared/ThemeToggle'
import SEO from '../shared/SEO'
import { io } from 'socket.io-client';
import FeedbackWidget from '../shared/FeedbackWidget';
import CommandPalette from '../shared/CommandPalette';
import NotificationPanel from '../shared/NotificationPanel';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/programs',  icon: GraduationCap,   label: 'Programs' },
  { to: '/browse',    icon: Search,          label: 'Browse' },
  { to: '/upload',    icon: Upload,          label: 'Upload' },
  { to: '/my-files',  icon: FolderOpen,      label: 'My Files' },
  { to: '/study-rooms', icon: MessageSquare, label: 'Study Rooms' },
  { to: '/admin/users', icon: Users,         label: 'Manage Users',    adminOnly: true },
  { to: '/admin/resources', icon: FileText,  label: 'Manage Files',    adminOnly: true },
  { to: '/feedback',  icon: MessageSquare,   label: 'User Feedback',   adminOnly: true },
  { to: '/admin/logs', icon: Shield,         label: 'Audit Logs',      adminOnly: true },
  { to: '/profile',   icon: User,            label: 'Profile' },
]

function Sidebar({ mobile = false, user, setMobileMenuOpen, setLogoutConfirmOpen }) {
  const avatar = user?.avatar
    ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
    : <span className="text-sm font-semibold text-ink-200">{user?.name?.[0]?.toUpperCase()}</span>

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`p-6 pb-4 ${mobile ? 'p-5 flex items-center justify-between' : ''}`}>
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-lg text-text-main">
            {mobile ? 'StudyRepo' : 'Study Repository'}
          </span>
        </div>
        {mobile && (
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMobileMenuOpen(false);
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMobileMenuOpen(false);
            }}
            className="p-2.5 bg-surface border border-border hover:bg-panel rounded-xl text-text-muted hover:text-text-main transition-all active:scale-95 flex items-center justify-center cursor-pointer relative z-[80]"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
        {NAV.filter(item => {
          if (item.adminOnly && user?.role !== 'super_admin') return false;
          if (user?.role === 'super_admin' && (item.to === '/upload' || item.to === '/my-files' || item.to === '/study-rooms')) return false;
          return true;
        }).map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            onClick={() => setMobileMenuOpen?.(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
               ${isActive
                 ? 'bg-ink-500/20 text-ink-300 border border-ink-500/30'
                 : 'text-text-muted hover:text-text-main hover:bg-panel'}`
            }>
            {({ isActive }) => <>
              <Icon size={17} className={isActive ? 'text-ink-400' : 'text-text-muted/60 group-hover:text-text-main/70'} />
              {label}
              {isActive && <ChevronRight size={13} className="ml-auto text-ink-400" />}
            </>}
          </NavLink>
        ))}
      </nav>

      {user?.role !== 'super_admin' && (
        <div className="mx-3 mb-4 p-4 rounded-xl bg-panel border border-border relative overflow-hidden group">
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mb-3">Quick Stats</p>
          <div className="space-y-2.5">
            {[
              ['Uploads', user?.totalUploads ?? 0],
              ['Downloads', user?.totalDownloads ?? 0],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-xs text-text-muted/60 font-medium">{label}</span>
                <span className="text-xs font-bold text-text-main">{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mx-3 mb-4 border-t border-border pt-4">
        <p className="text-[10px] text-text-main mb-2 font-black uppercase tracking-wider px-2">Support & Legal</p>
        <div className="flex flex-col gap-1">
          {[
            { label: 'Help Center', to: '/help' },
            { label: 'Report Bug', to: '/bug-report' },
            { label: 'Terms and Conditions', to: '/terms' },
            { label: 'Privacy Policy', to: '/privacy-policy' }
          ].map((link) => link.external ? (
            <a
              key={link.label}
              href={link.to}
              className="text-xs text-text-muted hover:text-text-main px-2 py-1.5 rounded-lg hover:bg-panel transition-colors"
            >
              {link.label}
            </a>
          ) : (
            <NavLink
              key={link.label}
              to={link.to}
              onClick={() => setMobileMenuOpen?.(false)}
              className="text-xs text-text-muted hover:text-text-main px-2 py-1.5 rounded-lg hover:bg-panel transition-colors"
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* User + logout */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-ink-700 flex items-center justify-center overflow-hidden shrink-0">
            {avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-main truncate">{user?.name}</p>
            <p className="text-xs text-text-muted truncate">{user?.email}</p>
          </div>
          <button onClick={() => { setLogoutConfirmOpen(true); if(mobile) setMobileMenuOpen(false); }} className="p-1.5 rounded-lg hover:bg-panel text-text-muted hover:text-ink-400 transition-colors">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DashboardLayout() {
  const { user, logout, refreshUser } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Real-time user stats refresh
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      refreshUser();
    }, 15000); // Refresh every 15 seconds for "real-time" feel
    return () => clearInterval(interval);
  }, [user, refreshUser]);
  const [notifOpen, setNotifOpen] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const [notifLoading, setNotifLoading] = useState(false)
  const notifBellRef = useRef(null)
  const notifPanelRef = useRef(null)
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false)

  // Automatically close notifications when route changes
  useEffect(() => {
    setNotifOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!document.body.contains(event.target)) return;
      const clickedBell = notifBellRef.current && notifBellRef.current.contains(event.target)
      const clickedPanel = notifPanelRef.current && notifPanelRef.current.contains(event.target)
      if (!clickedBell && !clickedPanel) {
        setNotifOpen(false)
      }
    }
    if (notifOpen) {
      document.addEventListener('click', handleClickOutside)
    }
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [notifOpen])

  useEffect(() => {
    // Initial fetch
    setNotifLoading(true);
    api.get('/notifications').then(r => {
      setNotifications(r.data.notifications || []);
      setUnread(r.data.unreadCount || 0);
    }).catch(() => {})
    .finally(() => setNotifLoading(false));

    // Socket.IO Realtime Connection
    if (!user) return;
    const backendUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:5000';
    const socket = io(backendUrl);
    socket.emit('join_user_channel', user._id || user.id);

    socket.on('new_notification', (notif) => {
      setNotifications(prev => [notif, ...prev]);
      setUnread(prev => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && logoutConfirmOpen) setLogoutConfirmOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [logoutConfirmOpen]);

  // Prevent background scroll on mobile when notifications are open
  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    const shouldLock = notifOpen && isMobile;
    if (shouldLock) {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.height = '100vh';
    } else {
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
    };
  }, [notifOpen]);

  const handleLogout = () => { 
    logout(); 
    toast.success("Successfully signed out. See you soon!");
    navigate('/login'); 
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read')
      setUnread(0)
      setNotifications(n => n.map(x => ({ ...x, read: true })))
    } catch {}
  }

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(x => x._id === id ? { ...x, read: true } : x))
      setUnread(prev => Math.max(0, prev - 1))
    } catch {}
  }

  const handleDeleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`)
      const target = notifications.find(x => x._id === id)
      if (target && !target.read) {
        setUnread(prev => Math.max(0, prev - 1))
      }
      setNotifications(prev => prev.filter(x => x._id !== id))
    } catch {}
  }

  const handleClearAll = async () => {
    try {
      await api.delete('/notifications/clear-all')
      setNotifications([])
      setUnread(0)
    } catch {}
  }

  const avatar = user?.avatar
    ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
    : <span className="text-sm font-semibold text-ink-200">{user?.name?.[0]?.toUpperCase()}</span>

  return (
    <div className="flex h-[100dvh] bg-surface overflow-hidden w-full">
      <SEO noindex={true} title="Dashboard | Study Repository" />
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-panel border-r border-border shrink-0">
        <Sidebar user={user} setLogoutConfirmOpen={setLogoutConfirmOpen} />
      </aside>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        {/* Topbar */}
        <header className="relative z-40 h-14 bg-panel/80 backdrop-blur-lg border-b border-border flex items-center px-3 xs:px-4 lg:px-6 gap-2 xs:gap-4 shrink-0">

          {/* Mobile Title */}
          <div className="lg:hidden flex items-center gap-2 font-display font-bold text-[17px] text-text-main shrink-0">
            <div className="w-7 h-7 rounded-lg bg-ink-500/10 flex items-center justify-center border border-ink-500/20 overflow-hidden shrink-0">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="hidden xs:block">StudyRepo</span>
          </div>

          {/* Search Button for Command Palette */}
          <button 
            onClick={() => setCmdPaletteOpen(true)}
            className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-panel border border-border hover:border-text-muted/30 transition-all text-left w-64 text-text-muted hover:text-text-main text-xs group cursor-pointer"
          >
            <Search size={14} className="text-text-muted/60 group-hover:text-text-main transition-colors shrink-0" />
            <span className="flex-1 text-text-muted/70 group-hover:text-text-main transition-colors font-medium">Search or ask...</span>
          </button>

          <div className="flex-1" />

          {/* Mobile Search Icon */}
          <button 
            onClick={() => setCmdPaletteOpen(true)}
            className="md:hidden p-2 rounded-xl hover:bg-panel text-text-muted hover:text-text-main transition-colors cursor-pointer"
          >
            <Search size={18} />
          </button>

          <ThemeToggle />

          {/* Notifications */}
          <div className="relative">
            <button
              ref={notifBellRef}
              onClick={(e) => {
                e.stopPropagation()
                setNotifOpen(o => !o)
              }}
              className="relative p-2 rounded-xl hover:bg-panel text-text-muted hover:text-text-main transition-colors active:scale-95 cursor-pointer"
              aria-label="Notifications"
              aria-expanded={notifOpen}
            >
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-ink-500 rounded-full text-[10px] flex items-center justify-center text-text-main font-bold">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>
          </div>

          {/* Avatar */}
          <NavLink to="/profile" className="w-8 h-8 rounded-full bg-ink-700 flex items-center justify-center overflow-hidden ring-2 ring-transparent hover:ring-ink-500 transition-all">
            {avatar}
          </NavLink>
        </header>

        <NotificationPanel
          panelRef={notifPanelRef}
          isOpen={notifOpen}
          onClose={() => setNotifOpen(false)}
          notifications={notifications}
          unreadCount={unread}
          loading={notifLoading}
          onMarkRead={handleMarkRead}
          onMarkAllRead={markAllRead}
          onDelete={handleDeleteNotification}
          onClearAll={handleClearAll}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20 lg:pb-0" style={{ WebkitOverflowScrolling: 'touch' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="min-h-full flex flex-col">
              <div className="flex-1">
                <Outlet />
              </div>
              <div className="h-28 lg:hidden w-full shrink-0" />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-panel/90 backdrop-blur-xl border-t border-border pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-around px-2 py-2">
          {NAV.filter(item => {
            if (item.adminOnly && user?.role !== 'super_admin') return false;
            if (user?.role === 'super_admin' && (item.to === '/upload' || item.to === '/my-files' || item.to === '/study-rooms')) return false;
            return true;
          }).slice(0, 5).map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all duration-200
                 ${isActive
                   ? 'text-ink-400'
                   : 'text-text-muted/70 hover:text-text-main active:scale-95'}`
              }>
              {({ isActive }) => <>
                <motion.div 
                  initial={false}
                  animate={{ y: isActive ? -2 : 0, scale: isActive ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Icon size={20} className={isActive ? "fill-ink-500/20 stroke-ink-400" : "stroke-current"} strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
                <span className={`text-[9px] mt-1 font-medium tracking-wide transition-all ${isActive ? 'opacity-100 font-bold' : 'opacity-70'}`}>
                  {label.split(' ')[0]}
                </span>
              </>}
            </NavLink>
          ))}
        </div>
        </nav>
      </div>



      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {logoutConfirmOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }} 
              animate={{ opacity: 1, backdropFilter: 'blur(12px)' }} 
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }} 
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 bg-surface/50"
              onClick={() => setLogoutConfirmOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300, mass: 0.8 }}
              className="modal-container"
            >
              {/* Premium Glow auras */}
              <div className="modal-glow-1" />
              <div className="modal-glow-2" />

              <div className="flex flex-col items-center text-center relative z-10">
                <motion.div 
                  initial={{ rotate: -20, scale: 0.5, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  transition={{ type: "spring", delay: 0.1, stiffness: 200 }}
                  className="w-[56px] h-[56px] rounded-[20px] bg-gradient-to-br from-ink-500/20 to-ink-600/5 flex items-center justify-center border border-ink-500/20 mb-5 shadow-[inset_0_1px_rgba(255,255,255,0.1)] ring-8 ring-ink-500/[0.03]"
                >
                  <LogOut size={26} className="text-ink-400" />
                </motion.div>
                <h3 className="text-[20px] font-display font-semibold text-text-main tracking-tight mb-2">Ready to sign out?</h3>
                <p className="text-[15px] text-text-muted mb-8 font-medium leading-relaxed px-2">
                  Make sure you've saved any notes or uploads. You can sign back in anytime to continue studying.
                </p>
              </div>
              
              <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 justify-center w-full relative z-10">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setLogoutConfirmOpen(false)}
                  className="btn-secondary w-full sm:flex-1 py-3 justify-center text-[15px]"
                >
                  Cancel
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleLogout}
                  className="btn-primary w-full sm:flex-1 py-3 justify-center text-[15px]"
                >
                  Sign Out
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {user?.role !== 'super_admin' && <FeedbackWidget />}

      <CommandPalette 
        isOpen={cmdPaletteOpen} 
        onClose={() => setCmdPaletteOpen(false)} 
      />
    </div>
  )
}
