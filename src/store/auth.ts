import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import type { Perfil, Hogar } from '@/types';
import { supabase } from '@/lib/supabase';

type AuthState = {
  session: Session | null;
  perfil: Perfil | null;
  hogar: Hogar | null;
  companero: Perfil | null;
  loading: boolean;

  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setPerfil: (perfil: Perfil | null) => void;
  setHogar: (hogar: Hogar | null) => void;
  setCompanero: (companero: Perfil | null) => void;
  cargarPerfil: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  perfil: null,
  hogar: null,
  companero: null,
  loading: true,

  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  setPerfil: (perfil) => set({ perfil }),
  setHogar: (hogar) => set({ hogar }),
  setCompanero: (companero) => set({ companero }),

  cargarPerfil: async () => {
    const { session } = get();
    if (!session?.user) {
      set({ loading: false });
      return;
    }

    // Resetea antes de cargar para evitar estado residual de sesiones anteriores
    set({ loading: true, perfil: null, hogar: null, companero: null });

    const { data: perfil } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (!perfil) {
      set({ loading: false });
      return;
    }

    set({ perfil });

    if (perfil.hogar_id) {
      const { data: hogar } = await supabase
        .from('hogares')
        .select('*')
        .eq('id', perfil.hogar_id)
        .single();

      if (hogar) set({ hogar });

      const { data: companero } = await supabase
        .from('perfiles')
        .select('*')
        .eq('hogar_id', perfil.hogar_id)
        .neq('id', session.user.id)
        .single();

      if (companero) set({ companero });
    }

    set({ loading: false });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, perfil: null, hogar: null, companero: null });
  },
}));
