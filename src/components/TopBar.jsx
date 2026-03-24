import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import logo from '../logo/logo.png'

function NavIcon({ path }) {
  const icons = {
    '/': (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    ),
    '/cases': (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
      </svg>
    ),
    '/instructor': (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
      </svg>
    ),
  };
  return icons[path] || null;
}

export default function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';

  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/cases', label: 'Cases' },
    ...(isInstructor ? [{ to: '/instructor', label: 'Instructor' }] : []),
  ];

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-gradient shadow-glow-sm">
            <img src={logo} alt="logo" className="h-8 w-8 object-contain" />
          </div>
          <div className="hidden sm:block">
            <p className="font-display text-sm font-bold text-white leading-none">FMEA &amp; RCA</p>
            <p className="text-[11px] text-slate-500 leading-none mt-0.5">Learning Platform</p>
          </div>
        </motion.div>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link, i) => (
            <motion.div
              key={link.to}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.25 }}
            >
              <NavLink
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-teal/15 text-teal-bright border border-teal/25'
                      : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'
                  }`
                }
              >
                <NavIcon path={link.to} />
                {link.label}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        {/* User area */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3"
        >
            {user && (
            <div className="hidden items-center gap-3 sm:flex">
              <div className="text-right min-w-0 max-w-[140px] lg:max-w-[200px]">
                <p className="text-sm font-medium text-slate-200 leading-none truncate">{user.full_name}</p>
                <p className="mt-0.5 text-xs text-slate-500 capitalize leading-none">{user.role}</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal/20 border border-teal/30 text-xs font-bold text-teal-bright">
                {initials}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-400 transition-all hover:bg-white/[0.08] hover:text-slate-200 hidden sm:flex items-center gap-1.5 min-h-[44px]"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            Sign out
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-slate-400 transition-all hover:bg-white/[0.08] md:hidden"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              {menuOpen ? (
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              )}
            </svg>
          </button>
        </motion.div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/[0.06] bg-surface/95 md:hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium transition-all min-h-[44px] ${
                      isActive
                        ? 'bg-teal/15 text-teal-bright border border-teal/25'
                        : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'
                    }`
                  }
                >
                  <NavIcon path={link.to} />
                  {link.label}
                </NavLink>
              ))}
              {user && (
                <div className="border-t border-white/[0.06] pt-2 mt-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{user.full_name}</p>
                    <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="rounded-xl border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
