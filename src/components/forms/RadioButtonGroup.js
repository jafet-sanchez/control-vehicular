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
            styles.radioButtonFirst,
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
            styles.radioButtonLast,
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
    justifyContent: 'space-between',
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
  radioButtonFirst: {
    marginRight: 6,
  },
  radioButtonLast: {
    marginLeft: 6,
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