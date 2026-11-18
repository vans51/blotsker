const SUPABASE_URL = "https://adjsrdwgdfrfmaqsurvj.supabase.co";
const SUPABASE_CLAVE = "sb_publishable_Osiz28TUKWf-BGQDfXYJqg_I20hy7zb"; // la clave "anon" o "publishable". NUNCA la "service_role"

// 2) Cliente de Supabase (la librería se carga desde el CDN en el HTML)
const clienteSupabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_CLAVE,
);
