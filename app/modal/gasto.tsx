import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Radii, Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { adjuntarFotoGasto } from '@/services/gastos';
import { useAuthStore } from '@/store/auth';
import { useGastos } from '@/hooks/useGastos';
import { supabase } from '@/lib/supabase';
import type { Categoria } from '@/types';

function parseMonto(raw: string): number {
  if (raw.includes('.') && raw.includes(',')) {
    return parseFloat(raw.replace(/\./g, '').replace(',', '.'));
  }
  if (raw.includes(',')) {
    return parseFloat(raw.replace(',', '.'));
  }
  return parseFloat(raw);
}

export default function ModalGasto() {
  const router = useRouter();
  const colors = useColors();
  const { hogar, perfil, companero } = useAuthStore();
  const hoy = new Date();
  const { agregar } = useGastos(hoy.getMonth() + 1, hoy.getFullYear());

  const { montoOCR, descripcionOCR, fotoUri } = useLocalSearchParams<{
    montoOCR?: string;
    descripcionOCR?: string;
    fotoUri?: string;
  }>();

  const [monto, setMonto] = useState(montoOCR ?? '');
  const [descripcion, setDescripcion] = useState(descripcionOCR ?? '');
  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [pagadoPor, setPagadoPor] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [foto, setFoto] = useState<string | null>(fotoUri ?? null);

  useEffect(() => {
    if (perfil?.id && !pagadoPor) {
      setPagadoPor(perfil.id);
    }
  }, [perfil?.id]);

  useEffect(() => {
    if (!hogar) return;
    supabase
      .from('categorias')
      .select('*')
      .eq('hogar_id', hogar.id)
      .then(({ data }) => {
        if (data) setCategorias(data as Categoria[]);
      });
  }, [hogar]);

  const handleGuardar = async () => {
    if (!monto || !descripcion.trim()) {
      Alert.alert('Campos requeridos', 'Completá el monto y la descripción');
      return;
    }

    if (!pagadoPor) {
      Alert.alert('Seleccioná quién pagó', 'Tocá una de las dos personas antes de guardar');
      return;
    }

    const montoNum = parseMonto(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      Alert.alert('Monto inválido', 'Ingresá un número mayor a cero');
      return;
    }

    setLoading(true);
    try {
      const nuevo = await agregar({
        monto: montoNum,
        descripcion: descripcion.trim(),
        categoria_id: categoriaId,
        pagado_por: pagadoPor,
        fecha: hoy.toISOString().split('T')[0],
        observaciones: observaciones.trim() || null,
      });

      if (foto && nuevo?.id) {
        await adjuntarFotoGasto(nuevo.id, foto);
      }

      router.back();
    } catch {
      Alert.alert('Error', 'No se pudo guardar el gasto. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const elegirFoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images' as const,
      quality: 0.7,
    });
    if (!result.canceled) setFoto(result.assets[0].uri);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Monto */}
        <View style={styles.montoArea}>
          <Text variant="caption" color={colors.textSecondary}>
            Monto
          </Text>
          <View style={styles.montoInputRow}>
            <Text style={[styles.montoSigno, { color: colors.textSecondary }]}>$</Text>
            <Input
              value={monto}
              onChangeText={setMonto}
              placeholder="0"
              keyboardType="decimal-pad"
              style={styles.montoInput}
              autoFocus
              returnKeyType="next"
            />
          </View>
        </View>

        {/* Descripción */}
        <Input
          label="Descripción"
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Ej: Almacén, Farmacia, Netflix..."
          returnKeyType="done"
        />

        {/* Categoría */}
        <View style={styles.seccion}>
          <Text variant="footnote" color={colors.textSecondary} style={styles.label}>
            Categoría
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chips}>
              {categorias.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.chip,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    categoriaId === cat.id && { borderColor: colors.primary, backgroundColor: colors.primaryLight },
                  ]}
                  onPress={() => setCategoriaId(cat.id === categoriaId ? null : cat.id)}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 16 }}>{cat.icono}</Text>
                  <Text
                    variant="caption"
                    style={{
                      fontWeight: '600',
                      color: categoriaId === cat.id ? colors.primary : colors.textSecondary,
                    }}
                  >
                    {cat.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* ¿Quién pagó? */}
        <View style={styles.seccion}>
          <Text variant="footnote" color={colors.textSecondary} style={styles.label}>
            ¿Quién pagó?
          </Text>
          <View style={styles.pagadoresRow}>
            {[perfil, companero].filter(Boolean).map((p) => p && (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.pagador,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  pagadoPor === p.id && { borderColor: colors.primary, backgroundColor: colors.primaryLight },
                ]}
                onPress={() => setPagadoPor(p.id)}
                activeOpacity={0.8}
              >
                <Avatar nombre={p.nombre} url={p.avatar_url} size={36} />
                <Text
                  variant="footnote"
                  style={{
                    fontWeight: '600',
                    color: pagadoPor === p.id ? colors.primary : colors.textSecondary,
                  }}
                >
                  {p.nombre.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Observaciones */}
        <Input
          label="Observaciones (opcional)"
          value={observaciones}
          onChangeText={setObservaciones}
          placeholder="Detalles adicionales..."
          multiline
          numberOfLines={2}
          style={{ maxHeight: 80 }}
        />

        {/* Foto */}
        <TouchableOpacity
          style={[styles.adjuntarBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={elegirFoto}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 18 }}>📎</Text>
          <Text variant="callout" color={foto ? colors.primary : colors.textSecondary}>
            {foto ? 'Comprobante adjuntado ✓' : 'Adjuntar comprobante'}
          </Text>
        </TouchableOpacity>

        <Button
          label="Guardar gasto"
          onPress={handleGuardar}
          loading={loading}
          size="lg"
          style={{ marginTop: 8 }}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: Spacing.md, gap: 20, paddingBottom: 32 },
  montoArea: { alignItems: 'center', gap: 4, paddingVertical: 16 },
  montoInputRow: { flexDirection: 'row', alignItems: 'center' },
  montoSigno: {
    fontSize: 34,
    fontWeight: '300',
    lineHeight: 56,
  },
  montoInput: {
    fontSize: 48,
    fontWeight: '700',
    borderWidth: 0,
    textAlign: 'center',
    minWidth: 120,
    height: 60,
  },
  seccion: { gap: 8 },
  label: { marginBottom: 0 },
  chips: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radii.full,
    borderWidth: 1.5,
  },
  pagadoresRow: { flexDirection: 'row', gap: 12 },
  pagador: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: Radii.lg,
    borderWidth: 1.5,
  },
  adjuntarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
});
