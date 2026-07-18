import { supabase } from '../../lib/supabase';

// ─────────────────────────────────────────────────────────────────────────────
// PermitSignalService — Monitors building/roofing permits to generate leads
// Adapted from STR PermitService to act as a Predictive Marketing Signal Engine
// ─────────────────────────────────────────────────────────────────────────────

export type PermitSignalStatus =
    | 'filed'
    | 'issued'
    | 'finaled'
    | 'expired'
    | 'revoked';

export interface PermitSignal {
    id: string;
    property_address: string;
    property_id?: string;
    jurisdiction_name?: string;
    permit_number?: string;
    permit_type: 'reroof' | 'hvac' | 'solar' | 'structural' | 'unknown';
    status: PermitSignalStatus;
    filed_date?: string;
    issued_date?: string;
    finaled_date?: string;
    description?: string;
    estimated_value_usd?: number;
    created_at: string;
    updated_at: string;
}

export interface PermitSignalWithUrgency extends PermitSignal {
    days_since_issue: number | null;
    signal_strength: 'high' | 'medium' | 'low' | 'none';
    signal_label: string;
}

// Compute how "hot" this lead is based on permit recency
function computeSignalStrength(permit: PermitSignal): PermitSignalWithUrgency {
    if (!permit.issued_date && !permit.filed_date) {
        return { ...permit, days_since_issue: null, signal_strength: 'none', signal_label: 'No date found' };
    }

    const now = new Date();
    const referenceDate = new Date(permit.issued_date || permit.filed_date!);
    const diffMs = now.getTime() - referenceDate.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // For predictive marketing, a freshly pulled permit is a high-intent signal
    if (days >= 0 && days <= 14) {
        return { ...permit, days_since_issue: days, signal_strength: 'high', signal_label: `Hot: Permit pulled ${days}d ago` };
    }
    if (days > 14 && days <= 60) {
        return { ...permit, days_since_issue: days, signal_strength: 'medium', signal_label: `Warm: Permit pulled ${days}d ago` };
    }
    if (days > 60 && days <= 365) {
        return { ...permit, days_since_issue: days, signal_strength: 'low', signal_label: `Cold: Permit pulled ${days}d ago` };
    }
    
    return { ...permit, days_since_issue: days, signal_strength: 'none', signal_label: `Stale: >1yr old` };
}

class PermitSignalService {
    async getSignalsForProperty(propertyId: string): Promise<PermitSignalWithUrgency[]> {
        const { data, error } = await supabase
            .from('roof_permit_signals')
            .select('*')
            .eq('property_id', propertyId)
            .order('issued_date', { ascending: false, nullsFirst: false });

        if (error) {
            console.error(`[PermitSignalService] Failed to fetch permits: ${error.message}`);
            return [];
        }
        return (data || []).map(computeSignalStrength);
    }

    async logNewPermitSignal(input: Partial<PermitSignal>): Promise<PermitSignal> {
        const record = {
            property_address: input.property_address,
            property_id: input.property_id,
            jurisdiction_name: input.jurisdiction_name,
            permit_number: input.permit_number,
            permit_type: input.permit_type || 'unknown',
            status: input.status || 'filed',
            filed_date: input.filed_date,
            issued_date: input.issued_date,
            description: input.description,
            estimated_value_usd: input.estimated_value_usd,
        };

        const { data, error } = await supabase
            .from('roof_permit_signals')
            .insert(record)
            .select()
            .single();

        if (error) throw new Error(`Failed to log permit signal: ${error.message}`);
        return data;
    }

    async getRecentHighValueSignals(): Promise<PermitSignalWithUrgency[]> {
        // Find permits issued in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data, error } = await supabase
            .from('roof_permit_signals')
            .select('*')
            .gte('issued_date', thirtyDaysAgo.toISOString())
            .order('issued_date', { ascending: false });

        if (error) {
            console.error(`[PermitSignalService] Failed to fetch recent signals: ${error.message}`);
            return [];
        }
        
        return (data || []).map(computeSignalStrength).filter(p => p.signal_strength === 'high' || p.signal_strength === 'medium');
    }
}

export const permitSignalService = new PermitSignalService();
