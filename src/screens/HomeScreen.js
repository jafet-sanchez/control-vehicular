// src/screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Header from '../components/common/Header';
import { colors, typography, globalStyles } from '../styles';

const HomeScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    vehiclesInside: 12,
    todayEntries: 24,
    todayExits: 12,
    pendingInspections: 3,
  });

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'entrada',
      person: 'Juan Pérez',
      vehicle: 'ABC123',
      time: '08:30',
    },
    {
      id: 2,
      type: 'salida',
      person: 'María García',
      vehicle: 'XYZ789',
      time: '08:45',
    },
    {
      id: 3,
      type: 'entrada',
      person: 'Carlos López',
      vehicle: 'DEF456',
      time: '09:00',
    },
  ]);

  const onRefresh = () => {
    setRefreshing(true);
    // Aquí cargaremos los datos desde AsyncStorage/Excel
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const StatCard = ({ icon, title, value, color, onPress }) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </TouchableOpacity>
  );

  const ActivityItem = ({ activity }) => (
    <View style={styles.activityItem}>
      <View style={[
        styles.activityIcon,
        { backgroundColor: activity.type === 'entrada' ? colors.success + '20' : colors.warning + '20' }
      ]}>
        <Ionicons
          name={activity.type === 'entrada' ? 'enter-outline' : 'exit-outline'}
          size={20}
          color={activity.type === 'entrada' ? colors.success : colors.warning}
        />
      </View>
      <View style={styles.activityInfo}>
        <Text style={styles.activityPerson}>{activity.person}</Text>
        <Text style={styles.activityVehicle}>{activity.vehicle}</Text>
      </View>
      <Text style={styles.activityTime}>{activity.time}</Text>
    </View>
  );

  const QuickAction = ({ icon, title, color, onPress }) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={28} color={colors.textLight} />
      </View>
      <Text style={styles.quickActionTitle}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={globalStyles.container}>
      <Header 
        title="Control Vehicular"
        subtitle={format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
        rightAction={{
          icon: 'notifications-outline',
          onPress: () => console.log('Notificaciones'),
        }}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Estadísticas */}
        <View style={styles.statsContainer}>
          <StatCard
            icon="car-outline"
            title="Dentro"
            value={stats.vehiclesInside}
            color={colors.primary}
            onPress={() => console.log('Vehículos dentro')}
          />
          <StatCard
            icon="enter-outline"
            title="Entradas Hoy"
            value={stats.todayEntries}
            color={colors.success}
            onPress={() => console.log('Entradas de hoy')}
          />
          <StatCard
            icon="exit-outline"
            title="Salidas Hoy"
            value={stats.todayExits}
            color={colors.warning}
            onPress={() => console.log('Salidas de hoy')}
          />
          <StatCard
            icon="alert-circle-outline"
            title="Pendientes"
            value={stats.pendingInspections}
            color={colors.error}
            onPress={() => console.log('Inspecciones pendientes')}
          />
        </View>

        {/* Acciones Rápidas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.quickActions}>
            <QuickAction
              icon="add-circle"
              title="Nueva Entrada"
              color={colors.success}
              onPress={() => navigation.navigate('CheckIn')}
            />
            <QuickAction
              icon="remove-circle"
              title="Registrar Salida"
              color={colors.warning}
              onPress={() => navigation.navigate('CheckOut')}
            />
            <QuickAction
              icon="people"
              title="Personas"
              color={colors.primary}
              onPress={() => navigation.navigate('Personas')}
            />
            <QuickAction
              icon="document-text"
              title="Reportes"
              color={colors.info}
              onPress={() => navigation.navigate('Reportes')}
            />
          </View>
        </View>

        {/* Actividad Reciente */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Actividad Reciente</Text>
            <TouchableOpacity onPress={() => console.log('Ver toda la actividad')}>
              <Text style={styles.seeAll}>Ver todo</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.activityList}>
            {recentActivity.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </View>
        </View>

        {/* Espacio inferior para el tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    paddingBottom: 8,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    margin: '1%',
    alignItems: 'center',
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
  },
  statTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    ...typography.h6,
    color: colors.text,
    fontWeight: '600',
  },
  seeAll: {
    ...typography.body2,
    color: colors.primary,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    ...typography.caption,
    color: colors.text,
    textAlign: 'center',
  },
  activityList: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityPerson: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '500',
  },
  activityVehicle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  activityTime: {
    ...typography.body2,
    color: colors.textSecondary,
  },
});

export default HomeScreen