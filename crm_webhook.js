// CRM Webhook handler (Smartlead/Apollo/Calendly)
export async function handleCrmWebhook(body) {
  console.log('[CRM Webhook] Received:', JSON.stringify(body).slice(0, 200));
  return { ok: true, message: 'CRM webhook received' };
}
