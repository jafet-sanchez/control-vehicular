// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from './src/styles';

// Importar pantallas
import HomeScreen from './src/screens/HomeScreen';
import CheckInScreen from './src/screens/CheckInScreen';
import CheckOutScreen from './src/screens/CheckOutScreen';
import PeopleScreen from './src/screens/PeopleScreen';
import ReportsScreen from './src/screens/ReportsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack de navegación para el Home
const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="CheckIn" component={CheckInScreen} />
      <Stack.Screen name="CheckOut" component={CheckOutScreen} />
    </Stack.Navigator>
  );
};

// Navegación principal con tabs
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Entrada':
              iconName = focused ? 'enter' : 'enter-outline';
              break;
            case 'Salida':
              iconName = focused ? 'exit' : 'exit-outline';
              break;
            case 'Personas':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Reportes':
              iconName = focused ? 'document-text' : 'document-text-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} options={{ title: 'Inicio' }} />
      <Tab.Screen name="Entrada" component={CheckInScreen} />
      <Tab.Screen name="Salida" component={CheckOutScreen} />
      <Tab.Screen name="Personas" component={PeopleScreen} />
      <Tab.Screen name="Reportes" component={ReportsScreen} />
    </Tab.Navigator>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
}

// src/screens/CheckOutScreen.js (Plantilla básica)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from '../components/common/Header';
import { globalStyles } from '../styles';

const CheckOutScreen = ({ navigation }) => {
  return (
    <View style={globalStyles.container}>
      <Header
        title="Registrar Salida"
        onBack={() => navigation.goBack()}
      />
      <View style={styles.content}>
        <Text>Pantalla de Salida - Por implementar</Text>
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

export default CheckOutScreen;

// src/screens/PeopleScreen.js (Plantilla básica)
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

// src/screens/ReportsScreen.js (Plantilla básica)
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