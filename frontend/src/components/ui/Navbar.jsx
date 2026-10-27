import React from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { Code2, LogOut, Shield, ChevronDown, BookOpen } from 'lucide-react';
import { logoutUser } from '../../authSlice';

function Navbar() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const getInitials = (name = '') => {
    return name.slice(0, 2).toUpperCase() || 'U';
  };

  return (
    <header className="sticky top-0 z-40 border-b border-base-300/70 bg-base-100/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Left Navigation */}
        <div className="flex items-center gap-6">
          <NavLink to="/" className="group flex items-center gap-2.5 transition-transform hover:scale-[1.02]">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-primary/5 text-primary shadow-sm shadow-primary/10 ring-1 ring-primary/30 transition-all group-hover:ring-primary/60">
              <Code2 size={20} className="transition-transform group-hover:rotate-6" />
            </span>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-base-content flex items-center">
                Code<span className="text-primary">Forge</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase text-base-content/50 font-medium">
                Developer Studio
              </span>
            </div>
          </NavLink>

          {/* Desktop Nav Links */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1 pl-4 border-l border-base-300/70">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-base-200 text-primary shadow-sm'
                      : 'text-base-content/70 hover:bg-base-200/50 hover:text-base-content'
                  }`
                }
              >
                <BookOpen size={14} />
                Problems
              </NavLink>

              {user?.role === 'admin' && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'text-base-content/70 hover:bg-base-200/50 hover:text-base-content'
                    }`
                  }
                >
                  <Shield size={14} />
                  Admin Hub
                </NavLink>
              )}
            </div>
          )}
        </div>

        {/* Right Actions / User Profile */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="dropdown dropdown-end">
              <button
                type="button"
                tabIndex={0}
                className="group flex items-center gap-2.5 rounded-xl border border-base-300/80 bg-base-200/60 py-1.5 pl-2 pr-3 text-left transition-all hover:border-primary/40 hover:bg-base-200"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-secondary text-xs font-bold text-primary-content shadow-sm">
                  {getInitials(user.firstName)}
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-semibold text-base-content leading-none">
                    {user.firstName || 'User'}
                  </span>
                  <span className="text-[10px] text-base-content/50 capitalize mt-0.5">
                    {user.role || 'Member'}
                  </span>
                </div>
                <ChevronDown size={14} className="text-base-content/40 transition-transform group-hover:text-base-content" />
              </button>

              <ul
                tabIndex={0}
                className="dropdown-content menu menu-sm mt-3 w-56 rounded-2xl border border-base-300 bg-base-100 p-2 shadow-2xl backdrop-blur-lg"
              >
                <li className="menu-title px-3 py-2 border-b border-base-300/60 mb-1">
                  <span className="text-xs font-medium text-base-content/60">Signed in as</span>
                  <p className="truncate text-xs font-semibold text-base-content">{user.emailId || user.email}</p>
                </li>

                <li>
                  <NavLink to="/" end className="flex items-center gap-2 py-2">
                    <BookOpen size={15} />
                    All Problems
                  </NavLink>
                </li>

                {user?.role === 'admin' && (
                  <li>
                    <NavLink to="/admin" className="flex items-center gap-2 py-2 text-primary font-medium">
                      <Shield size={15} />
                      Admin Dashboard
                    </NavLink>
                  </li>
                )}

                <div className="divider my-1 before:bg-base-300/60 after:bg-base-300/60" />

                <li>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2 py-2 text-error hover:bg-error/10 hover:text-error"
                  >
                    <LogOut size={15} />
                    Log Out
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink to="/login" className="btn btn-ghost btn-sm text-xs font-medium">
                Log in
              </NavLink>
              <NavLink
                to="/signup"
                className="btn btn-primary btn-sm text-xs font-medium shadow-sm shadow-primary/20"
              >
                Sign up
              </NavLink>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
