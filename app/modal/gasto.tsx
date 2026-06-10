import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Text as RNText,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useSpace } from '@/context/SpaceContext';
import { Avatar } from '@/components/ui/Avatar';
import { ScopeSelector } from '@/components/ui/ScopeSelector';
import { PrivacyBadge } from '@/components/ui/PrivacyBadge';
import { adjuntarFotoGasto, crearGasto } from '@/services/gastos';
import { useAuthStore } from '@/store/auth';
import { useGastos } from '@/hooks/useGastos';
import { supabase } from '@/lib/supabase';
import type { Categoria, Scope } from '@/types';

const CATEGORIAS_PERSONAL = ['Salud', 'Ropa', 'Transporte', 'Salidas', 'Suscripción', 'Otro'];

const TARJETAS = ['OCA', 'Visa Itaú', 'Mastercard Santander', 'BROU Recompensa', 'Mercado Pago', 'Otra'];

function parseMonto(raw: string): number {
  if (raw.includes('.') && raw.includes(',')) return parseFloat(raw.replace(/\./g, '').replace(',', '.'));
  if (raw.includes(',')) return parseFloat(raw.replace(',', '.'));
  return parseFloat(raw);
}

function getCatIcon(icono: string): keyof typeof MaterialCommunityIcons.glyphMap {
  return (icono as keyof typeof MaterialCommunityIcons.glyphMap) ?? 'dots-horizontal';
}

// Fecha del mes relativo a hoy + N meses
function fechaEnMes(base: Date, offsetMeses: number): string {
  const d = new Date(base.getFullYear(), base.getMonth() + offsetMeses, Math.min(base.getDate(), 28));
  return d.toISOString().split('T')[0];
}

