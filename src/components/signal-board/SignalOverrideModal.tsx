import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ClayRow } from '../../data/signalBoardData';

interface SignalOverrideModalProps {
  signal: ClayRow;
  onClose: () => void;
  onSave: (updatedSignal: ClayRow) => void;
}

export function SignalOverrideModal({ signal, onClose, onSave }: SignalOverrideModalProps) {
  const [formData, setFormData] = useState<Partial<ClayRow>>({
    full_name: signal.full_name || '',
    job_title: signal.job_title || '',
    linkedin_url: signal.linkedin_url || '',
    email: signal.email || '',
    company_domain: signal.company_domain || '',
    pipeline_stage: signal.pipeline_stage || 'Discovered',
    ai_research_brief: signal.ai_research_brief || '',
    pain_points: signal.pain_points || [],
    recommended_approach: signal.recommended_approach || []
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle array fields
    if (name === 'pain_points' || name === 'recommended_approach') {
      setFormData({ ...formData, [name]: [value] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('clay_signals')
        .update(formData)
        .eq('id', signal.id)
        .select()
        .single();

      if (error) throw error;
      
      onSave(data as SignalData);
      onClose();
    } catch (err) {
      console.error("Failed to update signal:", err);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-900 border border-gray-800 rounded-xl shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">
            Data Governance & Override: {signal.company_name}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 transition-colors rounded-lg hover:text-white hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Persona Section */}
          <div className="p-4 border border-gray-800 rounded-lg bg-gray-800/50">
            <h3 className="mb-4 text-lg font-medium text-white">Target Persona</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-400">Full Name</label>
                <input 
                  type="text" 
                  name="full_name" 
                  value={formData.full_name} 
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-white bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-400">Job Title</label>
                <input 
                  type="text" 
                  name="job_title" 
                  value={formData.job_title} 
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-white bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-400">LinkedIn URL</label>
                <input 
                  type="text" 
                  name="linkedin_url" 
                  value={formData.linkedin_url} 
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-white bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-400">Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-white bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Firmographic Section */}
          <div className="p-4 border border-gray-800 rounded-lg bg-gray-800/50">
            <h3 className="mb-4 text-lg font-medium text-white">Firmographics & Pipeline</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-400">Company Domain</label>
                <input 
                  type="text" 
                  name="company_domain" 
                  value={formData.company_domain} 
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-white bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-400">Pipeline Stage</label>
                <select 
                  name="pipeline_stage" 
                  value={formData.pipeline_stage} 
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-white bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="Discovered">Discovered</option>
                  <option value="AI Researched">AI Researched</option>
                  <option value="Outreach Active">Outreach Active</option>
                  <option value="Conversation Started">Conversation Started</option>
                  <option value="Meeting Set">Meeting Set</option>
                  <option value="Disqualified">Disqualified / Junk</option>
                </select>
              </div>
            </div>
          </div>

          {/* AI Brief Section */}
          <div className="p-4 border border-gray-800 rounded-lg bg-gray-800/50">
            <h3 className="mb-4 text-lg font-medium text-white">AI Intel Overrides</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-400">AI Research Brief</label>
                <textarea 
                  name="ai_research_brief" 
                  value={formData.ai_research_brief} 
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 text-white bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-400">Predicted Pain Points</label>
                <input 
                  type="text" 
                  name="pain_points" 
                  value={formData.pain_points?.[0] || ''} 
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-white bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-400">Recommended Pitch Angle</label>
                <input 
                  type="text" 
                  name="recommended_approach" 
                  value={formData.recommended_approach?.[0] || ''} 
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-white bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 p-4 border-t bg-gray-900/90 border-gray-800/50 backdrop-blur-md">
          <div className="flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 font-medium text-white transition-colors bg-gray-800 rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-500 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Overrides'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
