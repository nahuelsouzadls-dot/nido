import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text as RNText,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Rect, Line, Polygon, Text as SvgText } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColors } from '@/hooks/useColors';
import { useAuthStore } from '@/store/auth';
import { supabase } from '@/lib/supabase';
import { CATEGORIAS_DEFAULT } from '@/constants/categories';

// ── Ilustraciones SVG ──────────────────────────────────────────────────────────

function IlustracionMomento1({ inicial }: { inicial: string }) {
  return (
    <Svg width={180} height={140} viewBox="0 0 180 140">
      {/* Avatar central */}
      <Circle cx="90" cy="70" r="22" fill="#6B2D3E" opacity={0.85} />
      <SvgText x="90" y="77" textAnchor="middle" fontSize="15" fontWeight="bold" fill="#F5F0F2">
        {inicial}
      </SvgText>

      {/* Card ingreso — arriba izquierda */}
      <Rect x="8" y="10" width="44" height="30" rx="7" fill="rgba(15,110,86,0.1)" stroke="#0F6E56" strokeWidth={0.8} />
      <Rect x="18" y="20" width="24" height="10" rx="2" fill="#0F6E56" opacity={0.55} />

      {/* Card gasto — arriba derecha */}
      <Rect x="128" y="10" width="44" height="30" rx="7" fill="rgba(15,110,86,0.1)" stroke="#0F6E56" strokeWidth={0.8} />
      <Rect x="146" y="16" width="8" height="16" rx="2" fill="#0F6E56" opacity={0.45} />
      <Line x1="138" y1="24" x2="158" y2="24" stroke="#0F6E56" strokeWidth={1} opacity={0.35} />

      {/* Card objetivo — abajo centro */}
      <Rect x="68" y="108" width="44" height="28" rx="7" fill="rgba(15,110,86,0.1)" stroke="#0F6E56" strokeWidth={0.8} />
      <Circle cx="90" cy="122" r="7" fill="none" stroke="#0F6E56" strokeWidth={1.2} />
      <Circle cx="90" cy="122" r="3" fill="#0F6E56" />

      {/* Líneas punteadas */}
      <Line x1="75" y1="54" x2="42" y2="36" stroke="#0F6E56" strokeWidth={0.8} strokeDasharray="3 3" opacity={0.45} />
      <Line x1="105" y1="54" x2="138" y2="36" stroke="#0F6E56" strokeWidth={0.8} strokeDasharray="3 3" opacity={0.45} />
      <Line x1="90" y1="92" x2="90" y2="108" stroke="#0F6E56" strokeWidth={0.8} strokeDasharray="3 3" opacity={0.45} />
    </Svg>
  );
}

