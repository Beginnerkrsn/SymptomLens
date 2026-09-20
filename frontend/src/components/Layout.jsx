import {
  Activity,
  ClipboardList,
  FileImage,
  FileText,
  History,
  Home,
  LogOut,
  Menu,
  Stethoscope,
  X,
} from 'lucide-react'
import {
  Link,
  NavLink,
  Outlet,
} from 'react-router-dom'
import { useState } from 'react'

import { useAuth } from '../context/useAuth'

function navClass({ isActive }) {
  return `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive
      ? 'bg-[#173d32] text-white shadow-sm'
      : 'text-[#52655d] hover:bg-white hover:text-[#173d32]'
  }`
}

const navigation = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: Home,
  },
  {
    to: '/diagnosis',
    label: 'Symptoms',
    icon: Stethoscope,
  },
  {
    to: '/medical-analysis',
    label: 'Medical Report',
    icon: FileText,
  },
  {
    to: '/xray-analysis',
    label: 'X-Ray',
    icon: FileImage,
  },
  {
    to: '/history',
    label: 'History',
    icon: History,
  },
  {
    to: '/medical-history',
    label: 'Medical History',
    icon: ClipboardList,
  },
]

export default function Layout() {
  const {
    user,
    isAuthenticated,
    logout,
  } = useAuth()

  const [mobileOpen, setMobileOpen] =
    useState(false)

  function closeMobileMenu() {
    setMobileOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#f3f7f4]">
      <header className="sticky top-0 z-50 border-b border-[#dce8df] bg-[#f8fbf8]/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-3"
          >
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#173d32] text-white shadow-sm">
              <Activity size={20} />
            </span>

            <span className="heading text-lg font-bold text-[#173d32]">
              Symptom
              <span className="text-[#da7d43]">
                Lens
              </span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            <NavLink
              to="/"
              className={navClass}
            >
              <Home size={15} />
              Home
            </NavLink>

            {isAuthenticated &&
              navigation.map(
                ({
                  to,
                  label,
                  icon: Icon,
                }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={navClass}
                  >
                    <Icon size={15} />
                    {label}
                  </NavLink>
                ),
              )}
          </nav>

          {/* Account */}
          <div className="hidden items-center gap-3 sm:flex">
            {isAuthenticated ? (
              <>
                <span className="max-w-[160px] truncate text-sm font-semibold text-[#52655d]">
                  {user?.name || 'Account'}
                </span>

                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-full border border-[#efcfca] bg-white px-3.5 py-2 text-sm font-bold text-[#a84b43] transition hover:border-[#d65b51] hover:bg-[#fff5f3]"
                  aria-label="Log out"
                >
                  <LogOut size={16} />
                  <span className="hidden md:inline">
                    Log out
                  </span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-[#173d32] transition hover:bg-white"
                >
                  Log in
                </Link>

                <Link
                  to="/register"
                  className="rounded-full bg-[#da7d43] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#da7d43]/20 transition hover:bg-[#c86c35]"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() =>
              setMobileOpen(
                (current) => !current,
              )
            }
            className="grid h-10 w-10 place-items-center rounded-xl border border-[#dce8df] bg-white text-[#173d32] lg:hidden"
            aria-label={
              mobileOpen
                ? 'Close navigation menu'
                : 'Open navigation menu'
            }
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X size={20} />
            ) : (
              <Menu size={20} />
            )}
          </button>
        </div>

        {/* Mobile navigation */}
        {mobileOpen && (
          <div className="border-t border-[#dce8df] bg-[#f8fbf8] px-6 py-4 lg:hidden">
            <nav className="flex flex-col gap-2">
              <NavLink
                to="/"
                onClick={closeMobileMenu}
                className={navClass}
              >
                <Home size={16} />
                Home
              </NavLink>

              {isAuthenticated &&
                navigation.map(
                  ({
                    to,
                    label,
                    icon: Icon,
                  }) => (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={closeMobileMenu}
                      className={navClass}
                    >
                      <Icon size={16} />
                      {label}
                    </NavLink>
                  ),
                )}
            </nav>

            <div className="mt-4 border-t border-[#dce8df] pt-4">
              {isAuthenticated ? (
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#173d32]">
                      {user?.name || 'Account'}
                    </p>

                    <p className="truncate text-xs text-[#82918b]">
                      {user?.email || ''}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      closeMobileMenu()
                      logout()
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-[#efcfca] bg-white px-4 py-2 text-sm font-bold text-[#a84b43]"
                  >
                    <LogOut size={16} />
                    Log out
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="flex-1 rounded-full border border-[#dce8df] bg-white px-4 py-2.5 text-center text-sm font-bold text-[#173d32]"
                  >
                    Log in
                  </Link>

                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className="flex-1 rounded-full bg-[#da7d43] px-4 py-2.5 text-center text-sm font-bold text-white"
                  >
                    Get started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}