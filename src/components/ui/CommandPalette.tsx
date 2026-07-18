import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Compass, ArrowRight, LayoutDashboard, CalendarDays, Database, Shield, Phone, FileText, Mail, Trophy } from 'lucide-react';
import { useToast } from './Toast';

interface Command {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  action: () => void;
  shortcut?: string;
  section?: string;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const commands: Command[] = [
    // Performance
    { id: 'dashboard', title: 'My Scorecard', subtitle: 'View your performance dashboard', icon: LayoutDashboard, section: 'Performance', action: () => { navigate('/team'); toast('Opened Dashboard', 'success'); } },
    { id: 'tracker', title: 'Weekly Tracker', subtitle: 'Track weekly activities', icon: CalendarDays, section: 'Performance', action: () => { navigate('/team/planning/tracker'); toast('Opened Weekly Tracker', 'success'); } },
    { id: 'leaderboard', title: 'View Leaderboard', subtitle: 'See team rankings', icon: Trophy, section: 'Performance', action: () => { navigate('/team/leaderboard'); toast('Jumped to Leaderboard', 'success'); } },
    { id: 'data', title: 'Data & Modeling', subtitle: 'Explore data models', icon: Database, section: 'Performance', action: () => { navigate('/team/planning/data'); toast('Opened Data & Modeling', 'success'); } },

    // Deals
    { id: 'discovery', title: 'Open Discovery Room', subtitle: 'Start or continue discovery sessions', icon: Compass, section: 'Deals', action: () => { navigate('/team/discovery'); toast('Opened Discovery Room', 'success'); } },

    // Playbook
    { id: 'battlecards', title: 'Battlecards', subtitle: 'Competitive intelligence', icon: Shield, section: 'Playbook', action: () => { navigate('/enablement/battlecards'); toast('Opened Battlecards', 'success'); } },
    { id: 'setting-meeting', title: 'Setting the Meeting', subtitle: 'Cold outreach playbook', icon: Phone, section: 'Playbook', action: () => { navigate('/enablement/setting-the-meeting'); toast('Opened Setting the Meeting', 'success'); } },
    { id: 'discovery-sheets', title: 'Discovery Sheets', subtitle: 'Call preparation templates', icon: FileText, section: 'Playbook', action: () => { navigate('/enablement/discovery-sheets'); toast('Opened Discovery Sheets', 'success'); } },
    { id: 'outreach', title: 'Outreach Cadence', subtitle: 'Email and call sequences', icon: Mail, section: 'Playbook', action: () => { navigate('/enablement/outreach-cadence'); toast('Opened Outreach Cadence', 'success'); } },
  ];

  const filteredCommands = query === '' 
    ? commands 
    : commands.filter((command) => 
        command.title.toLowerCase().includes(query.toLowerCase()) ||
        (command.subtitle && command.subtitle.toLowerCase().includes(query.toLowerCase())) ||
        (command.section && command.section.toLowerCase().includes(query.toLowerCase()))
      );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const command = filteredCommands[selectedIndex];
      if (command) {
        command.action();
        setIsOpen(false);
      }
    }
  };

  // Group by section for display when not filtering
  const groupedCommands = query === '' 
    ? filteredCommands.reduce<{ section: string; commands: Command[] }[]>((groups, cmd) => {
        const section = cmd.section || 'Other';
        const existing = groups.find(g => g.section === section);
        if (existing) {
          existing.commands.push(cmd);
        } else {
          groups.push({ section, commands: [cmd] });
        }
        return groups;
      }, [])
    : null;

  // Flat index tracker for grouped view
  let flatIndex = -1;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[999] bg-black/30 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-[15%] z-[1000] w-full max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-2xl"
          >
            <div className="flex items-center px-4 py-3 border-b border-gray-200">
              <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search commands or jump to..."
                className="flex-1 bg-transparent border-none text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 text-lg"
              />
              <div className="flex items-center gap-1 text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded">
                ESC
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {filteredCommands.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-sm">No results found.</div>
              ) : groupedCommands ? (
                <div className="space-y-1">
                  {groupedCommands.map((group) => (
                    <div key={group.section}>
                      <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-gray-400 px-3 pt-2 pb-1">{group.section}</p>
                      {group.commands.map((command) => {
                        flatIndex++;
                        const currentIndex = flatIndex;
                        const active = currentIndex === selectedIndex;
                        const Icon = command.icon;
                        return (
                          <button
                            key={command.id}
                            onClick={() => { command.action(); setIsOpen(false); }}
                            onMouseEnter={() => setSelectedIndex(currentIndex)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className={`w-4 h-4 ${active ? 'text-gray-900' : 'text-gray-400'}`} />
                              <div className="text-left">
                                <span className={`text-sm font-medium block ${active ? 'text-gray-900' : 'text-gray-700'}`}>{command.title}</span>
                                {command.subtitle && <span className="text-[10px] text-gray-400 block">{command.subtitle}</span>}
                              </div>
                            </div>
                            {active && <ArrowRight className="w-4 h-4 text-gray-900 opacity-70" />}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredCommands.map((command, index) => {
                    const active = index === selectedIndex;
                    const Icon = command.icon;
                    return (
                      <button
                        key={command.id}
                        onClick={() => { command.action(); setIsOpen(false); }}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${active ? 'text-gray-900' : 'text-gray-400'}`} />
                          <div className="text-left">
                            <span className={`text-sm font-medium block ${active ? 'text-gray-900' : 'text-gray-700'}`}>{command.title}</span>
                            {command.subtitle && <span className="text-[10px] text-gray-400 block">{command.subtitle}</span>}
                          </div>
                        </div>
                        {active && <ArrowRight className="w-4 h-4 text-gray-900 opacity-70" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                </span>
              </div>
              <span className="text-gray-400">{filteredCommands.length} commands</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
