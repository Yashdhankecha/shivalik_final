// Design System Constants
export const typography = {
  fonts: {
    heading: 'font-sans',
    body: 'font-sans',
  },
  sizes: {
    h1: 'text-2xl sm:text-3xl md:text-4xl font-bold',
    h2: 'text-xl sm:text-2xl md:text-3xl font-bold',
    h3: 'text-lg sm:text-xl md:text-2xl font-semibold',
    body: 'text-base sm:text-lg',
    small: 'text-sm sm:text-base',
    caption: 'text-xs sm:text-sm',
  },
  lineHeight: {
    tight: 'leading-tight',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
  },
};

export const spacing = {
  xs: 'p-1 sm:p-2',
  sm: 'p-2 sm:p-3',
  md: 'p-3 sm:p-4',
  lg: 'p-4 sm:p-6',
  xl: 'p-6 sm:p-8',
  xxl: 'p-8 sm:p-10',
  
  margin: {
    xs: 'm-1 sm:m-2',
    sm: 'm-2 sm:m-3',
    md: 'm-3 sm:m-4',
    lg: 'm-4 sm:m-6',
    xl: 'm-6 sm:m-8',
  },
};

export const colors = {
  primary: {
    DEFAULT: 'bg-black text-white',
    light: 'bg-gray-100 text-black',
    dark: 'bg-gray-900 text-white',
  },
  secondary: {
    DEFAULT: 'bg-gray-50 text-gray-900',
    light: 'bg-white text-gray-800',
    dark: 'bg-gray-200 text-gray-900',
  },
  accent: {
    DEFAULT: 'bg-blue-500 text-white',
    light: 'bg-blue-100 text-blue-800',
    dark: 'bg-blue-700 text-white',
  },
  status: {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  },
};

export const borderRadius = {
  sm: 'rounded-sm',
  md: 'rounded',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Responsive utility classes
export const responsive = {
  mobileFirst: 'sm:md:lg:xl:2xl:',
  container: 'max-w-full sm:max-w-6xl mx-auto px-4 sm:px-6',
};

// Common component patterns
export const cardStyles = {
  base: 'bg-white border border-gray-200 rounded-lg shadow-sm',
  hover: 'hover:shadow-md transition-shadow duration-200',
};

export const buttonStyles = {
  base: 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  sizes: {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-11 px-8 text-lg',
  },
  variants: {
    primary: 'bg-black text-white hover:bg-gray-800',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-50',
    ghost: 'hover:bg-gray-100',
  },
};

export const inputStyles = {
  base: 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
};

// Animation utilities
export const animations = {
  fadeIn: 'animate-in fade-in duration-300',
  slideIn: 'animate-in slide-in-from-bottom duration-300',
  pulse: 'animate-pulse',
};

// Accessibility utilities
export const accessibility = {
  focusVisible: 'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
  srOnly: 'sr-only',
};