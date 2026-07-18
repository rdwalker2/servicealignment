// Salesloft Sync — Cadence enrollment and activity tracking
// Proxied through server.js → api.salesloft.com

export async function runSync() {
  console.log('[Salesloft] Sync requested (not yet configured — needs API key)');
  return { synced: 0, message: 'Salesloft sync not yet configured' };
}

export async function enrollInCadence(email, cadenceId) {
  console.log('[Salesloft] Enroll requested:', email, '→ cadence', cadenceId);
  return { enrolled: false, message: 'Salesloft enrollment not yet configured' };
}

export async function logActivity(email, activityType, details) {
  console.log('[Salesloft] Activity log:', email, activityType);
  return { logged: false, message: 'Salesloft activity logging not yet configured' };
}
