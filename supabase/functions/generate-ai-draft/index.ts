import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { account, timeline } = await req.json()

    // Ensure OpenAI API key is set
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables.')
    }

    const contactName = account?.contact?.name || account?.contacts?.[0]?.name || 'there'
    const names = contactName.split(' ')
    const firstName = names[0]
    const companyName = account?.name || account?.companyName || 'your company'
    const incumbent = account?.incumbentAts || account?.currentAts || 'your current ATS'
    
    // Construct intent signals summary
    const signalsSummary = (timeline || []).map((t: any) => `- ${t.title}: ${t.description || ''}`).join('\n')

    // Construct the prompt for LinkedIn connection request
    const systemPrompt = `You are an elite, top-performing enterprise Account Executive at Teamtailor (a modern, highly aesthetic ATS / Applicant Tracking System with a built-in career site builder).
You are drafting a personalized LinkedIn connection request to ${firstName} at ${companyName}.
They are currently using ${incumbent}.

Recent Intent Signals detected:
${signalsSummary || 'No recent signals.'}

INSTRUCTIONS:
1. Write a LinkedIn connection request message. MUST be under 300 characters (this is a hard LinkedIn limit).
2. Be conversational and human — not salesy or robotic.
3. Reference ONE specific signal or pain point to show you did your homework (e.g., their ATS, a recent job posting surge, a pricing page visit).
4. End with a soft, curiosity-driven hook — NOT a hard CTA.
5. Do NOT include a subject line. Just the message body.
6. Do NOT use generic phrases like "I'd love to connect" or "I came across your profile."
7. Examples of good tone:
   - "Noticed ${companyName} is scaling fast on ${incumbent} — we help teams like yours cut time-to-hire in half with better candidate experience. Worth comparing notes?"
   - "Saw your team posted 15 roles this month — impressive growth. Curious if ${incumbent} is keeping up or if the career site is a bottleneck?"
8. Output ONLY the message text, nothing else.`

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Draft the LinkedIn connection request.' }
        ],
        temperature: 0.7,
        max_tokens: 120,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenAI API Error:', errorData)
      throw new Error(`OpenAI API responded with status: ${response.status}`)
    }

    const data = await response.json()
    const generatedMessage = data.choices[0].message.content

    return new Response(
      JSON.stringify({ draft: generatedMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Edge Function Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
