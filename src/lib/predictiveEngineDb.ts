import { supabase, supabaseAdmin } from './supabase';

export interface RoofProperty {
  id: string;
  property_name: string;
  address: string;
  square_footage: number;
  industry: string;
  coordinates?: any; // PostGIS Point
  building_polygon?: any; // PostGIS Polygon
  roof_type?: string;
}

export interface ManagementCompany {
  id: string;
  workspace_id: string;
  company_name: string;
  hq_domain?: string;
  total_managed_sqft?: number;
  created_at: string;
}

export interface Contact {
  id: string;
  workspace_id: string;
  management_company_id: string;
  first_name?: string;
  last_name?: string;
  job_title?: string;
  email?: string;
  mobile_phone?: string;
  linkedin_url?: string;
  verification_status: boolean;
  created_at: string;
}

export interface PropertyManager {
  id: string;
  workspace_id: string;
  property_id: string;
  contact_id: string;
  management_company_id: string;
  is_primary_contact: boolean;
  created_at: string;
}

export interface GeospatialWeatherEvent {
  id: string;
  workspace_id: string;
  event_type: string;
  severity?: string;
  storm_polygon?: any; // PostGIS Polygon
  date_of_loss?: string;
  created_at: string;
}

export interface RoofSignal {
  id: string;
  property_id: string;
  signal_type: 'weather' | 'satellite' | 'permit' | string;
  signal_data: any;
  detected_at: string;
}

export interface RoofHealthScore {
  id: string;
  property_id: string;
  health_score: number;
  score_factors: any[];
  calculated_at: string;
}

export interface CampaignOutreach {
  id: string;
  property_id: string;
  campaign_name: string;
  status: string;
  prospect_room_token: string;
}

export interface PortfolioPropertyData {
  campaign: CampaignOutreach;
  property: RoofProperty;
  signals: RoofSignal[];
  healthScore: RoofHealthScore | null;
}

export interface PortfolioData {
  token: string;
  properties: PortfolioPropertyData[];
}

export async function getPredictiveDataByToken(token: string): Promise<PortfolioData | null> {
  // 1. Fetch all campaign outreach records for this token
  const { data: campaigns, error: campaignError } = await supabaseAdmin
    .from('campaign_outreach')
    .select('*')
    .eq('prospect_room_token', token);

  if (campaignError || !campaigns || campaigns.length === 0) {
    console.error('Error fetching campaigns by token:', campaignError);
    return null;
  }

  const propertyIds = campaigns.map(c => c.property_id);

  // 2. Fetch all related properties
  const { data: properties, error: propertyError } = await supabaseAdmin
    .from('roof_properties')
    .select('*')
    .in('id', propertyIds);

  if (propertyError) {
    console.error('Error fetching properties:', propertyError);
    return null;
  }

  // 3. Fetch latest signals for these properties
  const { data: signals, error: signalsError } = await supabaseAdmin
    .from('roof_signals')
    .select('*')
    .in('property_id', propertyIds)
    .order('detected_at', { ascending: false });

  // 4. Fetch latest health scores for these properties
  const { data: healthScores, error: scoreError } = await supabaseAdmin
    .from('roof_health_scores')
    .select('*')
    .in('property_id', propertyIds)
    .order('calculated_at', { ascending: false });

  const portfolioProperties: PortfolioPropertyData[] = campaigns.map(campaign => {
    const prop = properties?.find(p => p.id === campaign.property_id);
    const propSignals = signals?.filter(s => s.property_id === campaign.property_id) || [];
    const propScores = healthScores?.filter(s => s.property_id === campaign.property_id) || [];

    return {
      campaign,
      property: prop as RoofProperty,
      signals: propSignals as RoofSignal[],
      healthScore: propScores.length > 0 ? (propScores[0] as RoofHealthScore) : null,
    };
  }).filter(item => item.property != null);

  return {
    token,
    properties: portfolioProperties,
  };
}

export async function getPredictiveDataByCompany(companyName: string): Promise<PortfolioData | null> {
  // Extract a clean search term from company name (e.g., "JLL Corporate HQ" -> "JLL")
  const searchTerm = companyName.split(' ')[0];

  // Using the new multi-entity architecture to find properties managed by this entity
  const { data: properties, error: propertyError } = await supabaseAdmin
    .from('roof_properties')
    .select(`
      *,
      property_managers!inner (
        management_companies!inner (
          company_name
        )
      )
    `)
    .ilike('property_managers.management_companies.company_name', `%${searchTerm}%`);

  if (propertyError || !properties || properties.length === 0) {
    // Fallback: try checking legal_owner_name for older unmigrated data
    const { data: fallbackProps, error: fallbackError } = await supabaseAdmin
      .from('roof_properties')
      .select('*')
      .ilike('legal_owner_name', `%${searchTerm}%`);
      
    if (fallbackError || !fallbackProps || fallbackProps.length === 0) {
      return null;
    }
    
    properties.push(...fallbackProps);
  }

  const propertyIds = properties.map((p: any) => p.id);

  const { data: signals } = await supabaseAdmin
    .from('roof_signals')
    .select('*')
    .in('property_id', propertyIds)
    .order('detected_at', { ascending: false });

  const { data: healthScores } = await supabaseAdmin
    .from('roof_health_scores')
    .select('*')
    .in('property_id', propertyIds)
    .order('calculated_at', { ascending: false });

  const portfolioProperties: PortfolioPropertyData[] = properties.map(prop => {
    const propSignals = signals?.filter(s => s.property_id === prop.id) || [];
    const propScores = healthScores?.filter(s => s.property_id === prop.id) || [];

    return {
      campaign: {
        id: `mock-campaign-${prop.id}`,
        property_id: prop.id,
        campaign_name: 'Direct Discovery',
        status: 'active',
        prospect_room_token: 'dynamic'
      },
      property: prop as RoofProperty,
      signals: propSignals as RoofSignal[],
      healthScore: propScores.length > 0 ? (propScores[0] as RoofHealthScore) : null,
    };
  });

  return {
    token: `company-${searchTerm}`,
    properties: portfolioProperties,
  };
}
