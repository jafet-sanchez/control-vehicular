// src/screens/PeopleScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from '../components/common/Header';
import { globalStyles } from '../styles';

const PeopleScreen = ({ navigation }) => {
  return (
    <View style={globalStyles.container}>
      <Header
        title="Gestión de Personas"
        rightAction={{
          icon: 'add-circle-outline',
          onPress: () => console.log('Agregar persona'),
        }}
      />
      <View style={styles.content}>
        <Text>Pantalla de Personas - Por implementar</Text>
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

export default PeopleScreen;