function IlustracionMomento2() {
  return (
    <Svg width={160} height={120} viewBox="0 0 160 120">
      {/* 3 tarjetas apiladas */}
      <Rect x="28" y="46" width="100" height="54" rx="10" fill="#F5E8E0" stroke="#6B2D3E" strokeWidth={0.5} opacity={0.4} />
      <Rect x="18" y="34" width="100" height="54" rx="10" fill="#F0DDD2" stroke="#6B2D3E" strokeWidth={0.7} opacity={0.65} />
      <Rect x="8" y="22" width="100" height="54" rx="10" fill="#EDD5C4" stroke="#6B2D3E" strokeWidth={1} />

      {/* Contenido tarjeta principal */}
      <Rect x="20" y="36" width="58" height="5" rx="2.5" fill="#6B2D3E" opacity={0.22} />
      <Rect x="20" y="46" width="38" height="5" rx="2.5" fill="#6B2D3E" opacity={0.13} />

      {/* Badge vencimiento */}
      <Rect x="20" y="58" width="44" height="14" rx="7" fill="rgba(90,122,72,0.12)" stroke="#5A7A48" strokeWidth={0.7} />
      <SvgText x="42" y="69" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#5A7A48">Día 15</SvgText>

      {/* Check a la derecha — indicador de aviso */}
      <Circle cx="136" cy="50" r="18" fill="rgba(90,122,72,0.1)" stroke="#5A7A48" strokeWidth={0.8} />
      <Line x1="127" y1="50" x2="133" y2="56" stroke="#5A7A48" strokeWidth={2} strokeLinecap="round" />
      <Line x1="133" y1="56" x2="145" y2="42" stroke="#5A7A48" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function IlustracionMomento3({ inicial }: { inicial: string }) {
  return (
    <Svg width={180} height={130} viewBox="0 0 180 130">
      {/* Avatar propio */}
      <Circle cx="36" cy="65" r="20" fill="#6B2D3E" opacity={0.85} />
      <SvgText x="36" y="72" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#F5F0F2">
        {inicial}
      </SvgText>

      {/* Casa central */}
      <Rect x="74" y="62" width="32" height="22" rx="4" fill="#EDD5C4" stroke="#6B2D3E" strokeWidth={1} />
      <Polygon points="90,46 70,64 110,64" fill="#6B2D3E" opacity={0.75} />
      <Rect x="85" y="70" width="10" height="14" rx="2" fill="#F5F0F2" stroke="#6B2D3E" strokeWidth={0.7} />

      {/* Avatar fantasma */}
      <Circle
        cx="144" cy="65" r="20"
        fill="rgba(30,10,16,0.04)"
        stroke="rgba(30,10,16,0.2)"
        strokeWidth={1}
        strokeDasharray="4 3"
      />
      <SvgText x="144" y="72" textAnchor="middle" fontSize="18" fill="rgba(30,10,16,0.25)">+</SvgText>

      {/* Líneas de conexión */}
      <Line x1="57" y1="65" x2="72" y2="65" stroke="#6B2D3E" strokeWidth={0.8} strokeDasharray="3 3" opacity={0.4} />
      <Line x1="108" y1="65" x2="122" y2="65" stroke="rgba(30,10,16,0.2)" strokeWidth={0.8} strokeDasharray="3 3" />
    </Svg>
  );
}

// ── Progress Dots ──────────────────────────────────────────────────────────────

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === current
              ? { width: 16, backgroundColor: '#6B2D3E' }
              : { width: 6, backgroundColor: 'rgba(107,45,62,0.2)' },
          ]}
        />
      ))}
    </View>
  );
}

// ── Datos de cada momento ──────────────────────────────────────────────────────

type MomentoData = {
  titulo: string;
  texto: string;
  boton: string;
};

const MOMENTOS: MomentoData[] = [
  {
    titulo: 'Tu espacio personal',
    texto: 'Registrá tus ingresos, gastos y objetivos. Solo los ves vos. Sin compartir nada que no quieras.',
    boton: 'Entendido →',
  },
  {
    titulo: 'Las facturas, sin drama',
    texto: 'Registrá una vez, sabé siempre cuándo vence. Nido te avisa antes de que sea un problema.',
    boton: 'Siguiente →',
  },
  {
    titulo: 'Cuando quieras, sumá a alguien',
    texto: 'Si convivís con alguien, invitalo desde tu perfil. Compartirán facturas, gastos y objetivos del hogar.',
    boton: 'Empezar →',
  },
];

