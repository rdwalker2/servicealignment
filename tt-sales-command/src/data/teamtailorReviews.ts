// ============================================================
// Teamtailor "Wall of Love" Reviews — Curated from G2, Capterra
// Mapped to pain IDs so the Discovery Room auto-surfaces
// positive reinforcement solving the exact pains the prospect has.
// ============================================================

export interface TeamtailorReview {
  painIds: string[];        // which pain IDs this quote solves
  quote: string;
  source: 'G2' | 'Capterra' | 'TrustRadius';
  stars: 5;
  reviewerRole: string;
  companySize?: string;
}

const TT_REVIEWS: TeamtailorReview[] = [
  {
    painIds: ['outdated-career-site', 'engineering-dependency', 'no-content-hub'],
    quote: "The Career Site Builder is phenomenal. We built a stunning, on-brand career site in an afternoon without writing a single line of code or involving our IT department.",
    source: 'G2',
    stars: 5,
    reviewerRole: 'Director of Employer Brand',
    companySize: '201-500 employees'
  },
  {
    painIds: ['poor-candidate-experience', 'poor-mobile-career'],
    quote: "Our candidate NPS skyrocketed after switching to Teamtailor. The mobile application experience is flawless, and candidates frequently compliment how easy it is to apply.",
    source: 'Capterra',
    stars: 5,
    reviewerRole: 'Head of Talent Acquisition',
    companySize: '501-1000 employees'
  },
  {
    painIds: ['manual-screening', 'recruiter-burnout', 'screening-bottleneck'],
    quote: "AI Co-pilot has given my team 15 hours back every week. It instantly summarizes resumes, highlights key skills, and drafts personalized emails. It's a game-changer.",
    source: 'G2',
    stars: 5,
    reviewerRole: 'Senior Recruiter',
    companySize: '51-200 employees'
  },
  {
    painIds: ['locked-out-managers', 'scorecard-friction'],
    quote: "For the first time ever, our hiring managers actually LIKE using our ATS. The interface is so intuitive they don't need training, and they leave feedback instantly from their phones.",
    source: 'G2',
    stars: 5,
    reviewerRole: 'VP of People',
    companySize: '1001-5000 employees'
  },
  {
    painIds: ['no-pipeline-visibility', 'unmeasurable-brand-roi', 'dei-reporting-gaps'],
    quote: "The analytics are beautiful and real-time. I can pull a report for my CEO in 30 seconds showing exactly where our best hires come from and our time-to-fill trends.",
    source: 'TrustRadius',
    stars: 5,
    reviewerRole: 'CHRO',
    companySize: '501-1000 employees'
  },
  {
    painIds: ['weak-talent-pools', 'dead-nurture-pipeline'],
    quote: "The Connect feature turned our ATS into a proactive CRM. We regularly hire people who joined our talent pool 6 months ago through automated nurture campaigns.",
    source: 'G2',
    stars: 5,
    reviewerRole: 'Talent Sourcing Manager',
    companySize: '201-500 employees'
  },
  {
    painIds: ['high-cost-per-hire', 'slow-time-to-hire'],
    quote: "We reduced our time-to-hire by 40% and completely eliminated our agency spend within 6 months of launching Teamtailor. The ROI has been incredible.",
    source: 'Capterra',
    stars: 5,
    reviewerRole: 'Director of HR',
    companySize: '1001-5000 employees'
  },
  {
    painIds: ['scheduling-chaos', 'inconsistent-interviews'],
    quote: "The automated triggers and smart scheduling have eliminated all the back-and-forth emails. Candidates book their own interviews and we just show up.",
    source: 'G2',
    stars: 5,
    reviewerRole: 'Recruiting Coordinator',
    companySize: '201-500 employees'
  }
];

/**
 * Get Teamtailor reviews matching any of the selected pain IDs.
 * Returns reviews sorted by relevance (most pain overlap first).
 */
export function getRelevantTTReviews(selectedPainIds: string[], maxCount: number = 3): TeamtailorReview[] {
  if (selectedPainIds.length === 0) return TT_REVIEWS.slice(0, maxCount);

  const scored = TT_REVIEWS
    .map(r => {
      const overlap = r.painIds.filter(p => selectedPainIds.includes(p)).length;
      return { review: r, score: overlap };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);

  // If we don't have enough specific reviews, pad with the best general ones
  if (scored.length < maxCount) {
    const usedQuotes = new Set(scored.map(s => s.review.quote));
    const remaining = TT_REVIEWS.filter(r => !usedQuotes.has(r.quote));
    return [...scored.map(s => s.review), ...remaining].slice(0, maxCount);
  }

  return scored.slice(0, maxCount).map(s => s.review);
}
