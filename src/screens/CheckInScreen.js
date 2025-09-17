// src/screens/CheckInScreen.js
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

const CheckInScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [entryTime, setEntryTime] = useState(format(new Date(), 'HH:mm'));
  const [inspectionData, setInspectionData] = useState({});
  const [showPersonList, setShowPersonList] = useState(false);
  const [isAddingNewPerson, setIsAddingNewPerson] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [newVehicle, setNewVehicle] = useState('');

  // Datos de ejemplo - después vendrán de AsyncStorage
  const [people, setPeople] = useState([
    { id: 1, name: 'Juan Pérez', vehicles: ['ABC123', 'XYZ789'] },
    { id: 2, name: 'María García', vehicles: ['DEF456'] },
    { id: 3, name: 'Carlos López', vehicles: ['GHI789', 'JKL012'] },
  ]);

  const [guardSuggestions] = useState([
    'Carlos Mendoza',
    'María García',
    'José Rodríguez',
    'Ana Martínez',
  ]);

  const filteredPeople = people.filter(person =>
    person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.vehicles.some(v => v.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handlePersonSelect = (person) => {
    setSelectedPerson(person);
    setSelectedVehicle(person.vehicles[0] || '');
    setShowPersonList(false);
    setSearchQuery(person.name);
  };

  const handleAddNewPerson = () => {
    if (!newPersonName.trim() || !newVehicle.trim()) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return;
    }

    const newPerson = {
      id: Date.now(),
      name: newPersonName,
      vehicles: [newVehicle],
    };

    setPeople([...people, newPerson]);
    handlePersonSelect(newPerson);
    setIsAddingNewPerson(false);
    setNewPersonName('');
    setNewVehicle('');
  };

  const handleAddVehicle = () => {
    Alert.prompt(
      'Agregar Vehículo',
      'Ingrese la placa del nuevo vehículo',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Agregar',
          onPress: (vehicle) => {
            if (vehicle && selectedPerson) {
              const updatedPerson = {
                ...selectedPerson,
                vehicles: [...selectedPerson.vehicles, vehicle],
              };
              setPeople(people.map(p => 
                p.id === selectedPerson.id ? updatedPerson : p
              ));
              setSelectedPerson(updatedPerson);
              setSelectedVehicle(vehicle);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleSubmit = () => {
    // Validaciones
    if (!selectedPerson) {
      Alert.alert('Error', 'Por favor seleccione una persona');
      return;
    }

    if (!selectedVehicle) {
      Alert.alert('Error', 'Por favor seleccione un vehículo');
      return;
    }

    if (!inspectionData.espejo || !inspectionData.bodega || 
        !inspectionData.interior || !inspectionData.guarda) {
      Alert.alert('Error', 'Por favor complete toda la inspección');
      return;
    }

    // Aquí guardaremos en AsyncStorage/Excel
    const record = {
      id: Date.now(),
      nombre: selectedPerson.name,
      vehiculo: selectedVehicle,
      fecha: format(new Date(), 'dd/MM/yyyy'),
      horaIngreso: entryTime,
      requisadoIngreso: inspectionData,
      // Los campos de salida quedan vacíos
      horaSalida: '',
      requisadoSalida: {
        espejo: null,
        bodega: null,
        interior: null,
        guarda: '',
      },
    };

    console.log('Registro a guardar:', record);
    Alert.alert(
      'Éxito',
      'Entrada registrada correctamente',
      [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={globalStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header
        title="Registrar Entrada"
        subtitle={format(new Date(), 'dd/MM/yyyy')}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Selección de Persona */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Persona</Text>
          
          <SearchBar
            placeholder="Buscar persona o vehículo..."
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setShowPersonList(text.length > 0);
              if (!text) setSelectedPerson(null);
            }}
          />

          {showPersonList && (
            <View style={styles.personList}>
              {filteredPeople.map((person) => (
                <TouchableOpacity
                  key={person.id}
                  style={styles.personItem}
                  onPress={() => handlePersonSelect(person)}
                >
                  <View style={styles.personInfo}>
                    <Text style={styles.personName}>{person.name}</Text>
                    <Text style={styles.personVehicles}>
                      {person.vehicles.join(', ')}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity
                style={[styles.personItem, styles.addNewButton]}
                onPress={() => setIsAddingNewPerson(true)}
              >
                <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                <Text style={styles.addNewText}>Agregar nueva persona</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Formulario para nueva persona */}
        {isAddingNewPerson && (
          <View style={styles.newPersonForm}>
            <Text style={styles.formTitle}>Nueva Persona</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="Nombre completo"
              value={newPersonName}
              onChangeText={setNewPersonName}
            />
            <TextInput
              style={[globalStyles.input, { marginTop: 12 }]}
              placeholder="Placa del vehículo"
              value={newVehicle}
              onChangeText={setNewVehicle}
              autoCapitalize="characters"
            />
            <View style={styles.formButtons}>
              <CustomButton
                title="Cancelar"
                variant="outline"
                onPress={() => {
                  setIsAddingNewPerson(false);
                  setNewPersonName('');
                  setNewVehicle('');
                }}
              />
              <CustomButton
                title="Agregar"
                variant="primary"
                onPress={handleAddNewPerson}
              />
            </View>
          </View>
        )}

        {/* Selección de Vehículo */}
        {selectedPerson && !isAddingNewPerson && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vehículo</Text>
            <View style={styles.vehicleSelection}>
              {selectedPerson.vehicles.map((vehicle) => (
                <TouchableOpacity
                  key={vehicle}
                  style={[
                    styles.vehicleOption,
                    selectedVehicle === vehicle && styles.vehicleOptionSelected,
                  ]}
                  onPress={() => setSelectedVehicle(vehicle)}
                >
                  <Ionicons 
                    name="car" 
                    size={20} 
                    color={selectedVehicle === vehicle ? colors.primary : colors.textSecondary}
                  />
                  <Text style={[
                    styles.vehicleText,
                    selectedVehicle === vehicle && styles.vehicleTextSelected,
                  ]}>
                    {vehicle}
                  </Text>
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity
                style={styles.addVehicleButton}
                onPress={handleAddVehicle}
              >
                <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                <Text style={styles.addVehicleText}>Agregar vehículo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Hora de Entrada */}
        {selectedPerson && selectedVehicle && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hora de Entrada</Text>
            <View style={styles.timeInput}>
              <Ionicons name="time-outline" size={24} color={colors.primary} />
              <TextInput
                style={styles.timeInputField}
                value={entryTime}
                onChangeText={setEntryTime}
                placeholder="HH:MM"
                maxLength={5}
              />
              <TouchableOpacity
                onPress={() => setEntryTime(format(new Date(), 'HH:mm'))}
                style={styles.currentTimeButton}
              >
                <Text style={styles.currentTimeText}>Hora actual</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Formulario de Inspección */}
        {selectedPerson && selectedVehicle && (
          <View style={styles.section}>
            <InspectionForm
              type="ingreso"
              onChange={setInspectionData}
              guardSuggestions={guardSuggestions}
            />
          </View>
        )}

        {/* Botón de Guardar */}
        {selectedPerson && selectedVehicle && (
          <View style={styles.submitSection}>
            <CustomButton
              title="Registrar Entrada"
              variant="success"
              size="large"
              fullWidth
              onPress={handleSubmit}
              icon={<Ionicons name="checkmark-circle" size={24} color={colors.textLight} style={{ marginRight: 8 }} />}
            />
          </View>
        )}

        <View style={{ height: 150 }} />
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
  personList: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginTop: -8,
    overflow: 'hidden',
  },
  personItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '500',
  },
  personVehicles: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addNewButton: {
    backgroundColor: colors.primary + '10',
  },
  addNewText: {
    ...typography.body1,
    color: colors.primary,
    marginLeft: 12,
  },
  newPersonForm: {
    backgroundColor: colors.surface,
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  formTitle: {
    ...typography.h6,
    color: colors.text,
    marginBottom: 16,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  vehicleSelection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vehicleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  vehicleOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
    borderWidth: 2,
  },
  vehicleText: {
    ...typography.body1,
    color: colors.text,
    marginLeft: 8,
  },
  vehicleTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  addVehicleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  addVehicleText: {
    ...typography.body2,
    color: colors.primary,
    marginLeft: 8,
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
    paddingBottom: 8,
  },
});

export default CheckInScreen;