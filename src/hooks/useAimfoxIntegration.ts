import { useState, useEffect } from 'react';
import { fetchAimfoxCampaigns, pushToAimfoxCampaign } from '../lib/aimfoxApi';
import type { AimfoxCampaign } from '../lib/aimfoxApi';

export function useAimfoxIntegration(
  effectiveUser: any,
  markContactPushed?: (email: string, method: string) => void
) {
  const [aimfoxConnected, setAimfoxConnected] = useState<boolean | null>(null);
  const [aimfoxCampaigns, setAimfoxCampaigns] = useState<AimfoxCampaign[]>([]);
  
  const [showAimfoxPicker, setShowAimfoxPicker] = useState(false);
  const [selectedAimfoxCampaignId, setSelectedAimfoxCampaignId] = useState<string | null>(null);
  
  const [pendingAimfoxTarget, setPendingAimfoxTarget] = useState<{ id: string, contact: any } | null>(null);
  const [pushingAimfoxId, setPushingAimfoxId] = useState<string | null>(null);

  // Load campaigns when picker is opened
  useEffect(() => {
    if (showAimfoxPicker && aimfoxCampaigns.length === 0) {
      fetchAimfoxCampaigns()
        .then(campaigns => {
          setAimfoxCampaigns(campaigns);
          setAimfoxConnected(true);
          
          // Restore previously selected campaign if any
          const saved = localStorage.getItem('aimfox_selected_campaign_id');
          if (saved && campaigns.some(c => c.id === saved)) {
            setSelectedAimfoxCampaignId(saved);
          } else if (campaigns.length > 0) {
            setSelectedAimfoxCampaignId(campaigns[0].id);
          }
        })
        .catch(err => {
          console.error('Failed to load Aimfox campaigns:', err);
          setAimfoxConnected(false);
        });
    }
  }, [showAimfoxPicker, aimfoxCampaigns.length]);

  const handleAimfoxAddToCampaign = (contactId: string, contact: any) => {
    if (!contact.linkedin_url) {
      alert("A LinkedIn URL is required to add a prospect to Aimfox.");
      return;
    }
    
    setPendingAimfoxTarget({ id: contactId, contact });
    setShowAimfoxPicker(true);
  };

  const executeAimfoxPush = async (campaignId: string, contactId: string, contact: any) => {
    try {
      setPushingAimfoxId(contactId);
      
      await pushToAimfoxCampaign(campaignId, contact.linkedin_url);
      
      // Update local state / DB to mark as pushed
      if (markContactPushed && contact.email) {
        markContactPushed(contact.email, 'aimfox');
      }
      
    } catch (err: any) {
      alert(err.message || "Failed to push to Aimfox");
    } finally {
      setPushingAimfoxId(null);
    }
  };

  return {
    aimfoxConnected,
    aimfoxCampaigns,
    showAimfoxPicker,
    setShowAimfoxPicker,
    selectedAimfoxCampaignId,
    setSelectedAimfoxCampaignId,
    pendingAimfoxTarget,
    setPendingAimfoxTarget,
    pushingAimfoxId,
    handleAimfoxAddToCampaign,
    executeAimfoxPush
  };
}
