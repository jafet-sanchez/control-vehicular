// src/screens/CheckOutScreen.js
import React, { useState, useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import Header from '../components/common/Header';
import SearchBar from '../components/common/SearchBar';
import CustomButton from '../components/common/CustomButton';
import InspectionForm from '../components/forms/InspectionForm';
import { colors, typography, globalStyles } from '../styles';

const CheckOutScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [exitTime, setExitTime] = useState(format(new Date(), 'HH:mm'));
  const [inspectionData, setInspectionData] = useState({});
  
  // Datos de ejemplo - Vehículos actualmente dentro
  const [vehiclesInside, setVehiclesInside] = useState([
    {
      id: 1,
      nombre: 'Juan Pérez',
      vehiculo: 'ABC123',
      horaIngreso: '08:30',
      fecha: format(new Date(), 'dd/MM/yyyy'),
      requisadoIngreso: {
        espejo: 'si',
        bodega: 'no',
        interior: 'si',
        guarda: 'Carlos Mendoza',
      },
    },
    {
      id: 2,
      nombre: 'María García',
      vehiculo: 'XYZ789',
      horaIngreso: '09:15',
      fecha: format(new Date(), 'dd/MM/yyyy'),
      requisadoIngreso: {
        espejo: 'si',
        bodega: 'si',
        interior: 'si',
        guarda: 'Ana Martínez',
      },
    },
    {
      id: 3,
      nombre: 'Carlos López',
      vehiculo: 'DEF456',
      horaIngreso: '10:00',
      fecha: format(new Date(), 'dd/MM/yyyy'),
      requisadoIngreso: {
        espejo: 'si',
        bodega: 'si',
        interior: 'no',
        guarda: 'José Rodríguez',
      },
    },
  ]);

  const [guardSuggestions] = useState([
    'Carlos Mendoza',
    'María García',
    'José Rodríguez',
    'Ana Martínez',
  ]);

  const filteredVehicles = vehiclesInside.filter(record =>
    record.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.vehiculo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRecordSelect = (record) => {
    setSelectedRecord(record);
    setSearchQuery('');
  };

  const calculateStayDuration = (entryTime) => {
    const [entryHour, entryMinute] = entryTime.split(':').map(Number);
    const [exitHour, exitMinute] = exitTime.split(':').map(Number);
    
    const totalMinutesEntry = entryHour * 60 + entryMinute;
    const totalMinutesExit = exitHour * 60 + exitMinute;
    
    const diffMinutes = totalMinutesExit - totalMinutesEntry;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (diffMinutes < 0) {
      return 'Hora de salida inválida';
    }
    
    return `${hours}h ${minutes}min`;
  };

  const handleSubmit = () => {
    // Validaciones
    if (!selectedRecord) {
      Alert.alert('Error', 'Por favor seleccione un vehículo');
      return;
    }

    if (!inspectionData.espejo || !inspectionData.bodega || 
        !inspectionData.interior || !inspectionData.guarda) {
      Alert.alert('Error', 'Por favor complete toda la inspección de salida');
      return;
    }

    // Validar que la hora de salida sea mayor que la de entrada
    const [entryHour, entryMinute] = selectedRecord.horaIngreso.split(':').map(Number);
    const [exitHour, exitMinute] = exitTime.split(':').map(Number);
    
    if (exitHour < entryHour || (exitHour === entryHour && exitMinute < entryMinute)) {
      Alert.alert('Error', 'La hora de salida debe ser posterior a la hora de entrada');
      return;
    }

    // Aquí actualizaremos el registro en AsyncStorage/Excel
    const updatedRecord = {
      ...selectedRecord,
      horaSalida: exitTime,
      requisadoSalida: inspectionData,
    };

    console.log('Registro actualizado:', updatedRecord);
    
    Alert.alert(
      'Éxito',
      `Salida registrada correctamente\nTiempo de estadía: ${calculateStayDuration(selectedRecord.horaIngreso)}`,
      [
        { 
          text: 'OK', 
          onPress: () => {
            // Eliminar de la lista de vehículos dentro
            setVehiclesInside(vehiclesInside.filter(v => v.id !== selectedRecord.id));
            navigation.goBack();
          }
        }
      ]
    );
  };

  const VehicleCard = ({ record, onPress }) => {
    const hasIssues = record.requisadoIngreso.espejo === 'no' || 
                      record.requisadoIngreso.bodega === 'no' || 
                      record.requisadoIngreso.interior === 'no';
    
    return (
      <TouchableOpacity 
        style={[styles.vehicleCard, hasIssues && styles.vehicleCardWarning]}
        onPress={onPress}
      >
        <View style={styles.vehicleCardHeader}>
          <View style={styles.vehicleIcon}>
            <Ionicons name="car" size={24} color={colors.primary} />
          </View>
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehiclePlate}>{record.vehiculo}</Text>
            <Text style={styles.vehicleOwner}>{record.nombre}</Text>
          </View>
          <View style={styles.timeInfo}>
            <Text style={styles.entryTime}>{record.horaIngreso}</Text>
            <Text style={styles.stayDuration}>
              {calculateStayDuration(record.horaIngreso)}
            </Text>
          </View>
        </View>
        
        {hasIssues && (
          <View style={styles.issueIndicator}>
            <Ionicons name="alert-circle" size={16} color={colors.warning} />
            <Text style={styles.issueText}>Revisar inspección de entrada</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={globalStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header
        title="Registrar Salida"
        subtitle={`${vehiclesInside.length} vehículos dentro`}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Búsqueda de Vehículos */}
        {!selectedRecord && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seleccionar Vehículo</Text>
            
            <SearchBar
              placeholder="Buscar por nombre o placa..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            <View style={styles.vehiclesList}>
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((record) => (
                  <VehicleCard
                    key={record.id}
                    record={record}
                    onPress={() => handleRecordSelect(record)}
                  />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="car-outline" size={48} color={colors.textSecondary} />
                  <Text style={styles.emptyText}>
                    {searchQuery ? 'No se encontraron vehículos' : 'No hay vehículos dentro'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Información del Vehículo Seleccionado */}
        {selectedRecord && (
          <>
            <View style={styles.selectedVehicle}>
              <View style={styles.selectedHeader}>
                <Text style={styles.selectedTitle}>Vehículo Seleccionado</Text>
                <TouchableOpacity onPress={() => setSelectedRecord(null)}>
                  <Text style={styles.changeText}>Cambiar</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.selectedInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Persona:</Text>
                  <Text style={styles.infoValue}>{selectedRecord.nombre}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Vehículo:</Text>
                  <Text style={styles.infoValue}>{selectedRecord.vehiculo}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Hora entrada:</Text>
                  <Text style={styles.infoValue}>{selectedRecord.horaIngreso}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Tiempo dentro:</Text>
                  <Text style={[styles.infoValue, styles.duration]}>
                    {calculateStayDuration(selectedRecord.horaIngreso)}
                  </Text>
                </View>
              </View>

              {/* Mostrar inspección de entrada */}
              <View style={styles.entryInspection}>
                <Text style={styles.inspectionTitle}>Inspección de Entrada</Text>
                <View style={styles.inspectionSummary}>
                  <View style={styles.inspectionItem}>
                    <Text style={styles.inspectionLabel}>Espejo:</Text>
                    <View style={[
                      styles.inspectionBadge,
                      selectedRecord.requisadoIngreso.espejo === 'si' 
                        ? styles.badgeYes 
                        : styles.badgeNo
                    ]}>
                      <Text style={styles.badgeText}>
                        {selectedRecord.requisadoIngreso.espejo.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.inspectionItem}>
                    <Text style={styles.inspectionLabel}>Bodega:</Text>
                    <View style={[
                      styles.inspectionBadge,
                      selectedRecord.requisadoIngreso.bodega === 'si' 
                        ? styles.badgeYes 
                        : styles.badgeNo
                    ]}>
                      <Text style={styles.badgeText}>
                        {selectedRecord.requisadoIngreso.bodega.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.inspectionItem}>
                    <Text style={styles.inspectionLabel}>Interior:</Text>
                    <View style={[
                      styles.inspectionBadge,
                      selectedRecord.requisadoIngreso.interior === 'si' 
                        ? styles.badgeYes 
                        : styles.badgeNo
                    ]}>
                      <Text style={styles.badgeText}>
                        {selectedRecord.requisadoIngreso.interior.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.inspectionItem}>
                    <Text style={styles.inspectionLabel}>Guarda:</Text>
                    <Text style={styles.guardName}>
                      {selectedRecord.requisadoIngreso.guarda}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Hora de Salida */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Hora de Salida</Text>
              <View style={styles.timeInput}>
                <Ionicons name="time-outline" size={24} color={colors.primary} />
                <TextInput
                  style={styles.timeInputField}
                  value={exitTime}
                  onChangeText={setExitTime}
                  placeholder="HH:MM"
                  maxLength={5}
                />
                <TouchableOpacity
                  onPress={() => setExitTime(format(new Date(), 'HH:mm'))}
                  style={styles.currentTimeButton}
                >
                  <Text style={styles.currentTimeText}>Hora actual</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Formulario de Inspección de Salida */}
            <View style={styles.section}>
              <InspectionForm
                type="salida"
                onChange={setInspectionData}
                guardSuggestions={guardSuggestions}
              />
            </View>

            {/* Botón de Guardar */}
            <View style={styles.submitSection}>
              <CustomButton
                title="Registrar Salida"
                variant="warning"
                size="large"
                fullWidth
                onPress={handleSubmit}
                icon={<Ionicons name="exit-outline" size={24} color={colors.textLight} style={{ marginRight: 8 }} />}
              />
            </View>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    ...typography.h6,
    color: colors.text,
    marginBottom: 12,
  },
  vehiclesList: {
    marginTop: 8,
  },
  vehicleCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  vehicleCardWarning: {
    borderColor: colors.warning,
    borderWidth: 2,
  },
  vehicleCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehiclePlate: {
    ...typography.h6,
    color: colors.text,
    fontWeight: 'bold',
  },
  vehicleOwner: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: 2,
  },
  timeInfo: {
    alignItems: 'flex-end',
  },
  entryTime: {
    ...typography.h6,
    color: colors.text,
  },
  stayDuration: {
    ...typography.caption,
    color: colors.primary,
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
  selectedVehicle: {
    backgroundColor: colors.surface,
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedTitle: {
    ...typography.h6,
    color: colors.text,
  },
  changeText: {
    ...typography.body2,
    color: colors.primary,
  },
  selectedInfo: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.body2,
    color: colors.text,
    fontWeight: '500',
  },
  duration: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  entryInspection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inspectionTitle: {
    ...typography.subtitle1,
    color: colors.text,
    marginBottom: 12,
  },
  inspectionSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  inspectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 8,
  },
  inspectionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginRight: 8,
  },
  inspectionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeYes: {
    backgroundColor: colors.success + '20',
  },
  badgeNo: {
    backgroundColor: colors.warning + '20',
  },
  badgeText: {
    ...typography.caption,
    fontWeight: 'bold',
  },
  guardName: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '500',
  },
  timeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeInputField: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 12,
  },
  currentTimeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.primary + '20',
    borderRadius: 6,
  },
  currentTimeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  submitSection: {
    padding: 16,
  },
});

export default CheckOutScreen;