// src/components/forms/RadioButtonGroup.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../../styles';

const RadioButtonGroup = ({ label, value, onChange, required = false }) => {
  const isYesSelected = value === 'si';
  const isNoSelected = value === 'no';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[
            styles.radioButton,
            isYesSelected && styles.radioButtonYesSelected,
          ]}
          onPress={() => onChange('si')}
          activeOpacity={0.8}
        >
          <View style={[styles.radio, isYesSelected && styles.radioSelected]}>
            {isYesSelected && <View style={styles.radioInner} />}
          </View>
          <Text style={[styles.radioText, isYesSelected && styles.radioTextSelected]}>
            Sí
          </Text>
          {isYesSelected && (
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.radioButton,
            isNoSelected && styles.radioButtonNoSelected,
          ]}
          onPress={() => onChange('no')}
          activeOpacity={0.8}
        >
          <View style={[styles.radio, isNoSelected && styles.radioSelected]}>
            {isNoSelected && <View style={styles.radioInnerNo} />}
          </View>
          <Text style={[styles.radioText, isNoSelected && styles.radioTextSelected]}>
            No
          </Text>
          {isNoSelected && (
            <Ionicons name="alert-circle" size={20} color={colors.warning} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  label: {
    ...typography.subtitle1,
    color: colors.text,
    marginBottom: 8,
  },
  required: {
    color: colors.error,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  radioButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  radioButtonYesSelected: {
    borderColor: colors.success,
    backgroundColor: colors.success + '10',
    borderWidth: 2,
  },
  radioButtonNoSelected: {
    borderColor: colors.warning,
    backgroundColor: colors.warning + '10',
    borderWidth: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
  },
  radioInnerNo: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.warning,
  },
  radioText: {
    ...typography.body1,
    color: colors.text,
    flex: 1,
  },
  radioTextSelected: {
    fontWeight: '600',
  },
});

export default RadioButtonGroup;

// src/components/forms/InspectionForm.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import RadioButtonGroup from './RadioButtonGroup';
import { colors, typography, globalStyles } from '../../styles';

const InspectionForm = ({ 
  type = 'ingreso', // 'ingreso' o 'salida'
  initialValues = {},
  onChange,
  guardSuggestions = []
}) => {
  const [inspection, setInspection] = useState({
    espejo: initialValues.espejo || null,
    bodega: initialValues.bodega || null,
    interior: initialValues.interior || null,
    guarda: initialValues.guarda || '',
  });

  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (onChange) {
      onChange(inspection);
    }
  }, [inspection]);

  const handleFieldChange = (field, value) => {
    setInspection(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGuardSelect = (guardName) => {
    handleFieldChange('guarda', guardName);
    setShowSuggestions(false);
  };

  const isComplete = () => {
    return inspection.espejo && inspection.bodega && 
           inspection.interior && inspection.guarda;
  };

  const title = type === 'ingreso' ? 'REQUISADO INGRESO' : 'REQUISADO SALIDA';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {isComplete() && (
          <View style={styles.completeIndicator}>
            <Text style={styles.completeText}>Completo</Text>
          </View>
        )}
      </View>

      <RadioButtonGroup
        label="Espejo"
        value={inspection.espejo}
        onChange={(value) => handleFieldChange('espejo', value)}
        required
      />

      <RadioButtonGroup
        label="Bodega"
        value={inspection.bodega}
        onChange={(value) => handleFieldChange('bodega', value)}
        required
      />

      <RadioButtonGroup
        label="Interior"
        value={inspection.interior}
        onChange={(value) => handleFieldChange('interior', value)}
        required
      />

      <View style={styles.guardSection}>
        <Text style={styles.label}>
          Guarda (Vigilante) <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[globalStyles.input, styles.guardInput]}
          placeholder="Nombre del vigilante"
          placeholderTextColor={colors.textSecondary}
          value={inspection.guarda}
          onChangeText={(text) => handleFieldChange('guarda', text)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        
        {showSuggestions && guardSuggestions.length > 0 && (
          <View style={styles.suggestions}>
            {guardSuggestions.map((guard, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => handleGuardSelect(guard)}
              >
                <Text style={styles.suggestionText}>{guard}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h6,
    color: colors.primary,
    fontWeight: 'bold',
  },
  completeIndicator: {
    backgroundColor: colors.success,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completeText: {
    ...typography.caption,
    color: colors.textLight,
    fontWeight: '600',
  },
  guardSection: {
    marginTop: 12,
  },
  label: {
    ...typography.subtitle1,
    color: colors.text,
    marginBottom: 8,
  },
  required: {
    color: colors.error,
  },
  guardInput: {
    backgroundColor: colors.surface,
  },
  suggestions: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: 150,
    zIndex: 1000,
    elevation: 5,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionText: {
    ...typography.body1,
    color: colors.text,
  },
});

export default InspectionForm;