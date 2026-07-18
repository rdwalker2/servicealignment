const API_KEY = import.meta.env.VITE_AIMFOX_API_KEY;
const BASE_URL = 'https://api.aimfox.com/api/v2';

export interface AimfoxCampaign {
  id: string;
  name: string;
  status: string;
  outreach_type?: string;
  accepts_profiles?: boolean;
}

export async function fetchAimfoxCampaigns(): Promise<AimfoxCampaign[]> {
  if (!API_KEY) {
    console.warn('[Aimfox] No API key configured. Returning mock campaigns for testing.');
    return [
      { id: 'cmp_1', name: 'VP Talent Acquisition - Tier 1', status: 'active', accepts_profiles: true },
      { id: 'cmp_2', name: 'VP HR - Nurture', status: 'active', accepts_profiles: true }
    ];
  }

  try {
    const res = await fetch(`${BASE_URL}/campaigns`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!res.ok) {
      if (res.status === 429) throw new Error('Aimfox rate limit exceeded');
      throw new Error(`Aimfox API error: ${res.status}`);
    }
    
    const data = await res.json();
    // Some APIs wrap lists in a 'data' object
    return Array.isArray(data) ? data : (data.data || []);
  } catch (err) {
    console.error('[Aimfox] Error fetching campaigns:', err);
    throw err;
  }
}

export async function pushToAimfoxCampaign(campaignId: string, linkedinUrl: string): Promise<boolean> {
  if (!API_KEY) {
    console.log(`[Aimfox Mock] Pushed ${linkedinUrl} to campaign ${campaignId}`);
    return true;
  }

  if (!linkedinUrl) {
    throw new Error('A LinkedIn URL is required to enroll a prospect in Aimfox.');
  }

  try {
    // Note: If this endpoint fails, verify the exact "Add Profile" endpoint in Aimfox docs.
    // Common variants: /api/v2/campaigns/{id}/profiles OR /api/v2/profiles with campaign_id in body
    const res = await fetch(`${BASE_URL}/campaigns/${campaignId}/profiles`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        linkedin_url: linkedinUrl
      })
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('[Aimfox] Push failed:', errBody);
      throw new Error(`Aimfox Push Failed: ${res.status}`);
    }

    return true;
  } catch (err) {
    console.error('[Aimfox] Error pushing profile:', err);
    throw err;
  }
}
