// src/screens/ReportsScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from '../components/common/Header';
import { globalStyles } from '../styles';

const ReportsScreen = ({ navigation }) => {
  return (
    <View style={globalStyles.container}>
      <Header
        title="Reportes"
        rightAction={{
          icon: 'download-outline',
          onPress: () => console.log('Exportar Excel'),
        }}
      />
      <View style={styles.content}>
        <Text>Pantalla de Reportes - Por implementar</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ReportsScreen;