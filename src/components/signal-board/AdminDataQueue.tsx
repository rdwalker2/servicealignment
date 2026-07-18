import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Database, ArrowRight, ServerCrash, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Define the shape of a pending signal
export interface PendingSignal {
  id: string;
  source: string;
  domain: string;
  company_name: string;
  raw_data: any;
  status: string;
  created_at: string;
}

export default function AdminDataQueue() {
  const [pending, setPending] = useState<PendingSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  // Fetch pending signals
  const fetchPending = async () => {
    try {
      setLoading(true);
      // For now, we simulate pending signals from clay_signals if the pending_signals table is empty or missing
      const { data, error } = await supabase
        .from('pending_signals')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
        
      if (error) {
        // Fallback to mock data if table not available yet
        setPending([
          {
            id: 'mock-1',
            source: 'clay',
            domain: 'rippling.com',
            company_name: 'Rippling',
            raw_data: { employee_count: '2001-5000', current_ats: 'Greenhouse' },
            status: 'pending',
            created_at: new Date().toISOString()
          },
          {
            id: 'mock-2',
            source: 'rb2b',
            domain: 'deel.com',
            company_name: 'Deel',
            raw_data: { employee_count: '1001-2000', current_ats: 'Lever' },
            status: 'pending',
            created_at: new Date().toISOString()
          }
        ]);
      } else {
        setPending(data || []);
      }
    } catch (e) {
      console.error('Error fetching pending signals', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (signal: PendingSignal) => {
    setProcessing(signal.id);
    // In a real implementation, this would:
    // 1. Send the signal to the CRM / Accounts table
    // 2. Insert into clay_signals for rep visibility
    // 3. Mark as approved
    try {
      await supabase.from('pending_signals').update({ status: 'approved' }).eq('id', signal.id);
      setPending(prev => prev.filter(p => p.id !== signal.id));
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (signal: PendingSignal) => {
    setProcessing(signal.id);
    try {
      await supabase.from('pending_signals').update({ status: 'rejected' }).eq('id', signal.id);
      setPending(prev => prev.filter(p => p.id !== signal.id));
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-stone-500">
        <RefreshCw className="animate-spin mb-4" size={24} />
        <p className="text-sm font-medium">Loading Admin Data Queue...</p>
      </div>
    );
  }

  if (pending.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4">
          <Database className="text-stone-300" size={28} />
        </div>
        <h3 className="text-lg font-bold text-stone-900 mb-1">Queue is Empty</h3>
        <p className="text-sm text-stone-500 max-w-sm">
          There are no pending data signals from Clay or RB2B waiting for admin approval. Salesforce is safe!
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[16px] font-bold text-stone-900 flex items-center gap-2">
            <Database size={16} className="text-violet-500" /> Admin Data Queue
          </h2>
          <p className="text-[12px] text-stone-500 mt-1">Review enriched data before it overwrites Salesforce.</p>
        </div>
        <div className="bg-stone-100 px-3 py-1 rounded-full text-[11px] font-bold text-stone-600">
          {pending.length} Pending
        </div>
      </div>

      <AnimatePresence>
        {pending.map((signal) => (
          <motion.div
            key={signal.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-white border border-stone-200 shadow-sm rounded-xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-stone-50 border-b border-stone-200 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${signal.source === 'clay' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {signal.source}
                </div>
                <div>
                  <h3 className="text-[13px] font-bold text-stone-900">{signal.company_name || signal.domain}</h3>
                  <p className="text-[11px] text-stone-500">{signal.domain}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleReject(signal)}
                  disabled={processing === signal.id}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-stone-600 hover:bg-stone-200 transition-colors flex items-center gap-1.5"
                >
                  <X size={12} /> Reject
                </button>
                <button
                  onClick={() => handleApprove(signal)}
                  disabled={processing === signal.id}
                  className="px-4 py-1.5 rounded-lg text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  {processing === signal.id ? <RefreshCw size={12} className="animate-spin" /> : <Check size={12} />}
                  Approve & Sync to SFDC
                </button>
              </div>
            </div>

            {/* Diff View */}
            <div className="p-4 grid grid-cols-2 gap-4">
              {/* Salesforce Column */}
              <div className="border border-stone-200 rounded-lg p-3 bg-white">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-3">
                  <h4 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ServerCrash size={12} /> Current Salesforce
                  </h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] text-stone-500 font-medium">Employee Count</p>
                    <p className="text-[12px] font-medium text-stone-800">101-250 (Placeholder)</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-500 font-medium">Current Provider</p>
                    <p className="text-[12px] font-medium text-stone-800">Greenhouse (Placeholder)</p>
                  </div>
                </div>
              </div>

              {/* Clay Enriched Column */}
              <div className="border border-indigo-100 rounded-lg p-3 bg-indigo-50/30">
                <div className="flex items-center justify-between border-b border-indigo-100 pb-2 mb-3">
                  <h4 className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1.5">
                    <ArrowRight size={12} /> New Enriched Data
                  </h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] text-indigo-400 font-medium">Employee Count</p>
                    <p className="text-[12px] font-bold text-indigo-900">
                      {signal.raw_data?.employee_count || 'Unknown'}
                      <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">Diff</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-indigo-400 font-medium">Current Provider</p>
                    <p className="text-[12px] font-bold text-indigo-900">
                      {signal.raw_data?.current_ats || 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
