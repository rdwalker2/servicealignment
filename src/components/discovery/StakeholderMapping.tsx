import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Crown, Shield, Wallet, MonitorSmartphone, Plus, X, User, Star, Briefcase, Mail, ExternalLink, Check, AlertTriangle, Zap, Search } from 'lucide-react';
import type { DiscoverySession, Stakeholder } from '../../lib/discoveryDatabase';
import { CleanCard } from '../ui/CleanUI';
import { PERSONAS } from './PainDiscoveryModule';
import { supabase } from '../../lib/supabase';

const SF_BASE = 'https://servicealignment.lightning.force.com';

interface Props {
  session: DiscoverySession;
  onChange: (stakeholders: Stakeholder[]) => void;
  hideHeader?: boolean;
}

interface ContactMatch {
  email: string;
  name: string;
  title: string;
  sf_contact_id: string | null;
  salesloft_id: number | null;
  in_active_cadence: boolean;
  cadence_name: string | null;
  domain: string | null;
}

const DEFAULT_ROLES = [
  { id: 'champion', role: 'Champion', description: 'Your internal advocate who sells when you\'re not in the room', icon: Star, color: 'text-pink-500', bg: 'bg-pink-100' },
  { id: 'economic', role: 'Economic Buyer', description: 'Person with budget authority & final sign-off', icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-100' },
  { id: 'project-lead', role: 'Project Lead', description: 'Driving the evaluation', icon: Crown, color: 'text-amber-500', bg: 'bg-amber-100' },
  { id: 'finance', role: 'Finance / CFO', description: 'Budget & ROI alignment', icon: Briefcase, color: 'text-sky-500', bg: 'bg-sky-100' },
  { id: 'technical', role: 'IT Approver', description: 'Security & Integration', icon: MonitorSmartphone, color: 'text-blue-500', bg: 'bg-blue-100' },
  { id: 'legal', role: 'Legal & Procurement', description: 'Contract & Compliance', icon: Shield, color: 'text-purple-500', bg: 'bg-purple-100' },
];

function buildSalesforceUrl(stakeholder: Stakeholder, session: DiscoverySession): string {
  const params: string[] = [];
  const [first, ...rest] = (stakeholder.name || '').split(' ');
  if (first) params.push(`FirstName=${encodeURIComponent(first)}`);
  if (rest.length) params.push(`LastName=${encodeURIComponent(rest.join(' '))}`);
  if (stakeholder.title) params.push(`Title=${encodeURIComponent(stakeholder.title)}`);
  if (stakeholder.email) params.push(`Email=${encodeURIComponent(stakeholder.email)}`);
  if (session.sfdc_account_id) params.push(`AccountId=${encodeURIComponent(session.sfdc_account_id)}`);
  return `${SF_BASE}/lightning/o/Contact/new?defaultFieldValues=${params.join(',')}`;
}

export function StakeholderMapping({ session, onChange, hideHeader }: Props) {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>(session.stakeholders || []);
  const [domainContacts, setDomainContacts] = useState<ContactMatch[]>([]);
  const [searchingId, setSearchingId] = useState<string | null>(null);

  // Fetch all contacts for this company's domain for auto-suggest
  useEffect(() => {
    const domain = session.company_domain;
    if (!domain) return;
    
    (async () => {
      const { data } = await supabase
        .from('contacts')
        .select('email, name, title, sf_contact_id, salesloft_id, in_active_cadence, cadence_name, domain')
        .eq('domain', domain)
        .order('name');
      if (data) setDomainContacts(data as ContactMatch[]);
    })();
  }, [session.company_domain]);

  // Auto-link stakeholder when email is entered
  const autoLinkByEmail = useCallback(async (stakeholderId: string, email: string) => {
    if (!email || !email.includes('@')) return;
    
    const { data } = await supabase
      .from('contacts')
      .select('email, name, title, sf_contact_id, salesloft_id, in_active_cadence, cadence_name')
      .eq('email', email.toLowerCase().trim())
      .limit(1);
    
    if (data && data.length > 0) {
      const contact = data[0];
      setStakeholders(prev => {
        const updated = prev.map(s => s.id === stakeholderId ? {
          ...s,
          email: contact.email,
          name: s.name || contact.name || '',
          title: s.title || contact.title || '',
          sf_contact_id: contact.sf_contact_id || undefined,
          salesloft_id: contact.salesloft_id || undefined,
          in_active_cadence: contact.in_active_cadence || false,
          cadence_name: contact.cadence_name || undefined,
        } : s);
        onChange(updated);
        return updated;
      });
    }
  }, [onChange]);

  const handleAdd = (role: string) => {
    const newStakeholder: Stakeholder = {
      id: Math.random().toString(36).substr(2, 9),
      role,
      name: '',
      title: '',
    };
    const updated = [...stakeholders, newStakeholder];
    setStakeholders(updated);
    onChange(updated);
  };

  const handleUpdate = (id: string, field: keyof Stakeholder, value: string) => {
    const updated = stakeholders.map(s => s.id === id ? { ...s, [field]: value } : s);
    setStakeholders(updated);
    onChange(updated);

    // Auto-link when email is entered
    if (field === 'email' && value.includes('@') && value.includes('.')) {
      autoLinkByEmail(id, value);
    }
  };

  const handleSelectContact = (stakeholderId: string, contact: ContactMatch) => {
    const updated = stakeholders.map(s => s.id === stakeholderId ? {
      ...s,
      name: contact.name || s.name,
      title: contact.title || s.title,
      email: contact.email,
      sf_contact_id: contact.sf_contact_id || undefined,
      salesloft_id: contact.salesloft_id || undefined,
      in_active_cadence: contact.in_active_cadence || false,
      cadence_name: contact.cadence_name || undefined,
    } : s);
    setStakeholders(updated);
    onChange(updated);
    setSearchingId(null);
  };

  const handleRemove = (id: string) => {
    const updated = stakeholders.filter(s => s.id !== id);
    setStakeholders(updated);
    onChange(updated);
  };

  // Filter contacts not already assigned as stakeholders
  const availableContacts = domainContacts.filter(c => 
    !stakeholders.some(s => s.email === c.email)
  );

  return (
    <div className="w-full mx-auto pb-10 mb-10 border-b border-zinc-200">
      {!hideHeader && (
        <div className="mb-6 text-center">
          <h3 className="text-xl font-bold text-zinc-900 mb-2">
            Who is evaluating the platform?
          </h3>
          <p className="text-sm text-zinc-500 max-w-2xl mx-auto">
            Map out the key stakeholders to instantly customize their specific objectives and pain points below.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8">
        {DEFAULT_ROLES.map(preset => {
          const Icon = preset.icon;
          const existing = stakeholders.filter(s => s.role === preset.role);

          return (
            <CleanCard key={preset.id} className="flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${preset.bg}`}>
                  <Icon className={`w-5 h-5 ${preset.color}`} />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 leading-tight">{preset.role}</h3>
                  <p className="text-[11px] text-zinc-500">{preset.description}</p>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <AnimatePresence>
                  {existing.map(s => (
                    <motion.div 
                      key={s.id} 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-zinc-50 rounded-xl p-3 border border-zinc-200 relative group"
                    >
                      <button 
                        onClick={() => handleRemove(s.id)}
                        className="absolute -top-2 -right-2 bg-white rounded-full p-1 border border-zinc-200 text-zinc-400 hover:text-rose-500 hover:border-rose-200 opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10"
                      >
                        <X size={12} />
                      </button>

                      {/* Name */}
                      <input 
                        type="text" 
                        placeholder="Name" 
                        value={s.name}
                        onChange={(e) => handleUpdate(s.id, 'name', e.target.value)}
                        className="w-full bg-transparent border-none p-0 text-sm font-bold text-zinc-900 placeholder:text-zinc-400 focus:ring-0 mb-1"
                      />

                      {/* Title */}
                      <input 
                        type="text" 
                        placeholder="Job Title" 
                        value={s.title}
                        onChange={(e) => handleUpdate(s.id, 'title', e.target.value)}
                        className="w-full bg-transparent border-none p-0 text-[11px] text-zinc-500 placeholder:text-zinc-400 focus:ring-0 mb-1"
                      />

                      {/* Email */}
                      <div className="flex items-center gap-1 mb-2">
                        <Mail size={10} className="text-zinc-400 shrink-0" />
                        <input 
                          type="email" 
                          placeholder="email@company.com" 
                          value={s.email || ''}
                          onChange={(e) => handleUpdate(s.id, 'email', e.target.value)}
                          className="w-full bg-transparent border-none p-0 text-[11px] text-zinc-500 placeholder:text-zinc-400 focus:ring-0"
                        />
                        {/* Search existing contacts button */}
                        {!s.email && availableContacts.length > 0 && (
                          <button
                            onClick={() => setSearchingId(searchingId === s.id ? null : s.id)}
                            className="shrink-0 p-1 rounded hover:bg-zinc-200 transition-colors"
                            title="Search existing contacts"
                          >
                            <Search size={10} className="text-zinc-400" />
                          </button>
                        )}
                      </div>

                      {/* Contact search dropdown */}
                      {searchingId === s.id && availableContacts.length > 0 && (
                        <div className="mb-2 max-h-32 overflow-y-auto rounded-lg border border-zinc-200 bg-white divide-y divide-zinc-100">
                          {availableContacts.slice(0, 8).map(c => (
                            <button
                              key={c.email}
                              onClick={() => handleSelectContact(s.id, c)}
                              className="w-full text-left px-2.5 py-1.5 hover:bg-blue-50 transition-colors flex items-center justify-between"
                            >
                              <div>
                                <div className="text-[11px] font-semibold text-zinc-800">{c.name}</div>
                                <div className="text-[9px] text-zinc-500">{c.title || c.email}</div>
                              </div>
                              <div className="flex items-center gap-1">
                                {c.sf_contact_id && <span className="text-[8px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">SF</span>}
                                {c.in_active_cadence && <span className="text-[8px] font-bold text-violet-500 bg-violet-50 px-1.5 py-0.5 rounded">Cadence</span>}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Sync status badges */}
                      {s.email && (
                        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                          {s.sf_contact_id ? (
                            <a 
                              href={`https://servicealignment.lightning.force.com/lightning/r/Contact/${s.sf_contact_id}/view`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 hover:bg-emerald-100 transition-colors"
                            >
                              <Check size={8} /> In Salesforce
                              <ExternalLink size={7} />
                            </a>
                          ) : (
                            <a 
                              href={buildSalesforceUrl(s, session)} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 hover:bg-amber-100 transition-colors"
                            >
                              <AlertTriangle size={8} /> Not in Salesforce
                              <ExternalLink size={7} />
                            </a>
                          )}
                          {s.in_active_cadence && s.cadence_name && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-200">
                              <Zap size={8} /> {s.cadence_name}
                            </span>
                          )}
                          {s.salesloft_id && !s.in_active_cadence && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                              <Check size={8} /> In SalesLoft
                            </span>
                          )}
                        </div>
                      )}

                      {/* Persona select */}
                      <select
                        value={s.persona_id || ''}
                        onChange={(e) => handleUpdate(s.id, 'persona_id', e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded p-1 text-[10px] text-zinc-600 focus:outline-none focus:border-stone-300"
                      >
                        <option value="" disabled>Select Profile...</option>
                        {PERSONAS.map(p => (
                          <option key={p.id} value={p.id}>{p.label}</option>
                        ))}
                      </select>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                <button 
                  onClick={() => handleAdd(preset.role)}
                  className="w-full py-2.5 rounded-xl border border-dashed border-zinc-300 text-zinc-500 text-xs font-bold hover:bg-zinc-50 hover:border-stone-300/30 hover:text-stone-800 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={14} /> Add {preset.role}
                </button>
              </div>
            </CleanCard>
          );
        })}
      </div>

      <div className="hidden">
      </div>
    </div>
  );
}
