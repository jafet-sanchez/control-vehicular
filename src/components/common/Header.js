// src/components/common/Header.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../../styles';

const Header = ({ title, subtitle, onBack, rightAction }) => {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
      <View style={styles.container}>
        <View style={styles.leftSection}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.textLight} />
            </TouchableOpacity>
          )}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>
        {rightAction && (
          <TouchableOpacity onPress={rightAction.onPress} style={styles.rightButton}>
            <Ionicons name={rightAction.icon} size={24} color={colors.textLight} />
          </TouchableOpacity>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...typography.h5,
    color: colors.textLight,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textLight,
    opacity: 0.8,
    marginTop: 2,
  },
  rightButton: {
    marginLeft: 16,
  },
});

export default Header;

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

// src/components/common/SearchBar.js
import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, globalStyles } from '../../styles';

const SearchBar = ({ 
  placeholder = 'Buscar...', 
  value, 
  onChangeText,
  onClear,
  autoFocus = false 
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChangeText('');
    if (onClear) onClear();
  };

  return (
    <View style={[styles.container, isFocused && styles.containerFocused]}>
      <Ionicons 
        name="search" 
        size={20} 
        color={isFocused ? colors.primary : colors.textSecondary} 
      />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value?.length > 0 && (
        <TouchableOpacity onPress={handleClear}>
          <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: 8,
  },
  containerFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.text,
  },
});

export default SearchBar;