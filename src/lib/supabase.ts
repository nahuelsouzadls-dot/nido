import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

console.log('[Nido] URL raw:', process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('[Nido] URL json:', JSON.stringify(process.env.EXPO_PUBLIC_SUPABASE_URL));
console.log('[Nido] URL type:', typeof process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('[Nido] KEY exists:', !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

export const supabase = (() => {
  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
      },
    });
  } catch (e) {
    console.error('[Nido] Supabase init failed', e);
    throw e;
  }
})();
