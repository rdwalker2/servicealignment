import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { BusinessCaseDocument } from '../components/discovery/BusinessCaseDocument';
import { DEFAULT_VISIBILITY } from '../components/discovery/RoomSections';

export default function PingRoom() {
  const { id } = useParams<{ id: string }>();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agentResult, setAgentResult] = useState<any>(null);
  
  useEffect(() => {
    async function fetchBusinessCase() {
      try {
        const address = id?.replace(/-/g, ' ') || 'Commercial Property';
        
        // This hits the backend endpoint we set up earlier which runs the Gemini Agent
        const res = await fetch('/api/agent/business-case', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ address })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Failed to generate business case');
        }
        
        setAgentResult(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchBusinessCase();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 rounded-full border-t-2 border-[#FF2A7F] animate-spin" />
        </div>
        <p className="mt-4 text-stone-400 font-mono text-sm tracking-widest uppercase animate-pulse">
          AI Co-Pilot is analyzing roof data...
        </p>
        <p className="mt-2 text-stone-500 text-xs max-w-xs text-center">
          Querying NOAA satellite & permit history for {id?.replace(/-/g, ' ')}. This takes ~15 seconds.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center text-rose-500 font-mono">
        Error generating report: {error}
      </div>
    );
  }

  const companyName = id?.replace(/-/g, ' ').toUpperCase() || 'YOUR COMPANY';
  const { businessCase, summary } = agentResult;

  // We mock a session object to feed into the BusinessCaseDocument so it renders perfectly
  const mockSession = {
    id: 'ai-generated-session',
    cms_accent: '#dc2626',
    cms_subtitle: 'Predictive Roof Health Intelligence',
    cms_confidential: true,
    cms_gradient_1: '#1c1917', // dark stone
    cms_gradient_2: '#450a0a', // very dark red
    cms_gradient_3: '#7f1d1d', // dark red
    roof_health_score: 42,
    roof_signals: ['NOAA Severe Weather Alert', 'Ponding Water Detected'],
    roi_total: 125000,
    trust_enabled_badges: { soc2: true, gdpr: true },
    enabled_proof_customers: ['customer-1', 'customer-2'],
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Branded Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Zap className="text-[#FF2A7F]" size={20} />
            <span className="font-bold tracking-tight text-zinc-900">Service Alignment Engine</span>
          </div>
        </div>
      </header>

      {/* Full 4D Business Case Presentation */}
      <BusinessCaseDocument
        companyName={companyName}
        themeColor="#dc2626"
        selectedPains={['risk', 'cost']}
        session={mockSession as any}
        visibility={DEFAULT_VISIBILITY}
        isRepPreview={false}
        
        // Map 4D Output
        customMessage={summary}
        problemStatement={businessCase.discovery || 'No discovery data generated.'}
        rootCause={businessCase.diagnosis || 'No diagnosis data generated.'}
        currentApproach={businessCase.demo || 'No demo data generated.'}
        urgencyReason={businessCase.decision || 'No decision data generated.'}
        
        repName="AI Co-Pilot"
        showPricing={true}
        onMAPChange={() => {}}
        onContractReadinessChange={() => {}}
      />
    </div>
  );
}
