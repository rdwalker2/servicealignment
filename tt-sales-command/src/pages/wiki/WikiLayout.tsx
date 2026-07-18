import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { BookOpen, Layers } from 'lucide-react';

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

        <div className="flex-1 py-3 px-2 space-y-1">
          <NavLink
            to="/team/wiki/product"
            className={({ isActive }) => `w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] font-semibold transition-all group ${
              isActive
                ? 'bg-stone-100 text-stone-900'
                : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
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
            to="/team/wiki/cs"
            className={({ isActive }) => `w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] font-semibold transition-all group ${
              isActive
                ? 'bg-stone-100 text-stone-900'
                : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
            }`}
          >
            {({ isActive }) => (
              <>
                <BookOpen size={14} className={isActive ? 'text-stone-900' : 'text-stone-400 group-hover:text-stone-600'} />
                <span>CS & Implementation</span>
              </>
            )}
          </NavLink>
        </div>
      </nav>

      {/* ── Content Area ── */}
      <div className="flex-1 overflow-hidden relative">
        <Outlet />
      </div>
    </div>
  );
}
