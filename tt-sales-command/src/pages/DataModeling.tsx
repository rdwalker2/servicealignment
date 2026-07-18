import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  Target, 
  TrendingUp, 
  PhoneCall, 
  Users, 
  Briefcase, 
  Award,
  Zap,
  ArrowRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function DataModeling() {
  // Model Inputs
  const [targetQuota, setTargetQuota] = useState(1000000);
  const [avgDealSize, setAvgDealSize] = useState(45000);
  
  // Conversion Rates
  const [winRate, setWinRate] = useState(25); // Deals / D3
  const [d3Conversion, setD3Conversion] = useState(40); // D3 / D1
  const [meetingConversion, setMeetingConversion] = useState(15); // D1 / Calls

  // Calculations (Reverse Waterfall)
  const dealsNeeded = Math.ceil(targetQuota / avgDealSize);
  const d3Needed = Math.ceil(dealsNeeded / (winRate / 100));
  const meetingsNeeded = Math.ceil(d3Needed / (d3Conversion / 100));
  const callsNeeded = Math.ceil(meetingsNeeded / (meetingConversion / 100));

  const data = [
    { name: 'Calls', value: callsNeeded, color: '#0ea5e9' },
    { name: 'D1 Meetings', value: meetingsNeeded, color: '#8b5cf6' },
    { name: 'D3 Demos', value: d3Needed, color: '#f59e0b' },
    { name: 'Wins', value: dealsNeeded, color: '#10b981' }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-stone-200 p-8 font-sans selection:bg-[#FF2A7F]/20 selection:text-[#FF2A7F]">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF2A7F]/30 bg-[#FF2A7F]/10 px-3 py-1 text-xs font-semibold text-[#FF2A7F] mb-4">
              <Calculator size={14} />
              Capacity Modeler
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Reverse Waterfall</h1>
            <p className="text-stone-400">Model your required pipeline activity based on historical conversion rates.</p>
          </div>
          <button className="flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors border border-stone-700 hover:border-stone-600 shadow-sm">
            <TrendingUp size={16} />
            Save Model
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Inputs Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-6 flex items-center gap-2">
                <Target size={16} />
                Targets & Value
              </h3>
              
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-semibold text-stone-300">Annual Quota ($)</label>
                    <span className="text-xs font-bold text-[#FF2A7F]">${targetQuota.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" 
                    min="100000" max="2500000" step="50000"
                    value={targetQuota}
                    onChange={(e) => setTargetQuota(Number(e.target.value))}
                    className="w-full accent-[#FF2A7F] h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-semibold text-stone-300">Avg Deal Size ($)</label>
                    <span className="text-xs font-bold text-white">${avgDealSize.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" 
                    min="10000" max="150000" step="5000"
                    value={avgDealSize}
                    onChange={(e) => setAvgDealSize(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="h-px bg-stone-800 my-6" />

              <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-6 flex items-center gap-2">
                <Zap size={16} />
                Conversion Rates
              </h3>
              
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-semibold text-stone-300">Win Rate (D3 → Closed)</label>
                    <span className="text-xs font-bold text-white">{winRate}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="5" max="80" step="1"
                    value={winRate}
                    onChange={(e) => setWinRate(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-semibold text-stone-300">Demo Rate (D1 → D3)</label>
                    <span className="text-xs font-bold text-white">{d3Conversion}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" max="90" step="1"
                    value={d3Conversion}
                    onChange={(e) => setD3Conversion(Number(e.target.value))}
                    className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-semibold text-stone-300">Meeting Rate (Call → D1)</label>
                    <span className="text-xs font-bold text-white">{meetingConversion}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" max="40" step="1"
                    value={meetingConversion}
                    onChange={(e) => setMeetingConversion(Number(e.target.value))}
                    className="w-full accent-sky-500 h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Visualization Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-stone-900 border border-stone-800 p-5 rounded-2xl">
                <PhoneCall size={18} className="text-sky-500 mb-3" />
                <p className="text-2xl font-black text-white">{callsNeeded.toLocaleString()}</p>
                <p className="text-[10px] uppercase tracking-wider text-stone-500 font-bold mt-1">Outreach Needed</p>
              </motion.div>
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-stone-900 border border-stone-800 p-5 rounded-2xl">
                <Users size={18} className="text-violet-500 mb-3" />
                <p className="text-2xl font-black text-white">{meetingsNeeded.toLocaleString()}</p>
                <p className="text-[10px] uppercase tracking-wider text-stone-500 font-bold mt-1">D1 Meetings</p>
              </motion.div>
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-stone-900 border border-stone-800 p-5 rounded-2xl">
                <Briefcase size={18} className="text-amber-500 mb-3" />
                <p className="text-2xl font-black text-white">{d3Needed.toLocaleString()}</p>
                <p className="text-[10px] uppercase tracking-wider text-stone-500 font-bold mt-1">D3 Demos</p>
              </motion.div>
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-stone-900 border border-stone-800 p-5 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl transform translate-x-1/2 -translate-y-1/2" />
                <Award size={18} className="text-emerald-500 mb-3" />
                <p className="text-2xl font-black text-emerald-400">{dealsNeeded.toLocaleString()}</p>
                <p className="text-[10px] uppercase tracking-wider text-emerald-600/60 font-bold mt-1">Wins Needed</p>
              </motion.div>
            </div>

            {/* Chart */}
            <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl shadow-xl h-[400px] flex flex-col">
              <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-6">Funnel Visualization</h3>
              <div className="flex-1 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#292524" />
                    <XAxis type="number" stroke="#57534e" tick={{ fill: '#78716c', fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" stroke="#57534e" tick={{ fill: '#a8a29e', fontSize: 13, fontWeight: 600 }} width={90} />
                    <Tooltip 
                      cursor={{ fill: '#1c1917' }} 
                      contentStyle={{ backgroundColor: '#1c1917', borderColor: '#292524', borderRadius: '12px', color: '#fff', fontWeight: 'bold' }} 
                    />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={50} animationDuration={1000}>
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weekly Breakdown */}
            <div className="bg-[#FF2A7F]/5 border border-[#FF2A7F]/20 p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[#FF2A7F]/10 p-2 rounded-lg text-[#FF2A7F]">
                  <ArrowRight size={16} />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Weekly Action Plan</h3>
              </div>
              <p className="text-sm text-stone-300 leading-relaxed mb-4">
                To achieve a quota of <strong className="text-white">${targetQuota.toLocaleString()}</strong>, you need to generate 
                approximately <strong className="text-emerald-400">{Math.ceil(dealsNeeded / 52)} win(s)</strong> per week.
              </p>
              <div className="grid grid-cols-3 gap-4 border-t border-[#FF2A7F]/10 pt-5">
                <div>
                  <p className="text-2xl font-black text-sky-400">{Math.ceil(callsNeeded / 52)}</p>
                  <p className="text-xs text-sky-500/70 font-semibold uppercase tracking-wider mt-1">Calls / Wk</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-violet-400">{Math.ceil(meetingsNeeded / 52)}</p>
                  <p className="text-xs text-violet-500/70 font-semibold uppercase tracking-wider mt-1">D1s / Wk</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-amber-400">{Math.ceil(d3Needed / 52)}</p>
                  <p className="text-xs text-amber-500/70 font-semibold uppercase tracking-wider mt-1">Demos / Wk</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
