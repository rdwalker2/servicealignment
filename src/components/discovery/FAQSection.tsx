import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQS = [
  {
    question: "Can't this wait?",
    answer: "It can, but waiting may lead to more costly repairs or disruptions. Addressing it now saves time and money. A single unmitigated leak averages $9,500 in damages and lost productivity."
  },
  {
    question: "How do you know it's failing without a physical inspection?",
    answer: "Our predictive engine tracks NOAA data against the specific installation year of your roof system. Recent weather events in your grid dropped your Roof Health Score below our safety threshold. We want to do a physical inspection to verify the algorithm's findings before water hits your tenants."
  },
  {
    question: "Why should we pay for preventative maintenance?",
    answer: "Without a proactive preventative maintenance plan, your property will experience a 40% accelerated decay rate. Moreover, most manufacturer warranties are voided if there is no documented proof of maintenance."
  },
  {
    question: "Why wasn't this part of our original assessment?",
    answer: "We found these predictive indicators during our routine portfolio monitoring and wanted to alert you immediately so they don't turn into bigger problems later."
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="page" id="faq-section" style={{ padding: '60px 40px', backgroundColor: '#fff' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12 }}>
             Transparency & Trust
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1c1917', marginBottom: 16 }}>
            Frequently Asked Questions
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#57534e', lineHeight: 1.6 }}>
            You have questions about our data and our process. We have answers.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx} 
                style={{ 
                  border: '1px solid #e7e5e4', 
                  borderRadius: 8, 
                  overflow: 'hidden',
                  backgroundColor: isOpen ? '#fafaf9' : '#fff',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    color: '#1c1917'
                  }}
                >
                  {faq.question}
                  <span style={{ color: '#a8a29e', display: 'flex', alignItems: 'center' }}>
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </span>
                </button>
                {isOpen && (
                  <div style={{ padding: '0 24px 24px 24px', color: '#57534e', fontSize: '0.95rem', lineHeight: 1.6 }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
