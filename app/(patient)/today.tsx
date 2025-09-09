import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { AuthContext } from '@/contexts/AuthContext';
import { Calendar, Clock, FileText, AlertTriangle, Plus, X, Pill } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

const router = useRouter();
const handleSOSPress = () => {
  router.push('/(patient)/sos');
};

interface Appointment {
  id: string;
  doctorName: string;
  appointmentDate: string;
  time: string;
  status: string;
}

interface Prescription {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  medicines: string[];
  instructions: string;
  status: string;
}

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  disease: string;
}

// Hardcoded scheduled appointment
const hardcodedAppointment: Appointment = {
  id: 'hardcoded-1',
  doctorName: 'Dr. Amit Singh',
  appointmentDate: new Date().toISOString().split('T')[0] + ' 11:00',
  time: '11:00 AM',
  status: 'scheduled'
};

// Dummy prescriptions data
const dummyPrescriptions: Prescription[] = [
  {
    id: '1',
    doctorName: 'Dr. Priya Sharma',
    doctorSpecialty: 'Cardiologist',
    date: '2025-08-15',
    medicines: ['Telma 40mg - Take once daily on empty stomach', 'Glycomet 500mg - Take twice daily with meals'],
    instructions: 'Take medications with food. Monitor blood pressure daily. Follow up in 2 weeks.',
    status: 'active'
  },
  {
    id: '2',
    doctorName: 'Dr. Rajesh Gupta',
    doctorSpecialty: 'Cardiologist',
    date: '2025-07-20',
    medicines: ['Losar 50mg - Take once daily', 'Ecosprin 75mg - Take after dinner'],
    instructions: 'Continue current medication. Reduce salt intake. Avoid oily and spicy foods.',
    status: 'completed'
  },
  {
    id: '3',
    doctorName: 'Dr. Sunita Patel',
    doctorSpecialty: 'Cardiologist',
    date: '2025-06-10',
    medicines: ['Atorva 20mg - Take at bedtime'],
    instructions: 'Can be taken with or without food. Get cholesterol test done monthly.',
    status: 'active'
  },
  {
    id: '4',
    doctorName: 'Dr. Amit Singh',
    doctorSpecialty: 'Oncologist',
    date: '2025-08-25',
    medicines: ['Nolvadex 20mg - Take daily at same time', 'Ondansetron 8mg - Take when nauseous'],
    instructions: 'Take Nolvadx at the same time daily. Use Ondansetron only when experiencing nausea.',
    status: 'active'
  },
  {
    id: '5',
    doctorName: 'Dr. Kavita Joshi',
    doctorSpecialty: 'Oncologist',
    date: '2025-07-30',
    medicines: ['Perinorm 10mg - Take before meals'],
    instructions: 'Take 30 minutes before meals. Contact immediately if severe side effects occur.',
    status: 'completed'
  },
  {
    id: '6',
    doctorName: 'Dr. Manoj Kumar',
    doctorSpecialty: 'Neurologist',
    date: '2025-08-20',
    medicines: ['Gabapin 300mg - Take three times daily', 'Neurobion Forte - Take once daily'],
    instructions: 'Gradually increase dosage as tolerated. Take with food to avoid stomach upset.',
    status: 'active'
  },
  {
    id: '7',
    doctorName: 'Dr. Deepika Agarwal',
    doctorSpecialty: 'Dermatologist',
    date: '2025-08-10',
    medicines: ['Tretinoin 0.025% - Apply at night', 'Sunscreen SPF 30 - Apply daily'],
    instructions: 'Apply Tretinoin sparingly. Always use sunscreen during the day.',
    status: 'active'
  }
];

