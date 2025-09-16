// src/components/common/CustomButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, typography } from '../../styles';

const CustomButton = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium',
  loading = false, 
  disabled = false,
  icon,
  fullWidth = false 
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button];
    
    // Variante
    baseStyle.push(styles[variant]);
    
    // Tamaño
    baseStyle.push(styles[`size_${size}`]);
    
    // Ancho completo
    if (fullWidth) baseStyle.push(styles.fullWidth);
    
    // Deshabilitado
    if (disabled || loading) baseStyle.push(styles.disabled);
    
    return baseStyle;
  };
  
  const getTextStyle = () => {
    const textStyle = [styles.text];
    if (variant === 'outline') textStyle.push(styles.outlineText);
    return textStyle;
  };

  return (
    <TouchableOpacity 
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.textLight} />
      ) : (
        <>
          {icon}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 24,
  },
  
  // Tamaños
  size_small: {
    height: 36,
    paddingHorizontal: 16,
  },
  size_medium: {
    height: 48,
  },
  size_large: {
    height: 56,
  },
  
  // Variantes
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  success: {
    backgroundColor: colors.success,
  },
  danger: {
    backgroundColor: colors.error,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  
  fullWidth: {
    width: '100%',
  },
  
  disabled: {
    opacity: 0.5,
  },
  
  text: {
    ...typography.button,
    color: colors.textLight,
  },
  
  outlineText: {
    color: colors.primary,
  },
});

export default CustomButton;