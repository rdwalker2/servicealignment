export interface ObjectionAnalysis {
  objection_type: 'pricing' | 'timeline' | 'competition' | 'feature' | 'other';
  prospect_quote: string;
  rep_response: string;
  grade: 'Pass' | 'Fail' | 'Needs Improvement';
  feedback: string;
}

export interface HappyEarsWarning {
  bap_question_id: string; // e.g. 'q1'
  warning_text: string;
}

export interface TranscriptAnalysis {
  objections: ObjectionAnalysis[];
  happy_ears_warnings: HappyEarsWarning[];
  coaching_adherence_score: number; // 0-100
  talk_ratio: number; // e.g. 0.45 = 45% rep talk time
  summary_feedback: string;
}

export async function analyzeTranscript(transcript: string, existingBapAnswers: Record<string, any>): Promise<TranscriptAnalysis> {
  // In a real implementation, this would call an LLM with the transcript and the existing BAP answers.
  // For this mock, we will use basic heuristics to simulate LLM extraction.
  
  const analysis: TranscriptAnalysis = {
    objections: [],
    happy_ears_warnings: [],
    coaching_adherence_score: 80,
    talk_ratio: 0.55,
    summary_feedback: "Rep handled the discovery well but missed a critical pricing objection.",
  };

  const lowerTranscript = transcript.toLowerCase();

  // Mock Objection Detection
  if (lowerTranscript.includes('expensive') || lowerTranscript.includes('budget') || lowerTranscript.includes('cost')) {
    analysis.objections.push({
      objection_type: 'pricing',
      prospect_quote: "It seems a bit expensive for our current budget.",
      rep_response: "I understand, we can discuss volume discounts.",
      grade: 'Needs Improvement',
      feedback: "Rep folded on price too quickly instead of anchoring on value."
    });
  }

  if (lowerTranscript.includes('competitor') || lowerTranscript.includes('workday') || lowerTranscript.includes('greenhouse')) {
    analysis.objections.push({
      objection_type: 'competition',
      prospect_quote: "We are also evaluating Greenhouse.",
      rep_response: "Greenhouse is good, but our UI is better.",
      grade: 'Fail',
      feedback: "Never bash the competition directly. Focus on your unique differentiators instead."
    });
  }

  // Mock Happy Ears Detection
  if (existingBapAnswers['q1'] && existingBapAnswers['q1'] >= 8) {
    if (!lowerTranscript.includes('pain') && !lowerTranscript.includes('problem') && !lowerTranscript.includes('struggle')) {
      analysis.happy_ears_warnings.push({
        bap_question_id: 'q1',
        warning_text: "Rep marked 'Identify Pain' highly, but the transcript lacks explicit statements of customer pain."
      });
    }
  }

  if (existingBapAnswers['q4'] === 'Yes') {
    if (!lowerTranscript.includes('budget') && !lowerTranscript.includes('approved')) {
      analysis.happy_ears_warnings.push({
        bap_question_id: 'q4',
        warning_text: "Budget marked as secured, but there was no mention of budget approval in this call."
      });
    }
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  return analysis;
}
