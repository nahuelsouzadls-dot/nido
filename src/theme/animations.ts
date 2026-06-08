import {
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  type SharedValue,
} from 'react-native-reanimated';

// ── Spring configs ─────────────────────────────────────────────────────────────

export const springs = {
  // Cards que entran, listas que cargan, formularios que aparecen
  gentle: { mass: 1, damping: 20, stiffness: 180 },

  // Toggles, chips, selección de categorías — respuesta inmediata con micro-rebote
  snappy: { mass: 0.8, damping: 18, stiffness: 260 },

  // Solo para logros: objetivo completado, factura pagada, ingreso registrado
  bouncy: { mass: 1, damping: 14, stiffness: 220 },
} as const;

// ── Timing helpers ─────────────────────────────────────────────────────────────

export const timings = {
  fast:   (value: number) => withTiming(value, { duration: 180, easing: Easing.out(Easing.ease) }),
  medium: (value: number) => withTiming(value, { duration: 300, easing: Easing.out(Easing.cubic) }),
  slow:   (value: number) => withTiming(value, { duration: 500, easing: Easing.inOut(Easing.ease) }),
};

// ── Animation helpers ──────────────────────────────────────────────────────────

export const anim = {
  // Card/row presionado — escala 0.97 al tocar, vuelve a 1 al soltar
  pressIn:  (scale: SharedValue<number>) => { scale.value = withSpring(0.97, springs.snappy); },
  pressOut: (scale: SharedValue<number>) => { scale.value = withSpring(1.0,  springs.snappy); },

  // Entrada de card desde abajo con fade — delay en ms para stagger entre items
  cardEnter: (
    translateY: SharedValue<number>,
    opacity: SharedValue<number>,
    delay = 0,
  ) => {
    translateY.value = 18;
    opacity.value    = 0;
    translateY.value = withDelay(delay, withSpring(0,  springs.gentle));
    opacity.value    = withDelay(delay, withTiming(1, { duration: 220 }));
  },

  // Chip seleccionado — micro-rebote hacia arriba
  chipSelect: (scale: SharedValue<number>) => {
    scale.value = withSpring(1.06, springs.snappy);
  },

  // Icono de success screen — bouncy entrance
  successIcon: (scale: SharedValue<number>, opacity: SharedValue<number>) => {
    scale.value   = 0;
    opacity.value = 0;
    scale.value   = withSpring(1,  springs.bouncy);
    opacity.value = withTiming(1, { duration: 200 });
  },

  // Fila que acaba de actualizarse — latido sutil
  heartbeat: (scale: SharedValue<number>) => {
    scale.value = withSequence(
      withSpring(0.97, springs.snappy),
      withSpring(1.0,  springs.snappy),
    );
  },

  // ThemeOption al seleccionar
  themeSelect: (scale: SharedValue<number>) => {
    scale.value = withSequence(
      withSpring(0.95, springs.snappy),
      withSpring(1.02, springs.bouncy),
      withSpring(1.0,  springs.gentle),
    );
  },

  // Barra de progreso de objetivo — animación hacia el porcentaje target
  progressFill: (width: SharedValue<number>, targetPct: number) => {
    width.value = withSpring(targetPct, springs.bouncy);
  },

  // Toggle sliding indicator (ContextSelectorBar)
  slideToggle: (offset: SharedValue<number>, target: number) => {
    offset.value = withSpring(target, springs.snappy);
  },
};
