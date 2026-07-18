export interface IntelligenceResult {
  domain: string;
  companyName: string;
  ats: string;
  pains: string[];
  persona: string;
  signals: string[];
  displacementAngle: string;
  employeeCount: string;
}

/**
 * Lead Intelligence Engine
 * 
 * Simulates OSINT (Open Source Intelligence) scanning of a company's domain
 * to extract their current tech stack (Provider), hiring pains (via Glassdoor/Indeed reviews),
 * and ideal buyer persona before the rep even joins the call.
 */
export class LeadIntelligenceEngine {
  public static async scanDomain(domain: string): Promise<IntelligenceResult> {
    // Simulate deep scanning network latency (1.5s - 2.5s)
    const latency = Math.floor(Math.random() * 1000) + 1500;
    await new Promise((resolve) => setTimeout(resolve, latency));

    const normalizedDomain = domain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/^www\./, '');

    // 1. Tech Giant (e.g., Stripe, Uber)
    if (normalizedDomain.includes('stripe') || normalizedDomain.includes('uber') || normalizedDomain.includes('airbnb')) {
      return {
        domain: normalizedDomain,
        companyName: normalizedDomain.split('.')[0].charAt(0).toUpperCase() + normalizedDomain.split('.')[0].slice(1),
        ats: 'greenhouse',
        pains: ['experience', 'time'],
        persona: 'ta_leader',
        employeeCount: '5000+',
        signals: [
          'Detected Greenhouse API endpoints on careers page.',
          'Glassdoor reviews mention "slow interview process" (High Time-to-Hire risk).',
          'Heavy engineering hiring footprint detected.',
        ],
        displacementAngle: 'Greenhouse is slowing down their engineering hires. Service Alignment can cut time-to-hire by 30% while offering a candidate experience that engineers actually respect.',
      };
    }

    // 2. Retail / Volume Hiring (e.g., Walmart, Target, Starbucks)
    if (normalizedDomain.includes('walmart') || normalizedDomain.includes('starbucks') || normalizedDomain.includes('target')) {
      return {
        domain: normalizedDomain,
        companyName: normalizedDomain.split('.')[0].charAt(0).toUpperCase() + normalizedDomain.split('.')[0].slice(1),
        ats: 'workday',
        pains: ['volume', 'dropoff'],
        persona: 'hr_director',
        employeeCount: '10,000+',
        signals: [
          'Workday recruitment module detected.',
          'High mobile traffic to careers page, but poor mobile conversion rate.',
          'Store managers complaining about applicant tracking visibility.',
        ],
        displacementAngle: 'Workday is a massive ERP, but terrible for high-volume retail hiring. Service Alignment\'s mobile-first apply process will capture the 40% of retail workers currently abandoning the Workday application.',
      };
    }

    // 3. Modern Startup / SMB (e.g., Vercel, Linear)
    if (normalizedDomain.includes('vercel') || normalizedDomain.includes('linear') || normalizedDomain.includes('notion')) {
      return {
        domain: normalizedDomain,
        companyName: normalizedDomain.split('.')[0].charAt(0).toUpperCase() + normalizedDomain.split('.')[0].slice(1),
        ats: 'lever',
        pains: ['employer_brand', 'passive'],
        persona: 'founder',
        employeeCount: '100 - 500',
        signals: [
          'Lever forms detected on /careers.',
          'Strong social media presence, but careers page is a standard Lever template.',
          'High competition for niche technical talent.',
        ],
        displacementAngle: 'They have an incredible consumer brand, but their Lever careers page looks just like everyone else\'s. Service Alignment lets them build a stunning, bespoke employer brand to attract passive 10x engineers.',
      };
    }

    // Default Fallback
    const fallbackName = normalizedDomain.split('.')[0] || 'Unknown';
    const formattedName = fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1);

    return {
      domain: normalizedDomain,
      companyName: formattedName,
      ats: 'other',
      pains: ['experience', 'dropoff'],
      persona: 'ta_leader',
      employeeCount: '250 - 1000',
      signals: [
        'Generic current provider detected.',
        'High candidate drop-off rate on standard application forms.',
        'No active talent pool nurturing campaigns found.',
      ],
      displacementAngle: 'Their current process is highly transactional. Service Alignment will help them shift to a proactive talent pooling model with a superior candidate experience.',
    };
  }
}