export default function TodayScreen() {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [todaysMedicines, setTodaysMedicines] = useState<Medicine[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  
  // Modal states
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  
  // Form states for appointment
  const [appointmentForm, setAppointmentForm] = useState({
    doctorName: '',
    date: '',
    time: '',
  });
  
  // Form states for medicine
  const [medicineForm, setMedicineForm] = useState({
    name: '',
    dosage: '',
    frequency: '',
    disease: '',
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
      case 'confirmed':
        return '#059669'; // Green
      case 'to be confirmed':
      case 'pending':
        return '#F59E0B'; // Orange
      case 'completed':
        return '#6B7280'; // Gray
      case 'cancelled':
        return '#DC2626'; // Red
      default:
        return '#6B7280';
    }
  };

  const fetchAppointments = async () => {
    if (!user) {
      // If no user, just use hardcoded appointment
      setAppointments([hardcodedAppointment]);
      setLoadingAppointments(false);
      return;
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          users!appointments_patient_id_fkey(name)
        `)
        .eq('patient_id', user.id)
        .order('appointment_date', { ascending: false })
        .limit(10)
        .eq('status', 'scheduled');

      if (error) {
        console.error('Error fetching appointments:', error);
        // Fallback to hardcoded appointment on error
        setAppointments([hardcodedAppointment]);
      } else if (data) {
        const mappedAppointments: Appointment[] = data.map((apt: any) => ({
          id: apt.id,
          doctorName: apt.users?.name || 'Unknown Doctor',
          appointmentDate: apt.appointment_date,
          time: new Date(apt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: apt.status,
        }));
        
        // Add hardcoded appointment to the list
        const allAppointments = [hardcodedAppointment, ...mappedAppointments];
        setAppointments(allAppointments);
      }
    } catch (error) {
      console.error('Unexpected error fetching appointments:', error);
      // Fallback to hardcoded appointment on error
      setAppointments([hardcodedAppointment]);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const loadTodaysMedicines = () => {
    // Extract medicines from active prescriptions
    const activeMedicines: Medicine[] = [];
    
    dummyPrescriptions
      .filter(prescription => prescription.status === 'active')
      .forEach(prescription => {
        prescription.medicines.forEach((medicine, index) => {
          const [name, instruction] = medicine.split(' - ');
          activeMedicines.push({
            id: `${prescription.id}-${index}`,
            name: name.trim(),
            dosage: name.split(' ')[1] || '',
            frequency: instruction || '',
            disease: prescription.doctorSpecialty || 'General',
          });
        });
      });
    
    setTodaysMedicines(activeMedicines);
  };

  const handleAddAppointment = () => {
    if (!appointmentForm.doctorName || !appointmentForm.date || !appointmentForm.time) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newAppointment: Appointment = {
      id: Date.now().toString(),
      doctorName: appointmentForm.doctorName,
      appointmentDate: `${appointmentForm.date} ${appointmentForm.time}`,
      time: appointmentForm.time,
      status: 'to be confirmed',
    };

    setAppointments(prev => [newAppointment, ...prev]);
    setAppointmentForm({ doctorName: '', date: '', time: '' });
    setShowAppointmentModal(false);
    Alert.alert('Success', 'Appointment request submitted successfully!');
  };

  const handleAddMedicine = () => {
    if (!medicineForm.name || !medicineForm.dosage || !medicineForm.frequency || !medicineForm.disease) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newMedicine: Medicine = {
      id: Date.now().toString(),
      name: medicineForm.name,
      dosage: medicineForm.dosage,
      frequency: medicineForm.frequency,
      disease: medicineForm.disease,
    };

    setTodaysMedicines(prev => [...prev, newMedicine]);
    setMedicineForm({ name: '', dosage: '', frequency: '', disease: '' });
    setShowMedicineModal(false);
    Alert.alert('Success', 'Medicine added successfully!');
  };

  useEffect(() => {
    fetchAppointments();
    loadTodaysMedicines();
  }, [user]);

  if (loadingAppointments) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#059669" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Today</Text>
          <Text style={styles.headerSubtitle}>{new Date().toLocaleDateString()}</Text>
        </View>
        <TouchableOpacity style={styles.sosButton} onPress={handleSOSPress}>
          <AlertTriangle color="#FFFFFF" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Appointments Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Appointments</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAppointmentModal(true)}
            >
              <Plus color="#059669" size={20} />
            </TouchableOpacity>
          </View>
          {appointments.length > 0 ? (
            appointments.map((appointment) => (
              <View key={appointment.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Calendar color="#2563EB" size={20} />
                  <Text style={styles.cardTitle}>{appointment.doctorName}</Text>
                </View>
                <Text style={styles.cardText}>Time: {appointment.time}</Text>
                <View style={styles.statusContainer}>
                  <Text style={styles.cardText}>Status: </Text>
                  <Text style={[
                    styles.statusText, 
                    { color: getStatusColor(appointment.status) }
                  ]}>
                    {appointment.status}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No appointments scheduled for today.</Text>
          )}
        </View>

        {/* Today's Medicine Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Medicine</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowMedicineModal(true)}
            >
              <Plus color="#059669" size={20} />
            </TouchableOpacity>
          </View>
          {todaysMedicines.length > 0 ? (
            todaysMedicines.map((medicine) => (
              <View key={medicine.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Pill color="#8B5CF6" size={20} />
                  <Text style={styles.cardTitle}>{medicine.name}</Text>
                </View>
                <Text style={styles.cardText}>Dosage: {medicine.dosage}</Text>
                <Text style={styles.cardText}>Frequency: {medicine.frequency}</Text>
                <Text style={styles.cardText}>For: {medicine.disease}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No medicines scheduled for today.</Text>
          )}
        </View>
      </ScrollView>

      {/* Appointment Modal */}
      <Modal
        visible={showAppointmentModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAppointmentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Appointment</Text>
              <TouchableOpacity onPress={() => setShowAppointmentModal(false)}>
                <X color="#6B7280" size={24} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Doctor Name"
              value={appointmentForm.doctorName}
              onChangeText={(text) => setAppointmentForm(prev => ({...prev, doctorName: text}))}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Date (YYYY-MM-DD)"
              value={appointmentForm.date}
              onChangeText={(text) => setAppointmentForm(prev => ({...prev, date: text}))}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Time (HH:MM)"
              value={appointmentForm.time}
              onChangeText={(text) => setAppointmentForm(prev => ({...prev, time: text}))}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowAppointmentModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleAddAppointment}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Medicine Modal */}
      <Modal
        visible={showMedicineModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMedicineModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Medicine</Text>
              <TouchableOpacity onPress={() => setShowMedicineModal(false)}>
                <X color="#6B7280" size={24} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Medicine Name"
              value={medicineForm.name}
              onChangeText={(text) => setMedicineForm(prev => ({...prev, name: text}))}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Dosage (e.g., 40mg)"
              value={medicineForm.dosage}
              onChangeText={(text) => setMedicineForm(prev => ({...prev, dosage: text}))}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Frequency (e.g., Once daily)"
              value={medicineForm.frequency}
              onChangeText={(text) => setMedicineForm(prev => ({...prev, frequency: text}))}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Disease/Condition"
              value={medicineForm.disease}
              onChangeText={(text) => setMedicineForm(prev => ({...prev, disease: text}))}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowMedicineModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleAddMedicine}
              >
                <Text style={styles.submitButtonText}>Add Medicine</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  sosButton: {
    backgroundColor: '#DC2626',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#059669',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  cancelButtonText: {
    textAlign: 'center',
    color: '#64748B',
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#059669',
    marginLeft: 8,
  },
  submitButtonText: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontWeight: '600',
  },
});