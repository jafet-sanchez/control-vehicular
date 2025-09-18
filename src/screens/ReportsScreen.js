// src/screens/ReportsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Header from '../components/common/Header';
import CustomButton from '../components/common/CustomButton';
import { colors, typography, globalStyles } from '../styles';

const ReportsScreen = ({ navigation }) => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [stats, setStats] = useState({
    totalEntries: 0,
    totalExits: 0,
    pendingExits: 0,
    avgStayTime: '0h 0min',
  });

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    filterRecordsByMonth();
    calculateStats();
  }, [records, selectedMonth]);

  // Cargar registros desde AsyncStorage
  const loadRecords = async () => {
    setLoading(true);
    try {
      const storedRecords = await AsyncStorage.getItem('vehicleRecords');
      if (storedRecords) {
        setRecords(JSON.parse(storedRecords));
      } else {
        // Datos de ejemplo para demostración
        const sampleRecords = [
          {
            id: 1,
            nombre: 'Juan Pérez',
            vehiculo: 'ABC123',
            fecha: format(new Date(), 'dd/MM/yyyy'),
            horaIngreso: '08:30',
            requisadoIngreso: {
              espejo: 'si',
              bodega: 'si',
              interior: 'si',
              guarda: 'Carlos Mendoza',
            },
            horaSalida: '17:45',
            requisadoSalida: {
              espejo: 'si',
              bodega: 'si',
              interior: 'si',
              guarda: 'María García',
            },
          },
          {
            id: 2,
            nombre: 'María García',
            vehiculo: 'XYZ789',
            fecha: format(new Date(), 'dd/MM/yyyy'),
            horaIngreso: '09:15',
            requisadoIngreso: {
              espejo: 'si',
              bodega: 'no',
              interior: 'si',
              guarda: 'Ana Martínez',
            },
            horaSalida: '',
            requisadoSalida: {
              espejo: null,
              bodega: null,
              interior: null,
              guarda: '',
            },
          },
        ];
        setRecords(sampleRecords);
        await AsyncStorage.setItem('vehicleRecords', JSON.stringify(sampleRecords));
      }
    } catch (error) {
      console.error('Error cargando registros:', error);
      Alert.alert('Error', 'No se pudieron cargar los registros');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar registros por mes
  const filterRecordsByMonth = () => {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    
    const filtered = records.filter(record => {
      const [day, month, year] = record.fecha.split('/');
      const recordDate = new Date(year, month - 1, day);
      return recordDate >= monthStart && recordDate <= monthEnd;
    });
    
    setFilteredRecords(filtered);
  };

  // Calcular estadísticas
  const calculateStats = () => {
    const totalEntries = filteredRecords.length;
    const totalExits = filteredRecords.filter(r => r.horaSalida).length;
    const pendingExits = totalEntries - totalExits;
    
    // Calcular tiempo promedio
    let totalMinutes = 0;
    let validExits = 0;
    
    filteredRecords.forEach(record => {
      if (record.horaSalida) {
        const [entryHour, entryMinute] = record.horaIngreso.split(':').map(Number);
        const [exitHour, exitMinute] = record.horaSalida.split(':').map(Number);
        const diffMinutes = (exitHour * 60 + exitMinute) - (entryHour * 60 + entryMinute);
        if (diffMinutes > 0) {
          totalMinutes += diffMinutes;
          validExits++;
        }
      }
    });
    
    const avgMinutes = validExits > 0 ? Math.floor(totalMinutes / validExits) : 0;
    const avgHours = Math.floor(avgMinutes / 60);
    const avgMins = avgMinutes % 60;
    
    setStats({
      totalEntries,
      totalExits,
      pendingExits,
      avgStayTime: `${avgHours}h ${avgMins}min`,
    });
  };

  // Exportar a Excel
  const exportToExcel = async () => {
    setExporting(true);
    try {
      // Preparar datos para Excel
      const excelData = filteredRecords.map(record => ({
        'Nombre': record.nombre,
        'Vehículo': record.vehiculo,
        'Fecha': record.fecha,
        'Hora Ingreso': record.horaIngreso,
        'Espejo (Ingreso)': record.requisadoIngreso.espejo || '',
        'Bodega (Ingreso)': record.requisadoIngreso.bodega || '',
        'Interior (Ingreso)': record.requisadoIngreso.interior || '',
        'Guarda (Ingreso)': record.requisadoIngreso.guarda || '',
        'Hora Salida': record.horaSalida || '',
        'Espejo (Salida)': record.requisadoSalida?.espejo || '',
        'Bodega (Salida)': record.requisadoSalida?.bodega || '',
        'Interior (Salida)': record.requisadoSalida?.interior || '',
        'Guarda (Salida)': record.requisadoSalida?.guarda || '',
      }));

      // Crear libro de Excel
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Registros');

      // Generar archivo
      const wbout = XLSX.write(wb, {
        type: 'base64',
        bookType: 'xlsx',
      });

      // Guardar archivo
      const fileName = `Control_Vehicular_${format(selectedMonth, 'MMMM_yyyy', { locale: es })}.xlsx`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, wbout, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Compartir archivo
      await Sharing.shareAsync(fileUri);
      
      Alert.alert(
        'Éxito',
        'Archivo Excel generado y listo para compartir',
        [
          {
            text: 'OK',
            onPress: () => {
              // Opcional: Limpiar registros del mes exportado
              Alert.alert(
                'Limpiar registros',
                '¿Desea limpiar los registros exportados del almacenamiento local?',
                [
                  { text: 'No', style: 'cancel' },
                  { 
                    text: 'Sí', 
                    onPress: async () => {
                      const remainingRecords = records.filter(r => !filteredRecords.includes(r));
                      await AsyncStorage.setItem('vehicleRecords', JSON.stringify(remainingRecords));
                      setRecords(remainingRecords);
                      Alert.alert('Éxito', 'Registros limpiados correctamente');
                    }
                  },
                ]
              );
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error exportando a Excel:', error);
      Alert.alert('Error', 'No se pudo exportar el archivo Excel');
    } finally {
      setExporting(false);
    }
  };

  // Cambiar mes
  const changeMonth = (direction) => {
    const newMonth = new Date(selectedMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setSelectedMonth(newMonth);
  };

  // Componente de tarjeta de registro
  const RecordCard = ({ record }) => {
    const isComplete = record.horaSalida !== '';
    const hasIssues = 
      record.requisadoIngreso.espejo === 'no' ||
      record.requisadoIngreso.bodega === 'no' ||
      record.requisadoIngreso.interior === 'no' ||
      (record.horaSalida && (
        record.requisadoSalida?.espejo === 'no' ||
        record.requisadoSalida?.bodega === 'no' ||
        record.requisadoSalida?.interior === 'no'
      ));

    return (
      <View style={[styles.recordCard, hasIssues && styles.recordCardWarning]}>
        <View style={styles.recordHeader}>
          <View style={styles.recordInfo}>
            <Text style={styles.recordName}>{record.nombre}</Text>
            <Text style={styles.recordVehicle}>{record.vehiculo}</Text>
          </View>
          <View style={styles.recordStatus}>
            {isComplete ? (
              <View style={styles.statusBadgeComplete}>
                <Text style={styles.statusTextComplete}>Completo</Text>
              </View>
            ) : (
              <View style={styles.statusBadgePending}>
                <Text style={styles.statusTextPending}>Pendiente</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.recordDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fecha:</Text>
            <Text style={styles.detailValue}>{record.fecha}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Entrada:</Text>
            <Text style={styles.detailValue}>{record.horaIngreso}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Salida:</Text>
            <Text style={styles.detailValue}>{record.horaSalida || '---'}</Text>
          </View>
        </View>

        {hasIssues && (
          <View style={styles.issueIndicator}>
            <Ionicons name="alert-circle" size={16} color={colors.warning} />
            <Text style={styles.issueText}>Revisar inspección</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={globalStyles.container}>
      <Header
        title="Reportes"
        subtitle={format(selectedMonth, 'MMMM yyyy', { locale: es })}
        rightAction={{
          icon: 'download-outline',
          onPress: exportToExcel,
        }}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Selector de mes */}
        <View style={styles.monthSelector}>
          <TouchableOpacity
            style={styles.monthButton}
            onPress={() => changeMonth('prev')}
          >
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          
          <Text style={styles.monthText}>
            {format(selectedMonth, 'MMMM yyyy', { locale: es }).toUpperCase()}
          </Text>
          
          <TouchableOpacity
            style={styles.monthButton}
            onPress={() => changeMonth('next')}
          >
            <Ionicons name="chevron-forward" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Estadísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="enter-outline" size={24} color={colors.success} />
            <Text style={styles.statValue}>{stats.totalEntries}</Text>
            <Text style={styles.statLabel}>Entradas</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="exit-outline" size={24} color={colors.warning} />
            <Text style={styles.statValue}>{stats.totalExits}</Text>
            <Text style={styles.statLabel}>Salidas</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="alert-circle-outline" size={24} color={colors.error} />
            <Text style={styles.statValue}>{stats.pendingExits}</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
          
          <View style={styles.statCard}> // tener en cuenta para eliminar
            <Ionicons name="time-outline" size={24} color={colors.info} />
            <Text style={styles.statValue}>{stats.avgStayTime}</Text>
            <Text style={styles.statLabel}>Promedio</Text>
          </View>
        </View>

        {/* Botón de exportación */}
        <View style={styles.exportSection}>
          <CustomButton
            title={exporting ? 'Exportando...' : 'Exportar a Excel'}
            variant="primary"
            size="large"
            fullWidth
            loading={exporting}
            disabled={filteredRecords.length === 0}
            onPress={exportToExcel}
            icon={!exporting && <Ionicons name="download-outline" size={24} color={colors.textLight} style={{ marginRight: 8 }} />}
          />
          <Text style={styles.exportInfo}>
            {filteredRecords.length} registros para exportar
          </Text>
        </View>

        {/* Lista de registros */}
        <View style={styles.recordsSection}>
          <Text style={styles.sectionTitle}>Registros del mes</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
          ) : filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <RecordCard key={record.id} record={record} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>
                No hay registros para este mes
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 150 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  monthButton: {
    padding: 8,
  },
  monthText: {
    ...typography.h6,
    color: colors.text,
    fontWeight: '600',
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
  statValue: {
    ...typography.h4,
    color: colors.text,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  exportSection: {
    padding: 16,
  },
  exportInfo: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  recordsSection: {
    padding: 16,
  },
  sectionTitle: {
    ...typography.h6,
    color: colors.text,
    marginBottom: 12,
    fontWeight: '600',
  },
  recordCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recordCardWarning: {
    borderColor: colors.warning,
    borderWidth: 2,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordInfo: {
    flex: 1,
  },
  recordName: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '600',
  },
  recordVehicle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  recordStatus: {
    marginLeft: 12,
  },
  statusBadgeComplete: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgePending: {
    backgroundColor: colors.warning + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusTextComplete: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  statusTextPending: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '600',
  },
  recordDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailRow: {
    flex: 1,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  detailValue: {
    ...typography.body2,
    color: colors.text,
    fontWeight: '500',
    marginTop: 2,
  },
  issueIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  issueText: {
    ...typography.caption,
    color: colors.warning,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    ...typography.body1,
    color: colors.textSecondary,
    marginTop: 12,
  },
  loader: {
    marginVertical: 48,
  },
});

export default ReportsScreen;