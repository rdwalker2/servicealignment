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
  try {
    const res = await fetch(`/api/discovery/portfolio?token=${encodeURIComponent(token)}`);
    if (!res.ok) {
      console.error('Error fetching predictive data by token:', res.statusText);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error('Fetch error:', err);
    return null;
  }
}

export async function getPredictiveDataByCompany(companyName: string): Promise<PortfolioData | null> {
  try {
    const res = await fetch(`/api/discovery/portfolio?company=${encodeURIComponent(companyName)}`);
    if (!res.ok) {
      console.error('Error fetching predictive data by company:', res.statusText);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error('Fetch error:', err);
    return null;
  }
}