export default function ModalGasto() {
  const router = useRouter();
  const colors = useColors();
  const { activeContext } = useSpace();
  const { hogar, perfil, companero } = useAuthStore();
  const hoy = new Date();
  const { agregar } = useGastos(hoy.getMonth() + 1, hoy.getFullYear());

  const { montoOCR, descripcionOCR, fotoUri } = useLocalSearchParams<{
    montoOCR?: string;
    descripcionOCR?: string;
    fotoUri?: string;
  }>();

  const [scope, setScope] = useState<Scope>(activeContext);
  const [monto, setMonto] = useState(montoOCR ?? '');
  const [descripcion, setDescripcion] = useState(descripcionOCR ?? '');
  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [categoriaTexto, setCategoriaTexto] = useState<string | null>(null);
  const [pagadoPor, setPagadoPor] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [categoriasHogar, setCategoriasHogar] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [foto, setFoto] = useState<string | null>(fotoUri ?? null);

  // Cuotas
  const [esCuotas, setEsCuotas] = useState(false);
  const [numCuotas, setNumCuotas] = useState('');
  const [tarjeta, setTarjeta] = useState<string | null>(null);

  useEffect(() => {
    if (perfil?.id && !pagadoPor) setPagadoPor(perfil.id);
  }, [perfil?.id]);

  useEffect(() => {
    if (!hogar) return;
    supabase.from('categorias').select('*').eq('hogar_id', hogar.id).then(({ data }) => {
      if (data) setCategoriasHogar(data as Categoria[]);
    });
  }, [hogar]);

  useEffect(() => {
    setCategoriaId(null);
    setCategoriaTexto(null);
  }, [scope]);

  const accentColor = scope === 'personal' ? colors.personal : colors.primary;

  const montoNum = parseMonto(monto);
  const cuotas = parseInt(numCuotas) || 0;
  const montoCuota = esCuotas && cuotas > 1 && !isNaN(montoNum) ? montoNum / cuotas : null;

  const handleGuardar = async () => {
    if (!monto || !descripcion.trim()) {
      Alert.alert('Campos requeridos', 'Completá el monto y la descripción');
      return;
    }
    if (scope === 'hogar' && !pagadoPor) {
      Alert.alert('Seleccioná quién pagó', 'Tocá una de las dos personas antes de guardar');
      return;
    }
    if (isNaN(montoNum) || montoNum <= 0) {
      Alert.alert('Monto inválido', 'Ingresá un número mayor a cero');
      return;
    }
    if (esCuotas && (cuotas < 2 || cuotas > 120)) {
      Alert.alert('Cuotas inválidas', 'Ingresá entre 2 y 120 cuotas');
      return;
    }

    setLoading(true);
    try {
      const baseGasto = {
        descripcion: descripcion.trim(),
        categoria_id: scope === 'hogar' ? categoriaId : null,
        categoria_texto: scope === 'personal' ? categoriaTexto : null,
        pagado_por: scope === 'personal' ? (perfil?.id ?? '') : pagadoPor,
        observaciones: observaciones.trim() || null,
        scope,
      };

      if (esCuotas && cuotas > 1 && hogar) {
        const grupoId = crypto.randomUUID();
        const montoPorCuota = montoNum / cuotas;
        // Creamos todas las cuotas en paralelo usando el servicio directamente
        // (agregar() del hook solo agrega al mes actual)
        await Promise.all(
          Array.from({ length: cuotas }, (_, i) =>
            crearGasto({
              ...baseGasto,
              hogar_id: hogar.id,
              monto: parseFloat(montoPorCuota.toFixed(2)),
              fecha: fechaEnMes(hoy, i),
              cuota_numero: i + 1,
              cuota_total: cuotas,
              cuotas_grupo_id: grupoId,
              tarjeta: tarjeta,
            }),
          ),
        );
      } else {
        const nuevo = await agregar({
          ...baseGasto,
          monto: montoNum,
          fecha: hoy.toISOString().split('T')[0],
          cuota_numero: null,
          cuota_total: null,
          cuotas_grupo_id: null,
          tarjeta: null,
        });
        if (foto && nuevo?.id) await adjuntarFotoGasto(nuevo.id, foto);
      }

      router.back();
    } catch {
      Alert.alert('Error', 'No se pudo guardar el gasto. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const elegirFoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images' as const, quality: 0.7 });
    if (!result.canceled) setFoto(result.assets[0].uri);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Top bar */}
      <View style={[styles.topBar, { backgroundColor: colors.background, borderBottomColor: colors.borderSubtle }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="close" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
        <RNText style={[styles.topTitle, { color: colors.textPrimary }]}>Registrar gasto</RNText>
        <TouchableOpacity onPress={handleGuardar} disabled={loading}>
          <RNText style={[styles.topSave, { color: loading ? colors.textSecondary : accentColor }]}>Guardar</RNText>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Monto */}
        <View style={[styles.montoCard, {
          backgroundColor: scope === 'personal' ? colors.cardPersonal : 'rgba(255,255,255,0.55)',
          borderColor: scope === 'personal' ? colors.personalBorder : 'rgba(107,45,62,0.2)',
        }]}>
          {/* $ solo visible cuando hay valor ingresado */}
          {monto.length > 0 && (
            <RNText style={[styles.montoSign, { color: colors.textSecondary }]}>$</RNText>
          )}
          <TextInput
            style={[styles.montoInput, { color: colors.textPrimary }]}
            placeholder="0"
            placeholderTextColor={colors.textSecondary}
            value={monto}
            onChangeText={setMonto}
            keyboardType="decimal-pad"
            autoFocus
            returnKeyType="next"
          />
        </View>

        {/* Scope selector */}
        <ScopeSelector value={scope} onChange={setScope} />

        {/* Descripción */}
        <View style={[styles.fieldsCard, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
          <TextInput
            style={[styles.fieldInput, { color: colors.textPrimary }]}
            placeholder={scope === 'personal' ? '¿Qué compraste o pagaste?' : '¿Qué compraron o pagaron?'}
            placeholderTextColor={colors.textSecondary}
            value={descripcion}
            onChangeText={setDescripcion}
            returnKeyType="done"
          />
        </View>

        {/* Categorías */}
        {scope === 'hogar' && categoriasHogar.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chips}>
              {categoriasHogar.map((cat) => {
                const selected = categoriaId === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.chip, {
                      backgroundColor: selected ? 'rgba(107,45,62,0.1)' : 'rgba(255,255,255,0.55)',
                      borderColor: selected ? colors.primary : 'rgba(107,45,62,0.14)',
                    }]}
                    onPress={() => setCategoriaId(cat.id === categoriaId ? null : cat.id)}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons name={getCatIcon(cat.icono)} size={14} color={selected ? colors.primary : colors.textSecondary} />
                    <RNText style={[styles.chipText, { color: selected ? colors.primary : colors.textSecondary }]}>{cat.nombre}</RNText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        )}

        {scope === 'personal' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chips}>
              {CATEGORIAS_PERSONAL.map((cat) => {
                const selected = categoriaTexto === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.chip, {
                      backgroundColor: selected ? colors.personalLight : 'rgba(255,255,255,0.55)',
                      borderColor: selected ? colors.personal : colors.borderSubtle,
                    }]}
                    onPress={() => setCategoriaTexto(cat === categoriaTexto ? null : cat)}
                    activeOpacity={0.8}
                  >
                    <RNText style={[styles.chipText, { color: selected ? colors.personal : colors.textSecondary }]}>{cat}</RNText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        )}

        {/* ¿Quién pagó? — solo en modo hogar */}
        {scope === 'hogar' && (
          <View style={styles.seccion}>
            <RNText style={[styles.seccionLabel, { color: colors.textSecondary }]}>¿Quién pagó?</RNText>
            <View style={styles.pagadoresRow}>
              {[perfil, companero].filter(Boolean).map((p) => p && (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.pagador, {
                    backgroundColor: pagadoPor === p.id ? 'rgba(107,45,62,0.1)' : colors.card,
                    borderColor: pagadoPor === p.id ? colors.primary : colors.borderSubtle,
                  }]}
                  onPress={() => setPagadoPor(p.id)}
                  activeOpacity={0.8}
                >
                  <Avatar nombre={p.nombre} url={p.avatar_url} size={34} color={colors.primaryLight} />
                  <RNText style={[styles.pagadorNombre, { color: pagadoPor === p.id ? colors.primary : colors.textSecondary }]}>
                    {p.nombre.split(' ')[0]}
                  </RNText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ─── Toggle pago único / en cuotas ─── */}
        <View style={styles.seccion}>
          <RNText style={[styles.seccionLabel, { color: colors.textSecondary }]}>FORMA DE PAGO</RNText>
          <View style={[styles.pagoToggle, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
            <TouchableOpacity
              style={[styles.pagoBtn, !esCuotas && { backgroundColor: accentColor }]}
              onPress={() => setEsCuotas(false)}
              activeOpacity={0.8}
            >
              <RNText style={[styles.pagoBtnText, { color: !esCuotas ? '#fff' : colors.textSecondary }]}>
                Pago único
              </RNText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pagoBtn, esCuotas && { backgroundColor: accentColor }]}
              onPress={() => setEsCuotas(true)}
              activeOpacity={0.8}
            >
              <RNText style={[styles.pagoBtnText, { color: esCuotas ? '#fff' : colors.textSecondary }]}>
                En cuotas
              </RNText>
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Sección de cuotas (solo si esCuotas) ─── */}
        {esCuotas && (
          <>
            {/* Cantidad de cuotas */}
            <View style={[styles.fieldsCard, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
              <View style={styles.cuotaRow}>
                <RNText style={[styles.fieldLabel, { color: colors.textSecondary }]}>Cantidad de cuotas</RNText>
                <TextInput
                  style={[styles.cuotaInput, { color: colors.textPrimary, borderColor: colors.borderSubtle }]}
                  placeholder="12"
                  placeholderTextColor={colors.textSecondary}
                  value={numCuotas}
                  onChangeText={(v) => setNumCuotas(v.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  returnKeyType="done"
                />
              </View>
              {montoCuota !== null && (
                <View style={[styles.cuotaResultRow, { borderTopColor: colors.borderSubtle }]}>
                  <RNText style={[styles.cuotaResultLabel, { color: colors.textSecondary }]}>Por cuota</RNText>
                  <RNText style={[styles.cuotaResultMonto, { color: accentColor }]}>
                    ${montoCuota.toLocaleString('es-UY', { maximumFractionDigits: 2 })}
                  </RNText>
                </View>
              )}
            </View>

            {/* Tarjeta */}
            <View style={styles.seccion}>
              <RNText style={[styles.seccionLabel, { color: colors.textSecondary }]}>TARJETA</RNText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chips}>
                  {TARJETAS.map((t) => {
                    const selected = tarjeta === t;
                    return (
                      <TouchableOpacity
                        key={t}
                        style={[styles.chip, {
                          backgroundColor: selected ? `${accentColor}18` : 'rgba(255,255,255,0.55)',
                          borderColor: selected ? accentColor : colors.borderSubtle,
                        }]}
                        onPress={() => setTarjeta(t === tarjeta ? null : t)}
                        activeOpacity={0.8}
                      >
                        <RNText style={[styles.chipText, { color: selected ? accentColor : colors.textSecondary }]}>{t}</RNText>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          </>
        )}

        {/* Observaciones */}
        <View style={[styles.fieldsCard, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
          <TextInput
            style={[styles.fieldInput, { color: colors.textPrimary }]}
            placeholder="Observaciones (opcional)"
            placeholderTextColor={colors.textSecondary}
            value={observaciones}
            onChangeText={setObservaciones}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Adjuntar — solo en pago único */}
        {!esCuotas && (
          <TouchableOpacity
            style={[styles.adjuntarBtn, {
              backgroundColor: foto ? colors.sageLight : 'rgba(255,255,255,0.55)',
              borderColor: foto ? 'rgba(90,122,72,0.3)' : colors.borderSubtle,
            }]}
            onPress={elegirFoto}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name={foto ? 'check' : 'paperclip'} size={16} color={foto ? colors.sage : colors.textSecondary} />
            <RNText style={[styles.adjuntarText, { color: foto ? colors.sageDark : colors.textSecondary }]}>
              {foto ? 'Comprobante adjuntado' : 'Adjuntar comprobante'}
            </RNText>
          </TouchableOpacity>
        )}

        {scope === 'personal' && <PrivacyBadge />}
      </ScrollView>

      <View style={styles.saveBtnContainer}>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: accentColor, opacity: loading ? 0.6 : 1 }]}
          onPress={handleGuardar}
          disabled={loading}
          activeOpacity={0.8}
        >
          <RNText style={styles.saveBtnText}>
            {loading
              ? 'Guardando...'
              : esCuotas && cuotas > 1
                ? `Registrar ${cuotas} cuotas`
                : scope === 'personal' ? 'Registrar gasto personal' : 'Registrar gasto del hogar'}
          </RNText>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5 },
  topTitle: { fontFamily: 'Manrope_700Bold', fontSize: 13 },
  topSave: { fontFamily: 'Manrope_700Bold', fontSize: 13 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 20 },
  saveBtnContainer: { paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 20 },
  montoCard: { borderRadius: 14, borderWidth: 0.5, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  montoSign: { fontFamily: 'Manrope_700Bold', fontSize: 20 },
  montoInput: { fontFamily: 'Manrope_800ExtraBold', fontSize: 34, letterSpacing: -1, textAlign: 'center', minWidth: 80 },
  fieldsCard: { borderRadius: 14, borderWidth: 0.5, overflow: 'hidden' },
  fieldInput: { fontFamily: 'Manrope_600SemiBold', fontSize: 12, paddingHorizontal: 14, paddingVertical: 13 },
  fieldLabel: { fontFamily: 'Manrope_600SemiBold', fontSize: 11, flex: 1 },
  chips: { flexDirection: 'row', gap: 8, paddingBottom: 2 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 0.5 },
  chipText: { fontFamily: 'Manrope_600SemiBold', fontSize: 10 },
  seccion: { gap: 8 },
  seccionLabel: { fontFamily: 'Manrope_700Bold', fontSize: 8, letterSpacing: 0.8 },
  pagadoresRow: { flexDirection: 'row', gap: 12 },
  pagador: { flex: 1, alignItems: 'center', gap: 8, padding: 14, borderRadius: 14, borderWidth: 0.5 },
  pagadorNombre: { fontFamily: 'Manrope_600SemiBold', fontSize: 11 },
  // Forma de pago toggle
  pagoToggle: { flexDirection: 'row', borderRadius: 13, borderWidth: 0.5, overflow: 'hidden' },
  pagoBtn: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  pagoBtnText: { fontFamily: 'Manrope_700Bold', fontSize: 11 },
  // Cuotas
  cuotaRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 12 },
  cuotaInput: { width: 64, borderWidth: 0.5, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7, fontFamily: 'Manrope_700Bold', fontSize: 13, textAlign: 'center' },
  cuotaResultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 0.5 },
  cuotaResultLabel: { fontFamily: 'Manrope_500Medium', fontSize: 11 },
  cuotaResultMonto: { fontFamily: 'Manrope_800ExtraBold', fontSize: 16, letterSpacing: -0.5 },
  // Adjuntar
  adjuntarBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13, borderRadius: 14, borderWidth: 0.5, borderStyle: 'dashed' },
  adjuntarText: { fontFamily: 'Manrope_600SemiBold', fontSize: 11 },
  saveBtn: { borderRadius: 13, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  saveBtnText: { fontFamily: 'Manrope_700Bold', fontSize: 13, color: '#fff' },
});
