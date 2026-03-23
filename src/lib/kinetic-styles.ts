/**
 * KINETIC Design System - Component Style Presets
 *
 * Utility classes and patterns for consistent institutional-grade styling
 * across CrySer trading platform.
 */

// Color palette exports
export const KineticColors = {
  primary: "#4edea3", // Institutional green
  primaryContainer: "#001c10",
  onPrimary: "#003824",

  secondary: "#b9c7e0", // Professional blue
  secondaryContainer: "#3c4a5e",
  onSecondary: "#233144",

  tertiary: "#ffb3ad", // Error/warning red
  tertiaryContainer: "#390003",
  onTertiary: "#68000a",

  background: "#0c1324", // Dark navy
  surface: "#0c1324",
  surfaceContainer: "#191f31",
  surfaceContainerLow: "#151b2d",
  surfaceContainerHigh: "#23293c",
  surfaceContainerHighest: "#2e3447",
  surfaceContainerLowest: "#070d1f",

  onBackground: "#dce1fb",
  onSurface: "#dce1fb",
  onSurfaceVariant: "#c6c6cd",

  outlineVariant: "#45464d",
  outline: "#909097",
  border: "#3e4850",

  error: "#ffb4ab",
  errorContainer: "#93000a",
  onError: "#690005",
};

// Typography exports
export const KineticTypography = {
  fontFamilies: {
    headline: '"Manrope", sans-serif',
    body: '"Inter", sans-serif',
    label: '"Inter", sans-serif',
  },
  weights: {
    bold: 700,
    semibold: 600,
    medium: 500,
    regular: 400,
  },
  sizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
    "6xl": "3.75rem",
    "7xl": "4.5rem",
  },
};

// Timing exports (animation delays in milliseconds)
export const KineticTimings = {
  fast: 150,
  base: 300,
  slow: 400,
  marquee: 30000, // 30 seconds for marquee
};

// Border radius tokens
export const KineticBorderRadius = {
  none: "0",
  xs: "0.125rem",
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
  full: "9999px",
};

// Shadow/elevation system
export const KineticShadows = {
  xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
};

// Component patterns for Tailwind classes
export const KineticComponentPatterns = {
  // Cards
  card: "bg-surface-container-low p-6 rounded-xl border border-outline-variant/10",
  cardElevated:
    "bg-surface-container-low p-10 rounded-xl flex flex-col justify-between border border-outline-variant/10 group hover:border-primary/30 transition-all",
  cardSmall:
    "bg-surface-container p-8 rounded-xl border border-outline-variant/10 hover:bg-surface-container-high transition-colors",

  // Buttons
  buttonPrimary:
    "gradient-kinetic px-8 py-4 rounded-md font-headline font-bold text-on-primary active:scale-95 transition-transform hover:shadow-lg",
  buttonSecondary:
    "px-8 py-4 rounded-md border border-outline-variant hover:bg-surface-container transition-colors font-headline font-bold",
  buttonSmall: "px-3 py-1 rounded-md text-xs font-semibold transition-colors",

  // Badges
  badge:
    "inline-flex items-center px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[10px] uppercase tracking-widest font-bold",
  badgePrimary:
    "inline-flex items-center px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] uppercase tracking-widest font-bold",
  badgeDanger:
    "inline-flex items-center px-3 py-1 rounded-full bg-error-container/50 text-error text-[10px] uppercase tracking-widest font-bold",

  // Headers
  headerLarge:
    "font-headline text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]",
  headerMedium: "font-headline text-3xl md:text-4xl font-bold mb-4",
  headerSmall: "font-headline text-2xl font-bold mb-3",

  // Text
  bodyLarge:
    "font-body text-lg text-on-surface-variant max-w-xl mb-10 leading-relaxed",
  bodySmall: "font-body text-sm text-on-surface-variant leading-relaxed",
  labelXs: "text-[10px] uppercase tracking-widest font-bold",
  labelSm: "text-xs uppercase tracking-widest font-semibold",

  // Containers
  containerMaxWidth: "max-w-7xl mx-auto w-full",
  containerPadding: "px-6 md:px-12",

  // Grid patterns
  bentoGrid: "grid grid-cols-1 md:grid-cols-3 gap-6",
  bentoGridWide: "md:col-span-2",
  bentoGridFull: "md:col-span-3",

  // Hero section
  heroSection: "relative min-h-[921px] flex items-center overflow-hidden",

  // Feature cards
  featureLarge:
    "md:col-span-2 bg-surface-container-low p-10 rounded-xl flex flex-col justify-between min-h-[400px] border border-outline-variant/10 group hover:border-primary/30 transition-all",
  featureSmall:
    "bg-surface-container p-8 rounded-xl border border-outline-variant/10 hover:bg-surface-container-high transition-colors",

  // Step numbers (for onboarding)
  stepNumber:
    "w-24 h-24 rounded-full flex items-center justify-center border-4 border-background mx-auto mb-8",

  // Ticker chips
  tickerChip:
    "flex items-center gap-4 px-4 py-2 bg-secondary-container/30 rounded-full border border-outline-variant/10",
};

// Animation utilities
export const KineticAnimations = {
  fadeIn: "animate-fadeIn",
  slideUp: "animate-slideUp",
  slideDown: "animate-slideDown",
  slideLeft: "animate-slideLeft",
  slideRight: "animate-slideRight",
  scaleIn: "animate-scaleIn",
  marquee: "animate-marquee",
};

// Helper function to apply stagger delay
export const staggerDelay = (
  index: number,
  baseDelay: number = 100,
): number => {
  return index * baseDelay;
};

// Gradient definitions
export const KineticGradients = {
  primary: "linear-gradient(135deg, #4edea3 0%, #009365 100%)",
  primarySubtle:
    "linear-gradient(135deg, rgba(78, 222, 163, 0.1) 0%, rgba(0, 147, 101, 0.05) 100%)",
};

/**
 * Hook-friendly exports for React components
 */
export const useKineticStyle = () => ({
  colors: KineticColors,
  typography: KineticTypography,
  timings: KineticTimings,
  borderRadius: KineticBorderRadius,
  shadows: KineticShadows,
  components: KineticComponentPatterns,
  animations: KineticAnimations,
  gradients: KineticGradients,
});

export default {
  colors: KineticColors,
  typography: KineticTypography,
  timings: KineticTimings,
  borderRadius: KineticBorderRadius,
  shadows: KineticShadows,
  components: KineticComponentPatterns,
  animations: KineticAnimations,
  gradients: KineticGradients,
};
