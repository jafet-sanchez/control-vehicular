// src/screens/PeopleScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/common/Header';
import SearchBar from '../components/common/SearchBar';
import CustomButton from '../components/common/CustomButton';
import { colors, typography, globalStyles } from '../styles';

const PeopleScreen = ({ navigation }) => {
  const [people, setPeople] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [personForm, setPersonForm] = useState({
    name: '',
    vehicles: [''],
  });

  // Cargar personas al iniciar
  useEffect(() => {
    loadPeople();
  }, []);

  // Cargar personas desde AsyncStorage
  const loadPeople = async () => {
    try {
      const storedPeople = await AsyncStorage.getItem('people');
      if (storedPeople) {
        setPeople(JSON.parse(storedPeople));
      } else {
        // Datos de ejemplo inicial
        const initialPeople = [
          { id: 1, name: 'Juan Pérez', vehicles: ['ABC123', 'XYZ789'], active: true },
          { id: 2, name: 'María García', vehicles: ['DEF456'], active: true },
          { id: 3, name: 'Carlos López', vehicles: ['GHI789', 'JKL012'], active: true },
        ];
        setPeople(initialPeople);
        await AsyncStorage.setItem('people', JSON.stringify(initialPeople));
      }
    } catch (error) {
      console.error('Error cargando personas:', error);
    }
  };

  // Guardar personas en AsyncStorage
  const savePeople = async (updatedPeople) => {
    try {
      await AsyncStorage.setItem('people', JSON.stringify(updatedPeople));
      setPeople(updatedPeople);
    } catch (error) {
      console.error('Error guardando personas:', error);
    }
  };

  // Filtrar personas por búsqueda
  const filteredPeople = people.filter(person =>
    person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.vehicles.some(v => v.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Abrir modal para agregar/editar
  const openModal = (person = null) => {
    if (person) {
      setEditMode(true);
      setSelectedPerson(person);
      setPersonForm({
        name: person.name,
        vehicles: [...person.vehicles],
      });
    } else {
      setEditMode(false);
      setSelectedPerson(null);
      setPersonForm({
        name: '',
        vehicles: [''],
      });
    }
    setModalVisible(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setModalVisible(false);
    setEditMode(false);
    setSelectedPerson(null);
    setPersonForm({
      name: '',
      vehicles: [''],
    });
  };

  // Agregar campo de vehículo
  const addVehicleField = () => {
    setPersonForm({
      ...personForm,
      vehicles: [...personForm.vehicles, ''],
    });
  };

  // Eliminar campo de vehículo
  const removeVehicleField = (index) => {
    const newVehicles = personForm.vehicles.filter((_, i) => i !== index);
    setPersonForm({
      ...personForm,
      vehicles: newVehicles.length > 0 ? newVehicles : [''],
    });
  };

  // Actualizar vehículo
  const updateVehicle = (index, value) => {
    const newVehicles = [...personForm.vehicles];
    newVehicles[index] = value.toUpperCase();
    setPersonForm({
      ...personForm,
      vehicles: newVehicles,
    });
  };

  // Guardar persona
  const savePerson = () => {
    // Validaciones
    if (!personForm.name.trim()) {
      Alert.alert('Error', 'Por favor ingrese el nombre de la persona');
      return;
    }

    const validVehicles = personForm.vehicles.filter(v => v.trim());
    if (validVehicles.length === 0) {
      Alert.alert('Error', 'Por favor ingrese al menos un vehículo');
      return;
    }

    let updatedPeople;
    if (editMode) {
      // Editar persona existente
      updatedPeople = people.map(p =>
        p.id === selectedPerson.id
          ? { ...p, name: personForm.name, vehicles: validVehicles }
          : p
      );
    } else {
      // Agregar nueva persona
      const newPerson = {
        id: Date.now(),
        name: personForm.name,
        vehicles: validVehicles,
        active: true,
      };
      updatedPeople = [...people, newPerson];
    }

    savePeople(updatedPeople);
    closeModal();
    Alert.alert('Éxito', `Persona ${editMode ? 'actualizada' : 'agregada'} correctamente`);
  };

  // Eliminar persona
  const deletePerson = (person) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Está seguro de eliminar a ${person.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            const updatedPeople = people.filter(p => p.id !== person.id);
            savePeople(updatedPeople);
            Alert.alert('Éxito', 'Persona eliminada correctamente');
          },
        },
      ]
    );
  };

  // Componente de tarjeta de persona
  const PersonCard = ({ person }) => (
    <View style={styles.personCard}>
      <View style={styles.personHeader}>
        <View style={styles.personAvatar}>
          <Text style={styles.avatarText}>
            {person.name.split(' ').map(n => n[0]).join('')}
          </Text>
        </View>
        <View style={styles.personInfo}>
          <Text style={styles.personName}>{person.name}</Text>
          <Text style={styles.vehicleCount}>
            {person.vehicles.length} {person.vehicles.length === 1 ? 'vehículo' : 'vehículos'}
          </Text>
        </View>
        <View style={styles.personActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openModal(person)}
          >
            <Ionicons name="pencil" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => deletePerson(person)}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.vehiclesList}>
        {person.vehicles.map((vehicle, index) => (
          <View key={index} style={styles.vehicleBadge}>
            <Ionicons name="car-outline" size={16} color={colors.primary} />
            <Text style={styles.vehicleText}>{vehicle}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={globalStyles.container}>
      <Header
        title="Gestión de Personas"
        subtitle={`${people.length} personas registradas`}
        rightAction={{
          icon: 'add-circle-outline',
          onPress: () => openModal(),
        }}
      />

      <View style={styles.content}>
        <SearchBar
          placeholder="Buscar por nombre o vehículo..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <FlatList
          data={filteredPeople}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <PersonCard person={item} />}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>
                {searchQuery ? 'No se encontraron resultados' : 'No hay personas registradas'}
              </Text>
            </View>
          }
        />
      </View>

      {/* Modal para agregar/editar persona */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editMode ? 'Editar Persona' : 'Nueva Persona'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.inputLabel}>Nombre completo</Text>
              <TextInput
                style={globalStyles.input}
                value={personForm.name}
                onChangeText={(text) => setPersonForm({ ...personForm, name: text })}
                placeholder="Ingrese el nombre"
              />

              <View style={styles.vehiclesSection}>
                <Text style={styles.inputLabel}>Vehículos</Text>
                {personForm.vehicles.map((vehicle, index) => (
                  <View key={index} style={styles.vehicleInput}>
                    <TextInput
                      style={[globalStyles.input, styles.vehicleField]}
                      value={vehicle}
                      onChangeText={(text) => updateVehicle(index, text)}
                      placeholder="Placa del vehículo"
                      autoCapitalize="characters"
                    />
                    {personForm.vehicles.length > 1 && (
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeVehicleField(index)}
                      >
                        <Ionicons name="remove-circle" size={24} color={colors.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                
                <TouchableOpacity
                  style={styles.addVehicleButton}
                  onPress={addVehicleField}
                >
                  <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                  <Text style={styles.addVehicleText}>Agregar vehículo</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <CustomButton
                title="Cancelar"
                variant="outline"
                onPress={closeModal}
              />
              <CustomButton
                title={editMode ? 'Guardar' : 'Agregar'}
                variant="primary"
                onPress={savePerson}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
  },
  listContainer: {
    paddingBottom: 100,
  },
  personCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  personHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  personAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    ...typography.h6,
    color: colors.primary,
    fontWeight: 'bold',
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '600',
  },
  vehicleCount: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  personActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  vehiclesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  vehicleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  vehicleText: {
    ...typography.caption,
    color: colors.text,
    marginLeft: 6,
    fontWeight: '500',
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
  // Estilos del Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.h6,
    color: colors.text,
    fontWeight: '600',
  },
  modalBody: {
    padding: 16,
    maxHeight: 400,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  inputLabel: {
    ...typography.body2,
    color: colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  vehiclesSection: {
    marginTop: 16,
  },
  vehicleInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vehicleField: {
    flex: 1,
  },
  removeButton: {
    marginLeft: 12,
  },
  addVehicleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  addVehicleText: {
    ...typography.body2,
    color: colors.primary,
    marginLeft: 8,
  },
});

export default PeopleScreen;