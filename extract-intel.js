import dotenv from 'dotenv';
dotenv.config();

const GRANOLA_API_BASE = 'https://public-api.granola.ai/v1';
const GRANOLA_API_KEY = process.env.GRANOLA_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Note ID for 'Teamtailor x Farmers District 40 Initial Demo'
const NOTE_ID = 'not_yIP6ogQeQgZOQT'; 

async function extractIntel() {
  console.log('Fetching note details from Granola...');
  const resp = await fetch(`${GRANOLA_API_BASE}/notes/${NOTE_ID}`, {
    headers: {
      'Authorization': `Bearer ${GRANOLA_API_KEY}`,
      'Accept': 'application/json',
    },
  });
  
  if (!resp.ok) {
    console.error('Failed to fetch note:', resp.status);
    return;
  }
  
  const noteDetails = await resp.json();
  console.log(`Fetched transcript: ${noteDetails.transcript?.length || 0} characters.`);

  const session = {
    company_name: 'Farmers District 40',
    current_ats: 'Unknown',
    industry: 'Insurance',
    company_size: 'Unknown',
    selected_pains: ['recruiter-admin-heavy', 'no-pipeline-visibility'],
    data: { meddpicc: {}, bap_answers: {} }
  };

  const systemPrompt = `You are an expert sales intelligence analyst. Extract structured data from meeting transcripts for a B2B SaaS sales team selling Teamtailor (an ATS / employer brand platform).

## Context
- Company: ${session.company_name}
- Current ATS: ${session.current_ats}
- Industry: ${session.industry}
- Company Size: ${session.company_size}
- Target Pains to Prove: ${session.selected_pains.join(', ')}

## Extract These Fields
1. MEDDPICC: pain_narrative, success_metrics_text, decision_criteria, decision_process, paper_process, champion_name, competitive_situation, economic_buyer_access
2. Next Steps: next_steps_who, next_steps_what, next_steps_when
3. Deal Intel: contract_end_date, competitors_identified, implementation_timeline, next_meeting_date
4. BAP Scores: q1-q12 (yes/maybe/no) with evidence
5. Key verbatim prospect quotes (3-5 most impactful)
6. Meeting summary (2-3 sentences)

Return ONLY valid JSON.`;

  const summary = noteDetails.summary_markdown || noteDetails.summary_text || noteDetails.summary || '';
  const transcript = noteDetails.transcript || '';
  
  const truncated = transcript.length > 60000 ? transcript.substring(0, 60000) + '\n[Truncated]' : transcript;
  const userPrompt = `## Meeting Summary\n${summary}\n\n## Transcript\n${truncated}`;

  console.log('Running OpenAI extraction...');
  const gptResp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    }),
  });

  const data = await gptResp.json();
  console.log('\n=== BAKED OUT INTEL ===');
  console.log(data.choices?.[0]?.message?.content);
}

extractIntel();
