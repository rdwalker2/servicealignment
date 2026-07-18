import { useState } from 'react';
import { WikiPage } from './WikiPage';
import { integrationsWikiData } from '../../data/integrationsWiki';
import { INTEGRATION_ROLES, INTEGRATION_WORKFLOWS, INTEGRATION_FAQS, INTEGRATION_RULES } from '../../data/integrationOps';
import { API_SCHEMAS } from '../../data/apiSchemas';
import { DocHeader, DocSection, Callout } from '../../components/process/DocComponents';

function OperationsHub() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader 
        title="Integration Operations" 
        subtitle="The playbooks, rules of engagement, and escalation paths for working with our Integrations Team." 
      />

      <DocSection title="Meet the Team">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {INTEGRATION_ROLES.map((role, i) => (
            <div key={i} className="border border-stone-200 p-4 rounded-lg bg-stone-50/50">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-bold text-stone-900">{role.title}</h4>
              </div>
              <p className="text-[11px] font-bold text-[#FF2A7F] uppercase tracking-wider mb-2">{role.focus}</p>
              <p className="text-[13px] text-stone-600 leading-relaxed">{role.description}</p>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection title="Request Workflows">
        <div className="space-y-6 mt-2">
          {INTEGRATION_WORKFLOWS.map((wf, i) => (
            <div key={i} className="border border-stone-200 rounded-lg bg-white overflow-hidden">
              <div className="bg-stone-50 border-b border-stone-200 p-4">
                <h4 className="font-bold text-stone-900">{wf.title}</h4>
                <p className="text-[13px] text-stone-600 mt-1">{wf.description}</p>
              </div>
              <div className="p-4">
                <h5 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2">Process</h5>
                <ul className="space-y-2 mb-4">
                  {wf.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[13px] text-stone-700">
                      <span className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-bold text-stone-500 shrink-0">{idx + 1}</span>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ul>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-stone-100">
                  <div>
                    <h5 className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-2">Pros</h5>
                    <ul className="space-y-1">
                      {wf.pros.map((pro, idx) => <li key={idx} className="text-[12px] text-stone-600 leading-snug">• {pro}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-rose-600 uppercase tracking-widest mb-2">Cons</h5>
                    <ul className="space-y-1">
                      {wf.cons.map((con, idx) => <li key={idx} className="text-[12px] text-stone-600 leading-snug">• {con}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection title="Rules of Engagement">
        <Callout type="warning" title="Strict Escalation Paths">
          <ul className="space-y-3 mt-2">
            {INTEGRATION_RULES.map((rule, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-[13px] text-stone-800 leading-relaxed">• {rule}</span>
              </li>
            ))}
          </ul>
        </Callout>
      </DocSection>

      <DocSection title="Rep FAQs">
        <div className="space-y-4 mt-2">
          {INTEGRATION_FAQS.map((faq, i) => (
            <div key={i} className="border border-stone-200 p-4 rounded-lg bg-stone-50">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="font-bold text-stone-900 text-sm">{faq.question}</p>
                <span className="px-2 py-0.5 rounded bg-stone-200 text-[10px] font-bold text-stone-600 uppercase tracking-widest shrink-0">
                  {faq.audience}
                </span>
              </div>
              <p className="text-[13px] text-stone-700 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </DocSection>
    </div>
  );
}

function ApiSchemasViewer() {
  return (
    <div className="p-8 max-w-6xl mx-auto w-full space-y-12 pb-24">
      <div>
        <h1 className="text-3xl font-black text-stone-900 tracking-tight mb-2 flex items-center gap-3">
          <Database className="text-[#FF2A7F]" size={28} /> Developer API Schemas
        </h1>
        <p className="text-stone-500 text-lg">Static JSON payloads for common endpoints. Use these to verify technical capabilities on calls.</p>
      </div>

      <div className="space-y-8">
        {API_SCHEMAS.map(schema => (
          <div key={schema.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-stone-100 bg-stone-50">
              <h2 className="font-black text-stone-900 mb-1">{schema.name} Payload</h2>
              <p className="text-stone-500 text-sm">{schema.description}</p>
            </div>
            <div className="bg-stone-900 p-5">
              <pre className="text-[13px] text-green-400 font-mono overflow-x-auto">
                <code>{schema.payload}</code>
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function IntegrationsWiki() {
  const [activeTab, setActiveTab] = useState<'operations' | 'catalog' | 'api'>('catalog');

  return (
    <div className="flex flex-col h-full bg-stone-50 overflow-hidden">
      {/* ── Top Tabs ── */}
      <div className="flex items-center gap-1 px-8 pt-6 pb-2 border-b border-stone-200 bg-white shrink-0">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'catalog' 
              ? 'bg-[#FF2A7F] text-white shadow-md' 
              : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'
          }`}
        >
          Tech Partner Catalog
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'api' 
              ? 'bg-purple-600 text-white shadow-md' 
              : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'
          }`}
        >
          API Schemas
        </button>
        <button
          onClick={() => setActiveTab('operations')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'operations' 
              ? 'bg-stone-900 text-white shadow-md' 
              : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'
          }`}
        >
          Operations & Workflows
        </button>
      </div>

      {/* ── Content Area ── */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'operations' ? (
          <OperationsHub />
        ) : activeTab === 'catalog' ? (
          <div className="p-8">
            <WikiPage title="Tech Partner Catalog" data={integrationsWikiData} />
          </div>
        ) : (
          <ApiSchemasViewer />
        )}
      </div>
    </div>
  );
}
