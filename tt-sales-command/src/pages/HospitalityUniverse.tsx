import { useState, useEffect, useMemo } from 'react';
import {
  Utensils, MapPin, Monitor, Globe, Users, Building2,
  TrendingUp, Target, Navigation, Phone, ExternalLink,
  Briefcase, Mail, LayoutGrid, Loader2, Filter, Flame,
  Coffee, Wine, Star, Smartphone
} from 'lucide-react';
import AudienceShell from '../components/audience/AudienceShell';
import type { AudienceConfig, AudienceSegment } from '../components/audience/audienceTypes';
import {
  loadHospitalityData, classifyAts,
  type HospitalityGroup, type HospitalityContact
} from '../data/hospitalityData';
import { getLinkedInSizeRange } from '../lib/utils';

// ─── Formatting Helpers ───────────────────────────────────────────────────────

function fmt(n: number | undefined | null): string {
  if (n == null) return '—';
  return n.toLocaleString();
}

// ─── Role Badges ─────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  decision_maker: 'bg-red-50 text-red-700 border-red-200',
  champion: 'bg-blue-50 text-blue-700 border-blue-200',
  gatekeeper: 'bg-amber-50 text-amber-700 border-amber-200',
  contact: 'bg-stone-100 text-stone-500 border-stone-200',
};

const ROLE_LABELS: Record<string, string> = {
  decision_maker: 'Decision Maker',
  champion: 'Champion',
  gatekeeper: 'Gatekeeper',
  contact: 'Contact',
};

