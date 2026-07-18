import { useState, useEffect } from 'react';
import { Sparkles, Mail, Phone, Mic, Copy, CheckCircle2, ChevronRight, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface AIPitchContext {
  targetCompany: string;
  contactName?: string;
  openRoles?: number;
  currentAts?: string;
  parentCompany?: string;
  parentNps?: number;
  signals?: string[];
  decisionStructure?: string;
  customVulnerability?: string;
}

interface AIPitchGeneratorProps {
  context: AIPitchContext;
}

type Tab = 'email' | 'voice' | 'call';

export default function AIPitchGenerator({ context }: AIPitchGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('email');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate API delay
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
    }, 1500);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Dynamic Prompt Generation ---
  const { targetCompany, contactName, openRoles, currentAts, parentCompany, parentNps, signals, decisionStructure, customVulnerability } = context;
  
  const cName = contactName || '[First Name]';
  const rolesText = openRoles ? ` for ${openRoles} open roles` : '';
  
  let emailPitch: string;
  let voicePitch: string;
  let callPitch: string;

  // Logic for Global Expansion
  if (parentCompany) {
    emailPitch = `Subject: The ${parentCompany} <> Teamtailor partnership\n\nHi ${cName},\n\nI noticed ${targetCompany} is currently hiring${rolesText} in the US right now. I'm reaching out because your colleagues at your parent company, ${parentCompany}, currently use Teamtailor as their ATS over in Europe.\n\nThey rate the platform highly (giving us an NPS of ${parentNps || 10}), and I was wondering if we could explore bringing that same high-conversion candidate experience to your North American operations to help fill those open roles faster.\n\nOpen to a brief chat next week?`;
    
    voicePitch = `Hey ${cName}, I'm reaching out because we're currently partnering with your colleagues at ${parentCompany} over in Europe. They love using Teamtailor for their hiring, and since I saw ${targetCompany} is scaling up in the US right now, I wanted to see if it makes sense to align your North American TA tech stack with what HQ is doing. Let me know if you're open to a quick intro!`;
    
    callPitch = `Hey ${cName}, it's [Your Name] from Teamtailor. We actually work with your parent company ${parentCompany}—they use us as their global ATS. I was calling because I noticed you're driving the US hiring right now. Are you currently mandated to use their systems, or do you have autonomy over the North American tech stack?`;
  } 
  // Logic for Rip & Replace / ATS Displacement
  else if (currentAts && currentAts !== 'Unknown') {
    const pain = customVulnerability || `rigid workflows and poor candidate experience`;
    
    emailPitch = `Subject: ${currentAts} vs Teamtailor at ${targetCompany}\n\nHi ${cName},\n\nI saw that ${targetCompany} is hiring${rolesText} right now, and I noticed you're currently using ${currentAts}.\n\nMany of our mid-market customers recently switched to us from ${currentAts} because they were struggling with ${pain}. By moving to Teamtailor, they were able to empower their hiring managers directly without needing a dedicated HRIS admin to run simple reports.\n\nAre you open to seeing how we compare to ${currentAts}?`;
    
    voicePitch = `Hey ${cName}, I noticed ${targetCompany} is hiring aggressively right now and that you're using ${currentAts}. A lot of TA leaders I speak with who use ${currentAts} mention it's becoming a bottleneck for candidate conversion. We recently helped a similar company rip it out and replace it with Teamtailor, dropping their time-to-hire by 30%. Would love to share how we did it if you're open to it.`;
    
    callPitch = `Hey ${cName}, this is [Your Name] from Teamtailor. The reason for my call is I noticed you're using ${currentAts} to handle your ${openRoles || 'open'} active roles. Usually when I speak to TA leaders using ${currentAts}, they tell me the candidate experience is hurting their conversion rates. Is that something you're actively trying to solve right now, or are you locked into a multi-year deal?`;
  } 
  // Generic Fallback
  else {
    emailPitch = `Subject: Your open roles at ${targetCompany}\n\nHi ${cName},\n\nI noticed ${targetCompany} is currently hiring${rolesText}. I'm reaching out from Teamtailor—we help companies like yours build high-converting career sites and streamline the ATS experience for hiring managers.\n\nAre you open to a brief chat to see how we could help speed up your time-to-hire?`;
    voicePitch = `Hey ${cName}, noticed you're scaling the team at ${targetCompany}. I'm from Teamtailor, and we've been helping similar companies drastically improve their candidate conversion rates. Let me know if you'd be open to a quick chat.`;
    callPitch = `Hey ${cName}, this is [Your Name] from Teamtailor. I saw you're hiring right now and wanted to see if candidate conversion is a priority for you this quarter?`;
  }

  const activeContent = activeTab === 'email' ? emailPitch : activeTab === 'voice' ? voicePitch : callPitch;

  if (!isGenerated && !isGenerating) {
    return (
      <div className="rounded-xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50/50 to-blue-50/30 p-5 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
          <Sparkles size={24} className="text-indigo-600" />
        </div>
        <h3 className="text-[14px] font-bold text-stone-900 mb-1">Context-Aware Pitch Generator</h3>
        <p className="text-[12px] text-stone-500 max-w-sm mb-4 leading-relaxed">
          Instantly generate highly personalized cold emails, voice notes, and call scripts using this account's firmographics, intent signals, and technical stack.
        </p>
        <button 
          onClick={handleGenerate}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-[13px] font-bold shadow-sm hover:bg-indigo-700 hover:shadow transition-all"
        >
          <Sparkles size={16} />
          Generate Pitch
        </button>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="rounded-xl border border-indigo-200/60 bg-indigo-50/30 p-6 flex flex-col items-center justify-center text-center">
        <RefreshCw size={24} className="text-indigo-500 animate-spin mb-3" />
        <h3 className="text-[13px] font-bold text-indigo-900 mb-1">Analyzing Account Context...</h3>
        <div className="flex flex-col gap-1.5 mt-3 items-start max-w-[200px] w-full mx-auto">
          <div className="flex items-center gap-2 text-[11px] text-indigo-600 font-medium">
            <CheckCircle2 size={12} className="text-indigo-400" /> Parsing {currentAts || 'tech stack'}
          </div>
          {parentCompany && (
            <div className="flex items-center gap-2 text-[11px] text-indigo-600 font-medium">
              <CheckCircle2 size={12} className="text-indigo-400" /> Linking parent {parentCompany}
            </div>
          )}
          <div className="flex items-center gap-2 text-[11px] text-indigo-600 font-medium">
            <CheckCircle2 size={12} className="text-indigo-400" /> Structuring objection hooks
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-stone-200/60 bg-white shadow-sm overflow-hidden flex flex-col">
      <div className="bg-stone-50 border-b border-stone-100 p-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setActiveTab('email')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-colors ${activeTab === 'email' ? 'bg-white text-indigo-700 shadow-sm border border-stone-200/60' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'}`}
          >
            <Mail size={12} /> Email
          </button>
          <button 
            onClick={() => setActiveTab('voice')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-colors ${activeTab === 'voice' ? 'bg-white text-indigo-700 shadow-sm border border-stone-200/60' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'}`}
          >
            <Mic size={12} /> Voice Note
          </button>
          <button 
            onClick={() => setActiveTab('call')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-colors ${activeTab === 'call' ? 'bg-white text-indigo-700 shadow-sm border border-stone-200/60' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'}`}
          >
            <Phone size={12} /> Cold Call
          </button>
        </div>
        <button 
          onClick={() => handleCopy(activeContent)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-bold text-stone-500 hover:bg-stone-100 transition-colors"
        >
          {copied ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      
      <div className="p-4 bg-white relative min-h-[140px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
          >
            <p className="text-[13px] text-stone-800 leading-relaxed whitespace-pre-wrap font-medium">
              {activeContent}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {decisionStructure && (
        <div className="bg-stone-50 border-t border-stone-100 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Strategy</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              decisionStructure === 'Centralized' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' : 
              decisionStructure === 'Localized' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/50' : 
              'bg-amber-50 text-amber-700 border border-amber-200/50'
            }`}>
              {decisionStructure}
            </span>
          </div>
          <span className="text-[10px] text-stone-500 font-medium">
            {decisionStructure === 'Centralized' ? 'Sell global vision to HQ' : decisionStructure === 'Localized' ? 'Sell directly to US Target' : 'Multi-thread HQ & US'}
          </span>
        </div>
      )}
    </div>
  );
}
