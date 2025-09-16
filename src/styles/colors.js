// src/styles/colors.js
export const colors = {
  primary: '#2196F3',
  primaryDark: '#1976D2',
  primaryLight: '#BBDEFB',
  
  secondary: '#FF9800',
  secondaryDark: '#F57C00',
  secondaryLight: '#FFE0B2',
  
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  text: '#212121',
  textSecondary: '#757575',
  textLight: '#FFFFFF',
  
  background: '#F5F5F5',
  surface: '#FFFFFF',
  border: '#E0E0E0',
  
  // Estados de inspección
  inspectionYes: '#4CAF50',
  inspectionNo: '#FF9800',
  inspectionPending: '#9E9E9E',
  
  // Sombras
  shadow: '#000000',
};

// src/styles/typography.js
import { Platform } from 'react-native';

export const typography = {
  // Títulos
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  h5: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  h6: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  
  // Cuerpo
  body1: {
    fontSize: 16,
    fontWeight: 'normal',
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: 'normal',
    lineHeight: 20,
  },
  
  // Subtítulos
  subtitle1: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  subtitle2: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  
  // Botones y Labels
  button: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal',
    lineHeight: 16,
  },
  overline: {
    fontSize: 10,
    fontWeight: 'normal',
    textTransform: 'uppercase',
    letterSpacing: 1,
    lineHeight: 14,
  },
};

// src/styles/globalStyles.js
import { StyleSheet, Platform } from 'react-native';
import { colors } from './colors';
import { typography } from './typography';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
  },
  
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  
  buttonSecondary: {
    backgroundColor: colors.secondary,
  },
  
  buttonSuccess: {
    backgroundColor: colors.success,
  },
  
  buttonDanger: {
    backgroundColor: colors.error,
  },
  
  buttonText: {
    color: colors.textLight,
    ...typography.button,
  },
  
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  
  label: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: 4,
  },
  
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  spaceBetween: {
    justifyContent: 'space-between',
  },
  
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  shadow: Platform.select({
    ios: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 3,
    },
  }),
  
  // Estilos para los radio buttons de inspección
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  radioButtonSelected: {
    borderWidth: 2,
  },
  
  radioButtonYes: {
    borderColor: colors.success,
    backgroundColor: colors.success + '10',
  },
  
  radioButtonNo: {
    borderColor: colors.warning,
    backgroundColor: colors.warning + '10',
  },
  
  radioLabel: {
    ...typography.body2,
    marginLeft: 8,
  },
});

// src/styles/index.js
export { colors } from './colors';
export { typography } from './typography';
export { globalStyles } from './globalStyles';