export default function HospitalityUniverse() {
  const [data, setData] = useState<HospitalityGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHospitalityData().then(d => {
      setData(d);
      setIsLoading(false);
    });
  }, []);

  const config = useMemo((): AudienceConfig<HospitalityGroup> => {
    return {
      title: (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center border border-orange-200">
            <Utensils className="text-orange-600" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-900">Hospitality Universe</h1>
            <p className="text-[13px] text-stone-500 font-medium">Restaurant Groups, Hotels, & Franchises</p>
          </div>
        </div>
      ),
      accentColor: 'orange',
      data,

      segments: [
        {
          id: 'katy-hook',
          name: 'Katy\'s Alumni Hooks',
          icon: 'Wine',
          category: 'strategy',
          description: 'Groups currently using SevenRooms or Yelp. Highest conversion potential using Katy\'s background.',
          talkingPoint: '"When I was at SevenRooms, I noticed restaurant groups struggle with FOH turnover... let me show you how Teamtailor fixes this."',
          filter: (g) => g.reservation_system === 'SevenRooms' || g.has_yelp_integration === true
        },
        {
          id: 'high-volume',
          name: 'High-Volume Hiring',
          icon: 'Users',
          category: 'firmographics',
          description: 'Restaurant groups with more than 30 venues.',
          filter: (g) => g.venue_count >= 30
        },
        {
          id: 'legacy-ats',
          name: 'Legacy ATS Trap',
          icon: 'Building2',
          category: 'tech',
          description: 'Using Workday or Taleo. GMs hate these systems because they are too complex for frontline hiring.',
          talkingPoint: '"Your GMs are not corporate recruiters. Stop forcing them to use Workday and give them an app they actually like."',
          filter: (g) => classifyAts(g.current_ats) === 'legacy'
        }
      ],

      segmentCategories: [
        { key: 'strategy', label: 'Go-To-Market Strategy' },
        { key: 'tech', label: 'Tech Stack Signals' },
        { key: 'firmographics', label: 'Firmographics' }
      ],

      segmentIconMap: {
        Wine, Users, Building2, Utensils
      },

      stats: (all, filtered) => {
        const totalVenues = filtered.reduce((acc, g) => acc + g.venue_count, 0);
        const openFoh = filtered.reduce((acc, g) => acc + g.open_roles_foh, 0);
        const srCount = filtered.filter(g => g.reservation_system === 'SevenRooms').length;
        
        return [
          { label: 'Total Venues', value: fmt(totalVenues), icon: MapPin, accent: 'text-orange-600' },
          { label: 'Open FOH Roles', value: fmt(openFoh), icon: Users, accent: 'text-emerald-600' },
          { label: 'SevenRooms Accounts', value: srCount, icon: Star, accent: 'text-violet-600' }
        ];
      },

      filters: (data) => [
        {
          key: 'group_type',
          label: 'Group Type',
          icon: Building2,
          options: [
            { value: 'restaurant_group', label: 'Restaurant Group' },
            { value: 'hotel_chain', label: 'Hotel Chain' },
            { value: 'franchise', label: 'Franchise' }
          ]
        },
        {
          key: 'reservation_system',
          label: 'Reservation Tech',
          icon: Monitor,
          options: [
            { value: 'SevenRooms', label: 'SevenRooms' },
            { value: 'Resy', label: 'Resy' },
            { value: 'OpenTable', label: 'OpenTable' },
            { value: 'Yelp Waitlist', label: 'Yelp Waitlist' }
          ]
        }
      ],

      applyFilters: (data, filterValues) => {
        return data.filter(g => {
          for (const [key, val] of Object.entries(filterValues)) {
            if ((g as any)[key] !== val) return false;
          }
          return true;
        });
      },

      searchPlaceholder: 'Search groups, tech stack...',
      searchFn: (g, q) => {
        const str = `${g.name} ${g.hq_location} ${g.reservation_system} ${g.pos_system} ${g.current_ats}`.toLowerCase();
        return str.includes(q.toLowerCase());
      },

      columns: [
        {
          key: 'group',
          label: 'Hospitality Group',
          width: '35%',
          render: (g) => (
            <div className="flex items-center gap-3 py-1">
              <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex flex-col items-center justify-center shrink-0">
                <Coffee size={14} className="text-orange-500" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-[13px] text-stone-900 truncate">{g.name}</div>
                <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                  <span className="flex items-center gap-1"><MapPin size={10} />{g.hq_location}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><LayoutGrid size={10} />{g.venue_count} venues</span>
                </div>
              </div>
            </div>
          )
        },
        {
          key: 'tech',
          label: 'Tech Stack',
          width: '25%',
          render: (g) => (
            <div className="space-y-1 py-1">
              <div className="flex items-center gap-1.5 text-[11px] text-stone-600">
                <Monitor size={12} className="text-stone-400" />
                <span className="font-medium">ATS:</span> 
                {g.current_ats}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-stone-600">
                <Smartphone size={12} className="text-stone-400" />
                <span className="font-medium">Res:</span> 
                <span className={g.reservation_system === 'SevenRooms' ? 'text-violet-600 font-bold bg-violet-50 px-1 rounded' : ''}>
                  {g.reservation_system}
                </span>
              </div>
            </div>
          )
        },
        {
          key: 'hiring',
          label: 'Hiring Volume',
          width: '20%',
          render: (g) => (
            <div className="flex flex-col gap-0.5">
              <div className="text-[12px] font-medium text-stone-700">{g.open_roles_foh} FOH Roles</div>
              <div className="text-[11px] text-stone-500">{g.open_roles_boh} BOH Roles</div>
            </div>
          )
        },
        {
          key: 'contacts',
          label: 'Key Contacts',
          width: '20%',
          render: (g) => {
            const dm = g.contacts.find(c => c.role === 'decision_maker') || g.contacts[0];
            if (!dm) return <span className="text-[11px] text-stone-400">No contacts</span>;
            return (
              <div className="min-w-0">
                <div className="text-[12px] font-medium text-stone-800 truncate">{dm.name}</div>
                <div className="text-[11px] text-stone-500 truncate">{dm.title}</div>
              </div>
            );
          }
        }
      ],

      defaultSort: { field: 'name', dir: 'asc' },
      sortFn: (a, b, field) => {
        if (field === 'name') return a.name.localeCompare(b.name);
        return 0;
      },

      getItemId: (g) => g.id,
      itemLabel: 'group',

      renderDrawer: (g, onClose) => (
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-stone-900">{g.name}</h2>
              <div className="flex items-center gap-3 text-[12px] text-stone-500 mt-1">
                <span className="flex items-center gap-1"><MapPin size={12}/>{g.hq_location}</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Globe size={12}/>{g.website}</span>
              </div>
            </div>
            {g.reservation_system === 'SevenRooms' && (
              <span className="px-2.5 py-1 bg-violet-100 text-violet-700 text-[10px] font-bold uppercase tracking-wide rounded border border-violet-200 flex items-center gap-1">
                <Star size={10} /> Katy Hook
              </span>
            )}
          </div>

          {/* Katy's Battlecard */}
          <div className="bg-gradient-to-br from-violet-50 to-white rounded-xl border border-violet-100 p-4 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Wine size={64}/></div>
            <h3 className="text-[11px] font-bold text-violet-800 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Flame size={14}/> Katy's Connection Hook</h3>
            {g.reservation_system === 'SevenRooms' || g.has_yelp_integration ? (
              <p className="text-[13px] text-violet-900 leading-relaxed font-medium">
                "Hi [Name] - Before joining Teamtailor, I spent years at {g.reservation_system === 'SevenRooms' ? 'SevenRooms' : 'Yelp'} working with hospitality groups like yours. I noticed a massive trend: GMs are drowning in applicant tracking spreadsheets instead of being on the floor with guests. Can I show you how we give restaurant managers a mobile app to hire front-of-house staff in 60 seconds?"
              </p>
            ) : (
              <p className="text-[13px] text-stone-700 leading-relaxed">
                "Hi [Name] - Having spent years in restaurant tech, I know your GMs don't have time to log into {g.current_ats} on a desktop. Teamtailor's mobile-first interface means your GMs can review resumes and move candidates forward while walking the floor."
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-stone-50 rounded-xl border border-stone-100 p-3">
              <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">Firmographics</div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[12px]">
                  <span className="text-stone-500">Venues</span>
                  <span className="font-medium text-stone-900">{g.venue_count}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-stone-500">Size</span>
                  <span className="font-medium text-stone-900">{getLinkedInSizeRange(g.employee_count)}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-stone-500">Open Roles</span>
                  <span className="font-medium text-stone-900">{g.open_roles_foh + g.open_roles_boh}</span>
                </div>
              </div>
            </div>
            <div className="bg-stone-50 rounded-xl border border-stone-100 p-3">
              <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">Tech Stack</div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[12px]">
                  <span className="text-stone-500">POS</span>
                  <span className="font-medium text-stone-900">{g.pos_system}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-stone-500">Res / Waitlist</span>
                  <span className="font-medium text-stone-900">{g.reservation_system}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-stone-500">ATS</span>
                  <span className="font-medium text-stone-900">{g.current_ats}</span>
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-[12px] font-bold text-stone-800 mb-3 border-b border-stone-100 pb-2">Key Contacts</h3>
          <div className="space-y-2">
            {g.contacts.map((c, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-stone-100 bg-white hover:border-stone-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold ${ROLE_COLORS[c.role]}`}>
                    {c.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-stone-900">{c.name}</div>
                    <div className="text-[11px] text-stone-500">{c.title}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${ROLE_COLORS[c.role]}`}>
                    {ROLE_LABELS[c.role]}
                  </span>
                  <button className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded transition-colors">
                    <Mail size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-orange-600 mb-4" size={32} />
      </div>
    );
  }

  return <AudienceShell config={config} />;
}
