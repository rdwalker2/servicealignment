import React, { useState } from 'react';
import GTMInfraWalkthrough from './GTMInfraWalkthrough';

export default function BriefingPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'TTGTM2026!') {
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  if (isAuthenticated) {
    return <GTMInfraWalkthrough />;
  }

  return (
    <div className="min-h-screen bg-[#11131a] flex items-center justify-center p-4" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      <div className="bg-[#1e212b] border border-[#2d313f] rounded-2xl p-10 w-full max-w-sm text-center shadow-2xl">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-8 h-8 bg-[#ff3366] rounded-full flex items-center justify-center font-serif text-white text-2xl font-bold italic leading-none pt-0.5 pr-0.5">
            t
          </div>
          <div className="text-[18px] font-semibold text-[#f8fafc] tracking-tight">
            Teamtailor<span className="text-[10px] font-extrabold text-[#ff3366] uppercase tracking-wide ml-1">GTM Workspace</span>
          </div>
        </div>
        
        <h1 className="text-xl font-semibold text-white mb-2">GTM Infrastructure Briefing</h1>
        <p className="text-[#94a3b8] text-sm mb-6">Enter the password to view the data infrastructure walkthrough.</p>
        
        {error && (
          <div className="text-red-500 text-sm mb-4 font-medium animate-pulse">Incorrect password. Please try again.</div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password" 
            autoFocus
            className="w-full bg-[#11131a] border border-[#2d313f] text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#ff3366] transition-colors"
          />
          <button 
            type="submit"
            className="w-full bg-[#ff3366] text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Unlock Briefing
          </button>
        </form>
      </div>
    </div>
  );
}
