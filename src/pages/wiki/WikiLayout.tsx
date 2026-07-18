import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { BookOpen, Layers, Puzzle, Shield, DollarSign, Briefcase, Crosshair } from 'lucide-react';

export default function WikiLayout() {
  return (
    <div className="flex h-full overflow-hidden bg-stone-50">
      {/* ── Left Nav ── */}
      <nav className="h-full flex flex-col bg-white border-r border-stone-200/60 overflow-y-auto" style={{ width: 224, minWidth: 224 }}>
        {/* Header */}
        <div className="px-4 pt-5 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-6 h-6 rounded-md bg-stone-900 flex items-center justify-center shadow-sm">
              <BookOpen size={12} className="text-white" />
            </div>
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Knowledge</span>
          </div>
          <p className="text-[10px] text-stone-400 ml-8">Internal Wikis</p>
        </div>

        {/* ── Product & Tech Category ── */}
        <div className="pt-4 pb-1">
          <p className="px-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Product & Tech</p>
          <div className="px-2 space-y-0.5">
            <NavLink
              to="/team/wiki/product"
              className={({ isActive }) => `w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all group ${
                isActive ? 'bg-stone-100 text-stone-900' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
              }`}
            >
              {({ isActive }) => (
                <>
                  <Layers size={14} className={isActive ? 'text-stone-900' : 'text-stone-400 group-hover:text-stone-600'} />
                  <span>Product Wiki</span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/team/wiki/integrations"
              className={({ isActive }) => `w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all group ${
                isActive ? 'bg-stone-100 text-stone-900' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
              }`}
            >
              {({ isActive }) => (
                <>
                  <Puzzle size={14} className={isActive ? 'text-stone-900' : 'text-stone-400 group-hover:text-stone-600'} />
                  <span>Integrations</span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/team/wiki/security"
              className={({ isActive }) => `w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all group ${
                isActive ? 'bg-stone-100 text-stone-900' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
              }`}
            >
              {({ isActive }) => (
                <>
                  <Shield size={14} className={isActive ? 'text-stone-900' : 'text-stone-400 group-hover:text-stone-600'} />
                  <span>Security & Compliance</span>
                </>
              )}
            </NavLink>
          </div>
        </div>

        {/* ── Go-To-Market Category ── */}
        <div className="pt-3 pb-3">
          <p className="px-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Go-To-Market</p>
          <div className="px-2 space-y-0.5">
            <NavLink
              to="/team/wiki/cs"
              className={({ isActive }) => `w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all group ${
                isActive ? 'bg-stone-100 text-stone-900' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
              }`}
            >
              {({ isActive }) => (
                <>
                  <BookOpen size={14} className={isActive ? 'text-stone-900' : 'text-stone-400 group-hover:text-stone-600'} />
                  <span>CS & Implementation</span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/team/wiki/commercial"
              className={({ isActive }) => `w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all group ${
                isActive ? 'bg-stone-100 text-stone-900' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
              }`}
            >
              {({ isActive }) => (
                <>
                  <DollarSign size={14} className={isActive ? 'text-stone-900' : 'text-stone-400 group-hover:text-stone-600'} />
                  <span>Pricing & Commercials</span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/team/wiki/industry"
              className={({ isActive }) => `w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all group ${
                isActive ? 'bg-stone-100 text-stone-900' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
              }`}
            >
              {({ isActive }) => (
                <>
                  <Briefcase size={14} className={isActive ? 'text-stone-900' : 'text-stone-400 group-hover:text-stone-600'} />
                  <span>Domain & Industry</span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/team/wiki/competitors"
              className={({ isActive }) => `w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all group ${
                isActive ? 'bg-stone-100 text-stone-900' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
              }`}
            >
              {({ isActive }) => (
                <>
                  <Crosshair size={14} className={isActive ? 'text-stone-900' : 'text-stone-400 group-hover:text-stone-600'} />
                  <span>Competitor Intelligence</span>
                </>
              )}
            </NavLink>
          </div>
        </div>
      </nav>

      {/* ── Content Area ── */}
      <div className="flex-1 overflow-hidden relative">
        <Outlet />
      </div>
    </div>
  );
}
