import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types'; // You'll need to generate this

const supabaseUrl = process.env.NEXT_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export interface Audit {
  id?: number;
  url: string;
  email: string;
  analysis: string;
  created_at: string;
}

export async function saveAudit(url: string, email: string, analysis: string): Promise<Audit> {
  const audit = {
    url,
    email,
    analysis,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('audits')
    .insert(audit)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAuditsByEmail(email: string): Promise<Audit[]> {
  const { data, error } = await supabase
    .from('audits')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getAuditByUrlAndEmail(url: string, email: string): Promise<Audit | undefined> {
  const { data, error } = await supabase
    .from('audits')
    .select('*')
    .eq('url', url)
    .eq('email', email)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') return undefined; // No rows returned
  return data;
}