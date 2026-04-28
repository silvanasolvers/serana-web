import { supabase, isSupabaseConfigured } from '../supabase';

export type LeadChannel =
  | 'wellness_quiz'
  | 'community_poll'
  | 'chatbot'
  | 'footer'
  | 'contact'
  | 'newsletter'
  | 'b2b'
  | 'loyalty'
  | string;

export type LeadPayload = {
  channel: LeadChannel;
  full_name?: string;
  phone?: string;
  email?: string;
  message?: string;
  metadata?: Record<string, unknown>;
};

export async function captureLead(payload: LeadPayload): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  const enrichedPayload = {
    ...payload,
    source_url: typeof window !== 'undefined' ? window.location.href : undefined,
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
  };
  const { data, error } = await supabase.rpc('capture_lead', { payload: enrichedPayload });
  if (error) {
    console.warn('[serana-web] captureLead failed:', error.message);
    return null;
  }
  return (data as { lead_id?: string } | null)?.lead_id ?? null;
}