// ── Pantalla principal ─────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const { session, cargarPerfil, perfil } = useAuthStore();
  const colors = useColors();

  const [momento, setMomento] = useState(0);
  const [navigating, setNavigating] = useState(false);
  const [creacionEstado, setCreacionEstado] = useState<'pendiente' | 'ok' | 'error'>('pendiente');
  const [errorMsg, setErrorMsg] = useState('');
  const creacionRef = useRef<Promise<boolean> | undefined>(undefined);

  const resolverNombre = () =>
    perfil?.nombre ||
    (session?.user?.user_metadata?.nombre as string | undefined) ||
    session?.user?.email?.split('@')[0] ||
    'Usuario';

  const inicial = resolverNombre().charAt(0).toUpperCase();

  const crearHogar = async (intento = 1): Promise<boolean> => {
    if (!session?.user) return false;
    const nombre = resolverNombre();
    try {
      const { data: hogar, error: hogarError } = await supabase
        .from('hogares')
        .insert({ nombre: `Hogar de ${nombre}` })
        .select()
        .single();
      if (hogarError) throw hogarError;

      const { error: perfilError } = await supabase
        .from('perfiles')
        .upsert({ id: session.user.id, nombre, hogar_id: hogar.id });
      if (perfilError) throw perfilError;

      await supabase.from('categorias').insert(
        CATEGORIAS_DEFAULT.map((c) => ({
          hogar_id: hogar.id,
          nombre: c.nombre,
          icono: c.icono,
          color: c.color,
          es_sistema: true,
        })),
      );

      setCreacionEstado('ok');
      return true;
    } catch (e) {
      if (intento === 1) return crearHogar(2);
      setCreacionEstado('error');
      setErrorMsg(e instanceof Error ? e.message : 'No se pudo crear el hogar. Intentá de nuevo.');
      return false;
    }
  };

  useEffect(() => {
    creacionRef.current = crearHogar();
  }, []);

  const finalizar = async () => {
    if (navigating) return;
    setNavigating(true);
    try {
      let exito: boolean;
      if (creacionEstado === 'ok') {
        exito = true;
      } else if (creacionEstado === 'error') {
        setCreacionEstado('pendiente');
        setErrorMsg('');
        exito = await crearHogar();
      } else {
        exito = await (creacionRef.current ?? crearHogar());
      }
      if (!exito) {
        setNavigating(false);
        return;
      }
      await AsyncStorage.setItem('nido_active_context', 'personal');
      await cargarPerfil();
    } catch {
      setNavigating(false);
    }
  };

  const siguiente = () => {
    if (momento < 2) setMomento(momento + 1);
    else finalizar();
  };

  const m = MOMENTOS[momento];

  const ilustraciones = [
    <IlustracionMomento1 inicial={inicial} />,
    <IlustracionMomento2 />,
    <IlustracionMomento3 inicial={inicial} />,
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <View style={styles.content}>
        <ProgressDots total={3} current={momento} />

        <View style={styles.center}>
          <View style={styles.ilus}>{ilustraciones[momento]}</View>
          <RNText style={[styles.titulo, { color: colors.textPrimary }]}>{m.titulo}</RNText>
          <RNText style={[styles.texto, { color: colors.textSecondary }]}>{m.texto}</RNText>
        </View>

        <View style={styles.botones}>
          {creacionEstado === 'error' ? (
            <RNText style={[styles.errorText, { color: colors.danger ?? '#C0392B' }]}>{errorMsg}</RNText>
          ) : null}

          <TouchableOpacity
            style={[
              styles.btnPrimary,
              { backgroundColor: momento === 2 ? '#1E0A10' : colors.primary },
              navigating && { opacity: 0.6 },
            ]}
            onPress={siguiente}
            disabled={navigating}
            activeOpacity={0.85}
          >
            {navigating && momento === 2
              ? <ActivityIndicator size="small" color="#fff" />
              : <RNText style={styles.btnPrimaryText}>{m.boton}</RNText>}
          </TouchableOpacity>

          {momento === 2 ? (
            <TouchableOpacity onPress={finalizar} disabled={navigating} activeOpacity={0.7}>
              <RNText style={[styles.linkSecundario, { color: colors.primary }]}>Lo hago después</RNText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={finalizar} disabled={navigating} activeOpacity={0.7}>
              <RNText style={[styles.saltarLink, { color: colors.primary }]}>Saltar</RNText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, overflow: 'hidden' },
  circle1: {
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(107,45,62,0.1)',
    position: 'absolute', top: -60, right: -60,
  },
  circle2: {
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(90,122,72,0.08)',
    position: 'absolute', bottom: 80, left: -40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  dots: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  dot: { height: 6, borderRadius: 3 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
  ilus: { marginBottom: 4 },
  titulo: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 15,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  texto: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  botones: { gap: 12 },
  btnPrimary: { borderRadius: 13, paddingVertical: 14, alignItems: 'center' },
  btnPrimaryText: { fontFamily: 'Manrope_700Bold', fontSize: 13, color: '#fff' },
  linkSecundario: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11,
    textAlign: 'center',
  },
  saltarLink: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 9,
    textAlign: 'center',
  },
  errorText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 10,
    textAlign: 'center',
  },
});
