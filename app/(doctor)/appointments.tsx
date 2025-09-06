import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  Modal,
  Animated,
} from 'react-native';
import { AuthContext } from '@/contexts/AuthContext';
import { Calendar, Clock, Mic, MicOff, User, CircleAlert as AlertCircle, Filter } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Audio } from 'expo-av';

const router = useRouter();

const handleCalendarpress = () => {
  router.push('/(doctor)/calendar');
};

interface Appointment {
  id: string;
  patientName: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  type: string;
  patient_id: string;
  appointment_date: string;
  status: string;
}

// Dummy appointments data
const dummyAppointments: Appointment[] = [
  {
    id: 'dummy-1',
    patientName: 'Sarah Johnson',
    time: '09:00',
    priority: 'high',
    type: 'Emergency Consultation',
    patient_id: 'patient-1',
    appointment_date: new Date().toISOString(),
    status: 'scheduled',
  },
  {
    id: 'dummy-2',
    patientName: 'Michael Chen',
    time: '09:30',
    priority: 'high',
    type: 'Follow-up',
    patient_id: 'patient-2',
    appointment_date: new Date().toISOString(),
    status: 'scheduled',
  },
  {
    id: 'dummy-3',
    patientName: 'Emily Davis',
    time: '10:00',
    priority: 'medium',
    type: 'Regular Checkup',
    patient_id: 'patient-3',
    appointment_date: new Date().toISOString(),
    status: 'scheduled',
  },
  {
    id: 'dummy-4',
    patientName: 'Robert Wilson',
    time: '10:30',
    priority: 'low',
    type: 'Consultation',
    patient_id: 'patient-4',
    appointment_date: new Date().toISOString(),
    status: 'scheduled',
  },
  {
    id: 'dummy-5',
    patientName: 'Lisa Anderson',
    time: '11:00',
    priority: 'medium',
    type: 'Follow-up',
    patient_id: 'patient-5',
    appointment_date: new Date().toISOString(),
    status: 'scheduled',
  },
  {
    id: 'dummy-6',
    patientName: 'David Brown',
    time: '11:30',
    priority: 'high',
    type: 'Emergency',
    patient_id: 'patient-6',
    appointment_date: new Date().toISOString(),
    status: 'scheduled',
  },
  {
    id: 'dummy-7',
    patientName: 'Jessica Martinez',
    time: '14:00',
    priority: 'low',
    type: 'Routine Checkup',
    patient_id: 'patient-7',
    appointment_date: new Date().toISOString(),
    status: 'scheduled',
  },
  {
    id: 'dummy-8',
    patientName: 'Thomas Taylor',
    time: '14:30',
    priority: 'medium',
    type: 'Consultation',
    patient_id: 'patient-8',
    appointment_date: new Date().toISOString(),
    status: 'scheduled',
  },
];

export default function AppointmentsScreen() {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [prescriptionModal, setPrescriptionModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [medicines, setMedicines] = useState('');
  const [instructions, setInstructions] = useState('');
  const [micScale] = useState(new Animated.Value(1));
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Initialize Gemini AI
  const genAI = new GoogleGenerativeAI('AIzaSyBk0xeFJaXULO12wjE0BtSNC0NiLGorG_0');
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const fetchAppointments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          users!appointments_patient_id_fkey(name)
        `)
        .eq('doctor_id', user.id)
        .order('appointment_date', { ascending: false });

      if (error) {
        console.error('Error fetching appointments:', error);
        Alert.alert('Error', 'Failed to fetch appointments.');
        // Use dummy data on error
        setAppointments(dummyAppointments);
      } else if (data && data.length > 0) {
        const mappedAppointments: Appointment[] = data.map((apt: any) => ({
          id: apt.id,
          patientName: apt.users?.name || 'Unknown Patient',
          time: new Date(apt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          priority: 'medium' as 'high' | 'medium' | 'low', // Default priority
          type: 'Consultation',
          patient_id: apt.patient_id,
          appointment_date: apt.appointment_date,
          status: apt.status,
        }));
        setAppointments(mappedAppointments);
      } else {
        // Use dummy data if no appointments found
        setAppointments(dummyAppointments);
      }
    } catch (error) {
      console.error('Unexpected error fetching appointments:', error);
      Alert.alert('Error', 'Unexpected error occurred while fetching appointments.');
      // Use dummy data on unexpected error
      setAppointments(dummyAppointments);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getPriorityBgColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#FEF2F2';
      case 'medium': return '#FFFBEB';
      case 'low': return '#F0FDF4';
      default: return '#F9FAFB';
    }
  };

  const startRecording = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setPrescriptionModal(true);
  };

  const startVoiceRecording = async () => {
    try {
      if (permissionResponse && permissionResponse.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      startRecordingAnimation();
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording.');
    }
  };

  const stopVoiceRecording = async () => {
    console.log('Stopping recording..');
    setRecording(null);
    setIsRecording(false);
    stopRecordingAnimation();
    if (recording) {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = recording.getURI();
      console.log('Recording stopped and stored at', uri);

      // Transcribe and parse the audio using Gemini
      if (uri) {
        await transcribeAndParseAudio(uri);
      }
    }
  };

  const startRecordingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(micScale, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(micScale, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopRecordingAnimation = () => {
    micScale.stopAnimation();
    micScale.setValue(1);
  };

  const transcribeAndParseAudio = async (uri: string) => {
    try {
      // For now, use placeholder transcription
      // TODO: Implement actual speech-to-text transcription
      const transcribedText = "Sample transcribed text: Paracetamol 500mg twice daily";

      // Use Gemini to parse the transcribed text
      const prompt = `Parse the following prescription text and extract the medicines and instructions. Return in JSON format with keys "medicines" (array of strings) and "instructions" (string).

Prescription text: ${transcribedText}

If there are instructions, include them in the instructions field.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const decodedText = response.text();

      let parsedData;
      try {
        // Remove markdown code blocks if present
        let jsonText = decodedText.trim();
        if (jsonText.startsWith('```json')) {
          jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        parsedData = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('Error parsing Gemini response:', parseError);
        // Fallback: try to extract information from the raw response
        parsedData = {
          medicines: [],
          instructions: decodedText || 'Please review the transcription manually.',
        };
      }

      // Update the medicines and instructions fields
      setMedicines(parsedData.medicines ? parsedData.medicines.join('\n') : '');
      setInstructions(parsedData.instructions || '');
    } catch (error) {
      console.error('Error transcribing and parsing audio:', error);
      Alert.alert('Error', 'Failed to process voice recording.');
    }
  };

  const markAsCompleted = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', appointmentId);

      if (error) {
        console.error('Error updating appointment:', error);
        Alert.alert('Error', 'Failed to update appointment status.');
      } else {
        Alert.alert('Success', 'Appointment marked as completed!');
        fetchAppointments(); // Refresh appointments
      }
    } catch (error) {
      console.error('Unexpected error updating appointment:', error);
      Alert.alert('Error', 'Unexpected error occurred while updating appointment.');
    }
  };

  const savePrescription = async () => {
  if (!selectedAppointment || !medicines.trim()) return;

  try {
    // Use Gemini to decode the prescription text
    const prompt = `Parse the following prescription text and extract the medicines and instructions. Return in JSON format with keys "medicines" (array of strings) and "instructions" (string).

Prescription text: ${medicines}

If there are instructions, include them in the instructions field.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const decodedText = response.text();

    // Parse the JSON response
    let parsedData;
    try {
      // Remove markdown code blocks if present
      let jsonText = decodedText.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      parsedData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      // Fallback to manual parsing
      parsedData = {
        medicines: medicines.split('\n').filter(m => m.trim()),
        instructions: instructions || 'Follow as prescribed.',
      };
    }

    // Format medicines with "prescribed:" prefix
    const formattedMedicines = parsedData.medicines 
      ? parsedData.medicines.map((medicine: string) => `prescribed: ${medicine}`)
      : medicines.split('\n').filter(m => m.trim()).map((medicine: string) => `prescribed: ${medicine}`);

    const { data, error } = await supabase
      .from('prescriptions')
      .insert({
        patient_id: selectedAppointment.patient_id,
        doctor_id: user?.id,
        appointment_id: selectedAppointment.id,
        medicines: formattedMedicines,
        instructions: parsedData.instructions || instructions || 'Follow as prescribed.',
        status: 'active',
      });

    if (error) {
      console.error('Error saving prescription:', error);
      Alert.alert('Error', 'Failed to save prescription.');
    } else {
      Alert.alert('Success', 'Prescription saved successfully!');
      // Close modal and reset form
      setPrescriptionModal(false);
      setMedicines('');
      setInstructions('');
      setSelectedAppointment(null);
      fetchAppointments(); // Refresh appointments
    }
  } catch (error) {
    console.error('Unexpected error saving prescription:', error);
    Alert.alert('Error', 'Unexpected error occurred while saving prescription.');
  }
};


  const priorityCases = appointments.filter(apt => apt.priority === 'high');
  const regularAppointments = appointments.filter(apt => apt.priority !== 'high');
  
  // Apply priority filter to regular appointments
  const filteredRegularAppointments = priorityFilter === 'all' 
    ? regularAppointments 
    : regularAppointments.filter(apt => apt.priority === priorityFilter);

  const FilterModal = () => (
    <Modal
      visible={showFilterModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilterModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.filterModalContent}>
          <Text style={styles.modalTitle}>Filter by Priority</Text>
          
          {['all', 'high', 'medium', 'low'].map((priority) => (
            <TouchableOpacity
              key={priority}
              style={[
                styles.filterOption,
                priorityFilter === priority && styles.selectedFilterOption
              ]}
              onPress={() => {
                setPriorityFilter(priority as 'all' | 'high' | 'medium' | 'low');
                setShowFilterModal(false);
              }}>
              <Text style={[
                styles.filterOptionText,
                priorityFilter === priority && styles.selectedFilterOptionText
              ]}>
                {priority === 'all' ? 'All Priorities' : priority.charAt(0).toUpperCase() + priority.slice(1)}
              </Text>
              {priority !== 'all' && (
                <View style={[
                  styles.priorityIndicator,
                  { backgroundColor: getPriorityColor(priority) }
                ]} />
              )}
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity
            style={styles.closeFilterButton}
            onPress={() => setShowFilterModal(false)}>
            <Text style={styles.closeFilterButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Appointments</Text>
          <Text style={styles.headerSubtitle}>Today, {new Date().toLocaleDateString()}</Text>
        </View>
        <TouchableOpacity style={styles.calendarButton} onPress={handleCalendarpress}>
          <Calendar color="#2563EB" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Priority Cases */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AlertCircle color="#EF4444" size={20} />
            <Text style={styles.sectionTitle}>Priority Cases</Text>
          </View>

          {priorityCases.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No priority cases today</Text>
            </View>
          ) : (
            priorityCases.map((appointment) => (
              <View
                key={appointment.id}
                style={[
                  styles.appointmentCard,
                  { backgroundColor: getPriorityBgColor(appointment.priority) }
                ]}>
                <View style={styles.appointmentHeader}>
                  <View style={styles.appointmentInfo}>
                    <Text style={styles.patientName}>{appointment.patientName}</Text>
                    <Text style={styles.appointmentType}>{appointment.type}</Text>
                  </View>
                  <View style={styles.appointmentMeta}>
                    <View style={styles.timeContainer}>
                      <Clock color="#6B7280" size={16} />
                      <Text style={styles.appointmentTime}>{appointment.time}</Text>
                    </View>
                    <View style={[
                      styles.priorityBadge,
                      { backgroundColor: getPriorityColor(appointment.priority) }
                    ]}>
                      <Text style={styles.priorityText}>{appointment.priority.toUpperCase()}</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.recordButton}
                  onPress={() => startRecording(appointment)}>
                  <Mic color="#FFFFFF" size={20} />
                  <Text style={styles.recordButtonText}>Record Prescription</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.recordButton, { backgroundColor: '#10B981', marginTop: 8 }]}
                  onPress={() => markAsCompleted(appointment.id)}>
                  <Text style={styles.recordButtonText}>Mark as Completed</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Regular Appointments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Appointments</Text>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowFilterModal(true)}>
              <Filter color="#2563EB" size={20} />
              <Text style={styles.filterButtonText}>
                {priorityFilter === 'all' ? 'Filter' : priorityFilter.charAt(0).toUpperCase() + priorityFilter.slice(1)}
              </Text>
            </TouchableOpacity>
          </View>

          {filteredRegularAppointments.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {priorityFilter === 'all' ? 'No appointments found' : `No ${priorityFilter} priority appointments found`}
              </Text>
            </View>
          ) : (
            filteredRegularAppointments.map((appointment) => (
              <View key={appointment.id} style={styles.appointmentCard}>
                <View style={styles.appointmentHeader}>
                  <View style={styles.appointmentInfo}>
                    <Text style={styles.patientName}>{appointment.patientName}</Text>
                    <Text style={styles.appointmentType}>{appointment.type}</Text>
                  </View>
                  <View style={styles.appointmentMeta}>
                    <View style={styles.timeContainer}>
                      <Clock color="#6B7280" size={16} />
                      <Text style={styles.appointmentTime}>{appointment.time}</Text>
                    </View>
                    <View style={[
                      styles.priorityBadge,
                      { backgroundColor: getPriorityColor(appointment.priority) }
                    ]}>
                      <Text style={styles.priorityText}>{appointment.priority.toUpperCase()}</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.recordButton}
                  onPress={() => startRecording(appointment)}>
                  <Mic color="#FFFFFF" size={20} />
                  <Text style={styles.recordButtonText}>Record Prescription</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.recordButton, { backgroundColor: '#10B981', marginTop: 8 }]}
                  onPress={() => markAsCompleted(appointment.id)}>
                  <Text style={styles.recordButtonText}>Mark as Completed</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Filter Modal */}
      <FilterModal />

      {/* Prescription Modal */}
      <Modal
        visible={prescriptionModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPrescriptionModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Record Prescription</Text>
            <Text style={styles.modalSubtitle}>
              For: {selectedAppointment?.patientName}
            </Text>

            <Text style={styles.inputLabel}>Medicines (one per line):</Text>
            <TextInput
              style={styles.textInput}
              value={medicines}
              onChangeText={setMedicines}
              placeholder="Enter medicines..."
              multiline
              numberOfLines={4}
            />

            <Text style={styles.inputLabel}>Instructions:</Text>
            <TextInput
              style={styles.textInput}
              value={instructions}
              onChangeText={setInstructions}
              placeholder="Enter instructions..."
              multiline
              numberOfLines={2}
            />

            {/* Voice Recording Section */}
            <View style={styles.voiceSection}>
              <Text style={styles.inputLabel}>Voice Recording:</Text>
              <TouchableOpacity
                style={[styles.voiceButton, isRecording && styles.recordingButton]}
                onPress={isRecording ? stopVoiceRecording : startVoiceRecording}>
                <Animated.View style={{ transform: [{ scale: micScale }] }}>
                  {isRecording ? (
                    <MicOff color="#FFFFFF" size={24} />
                  ) : (
                    <Mic color="#FFFFFF" size={24} />
                  )}
                </Animated.View>
                <Text style={styles.voiceButtonText}>
                  {isRecording ? 'Stop Recording' : 'Start Voice Recording'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setPrescriptionModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={savePrescription}>
                <Text style={styles.saveButtonText}>Save Prescription</Text>
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
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  calendarButton: {
    padding: 12,
    backgroundColor: '#EBF8FF',
    borderRadius: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginLeft: 8,
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  appointmentHeader: {
    marginBottom: 16,
  },
  appointmentInfo: {
    marginBottom: 8,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  appointmentType: {
    fontSize: 14,
    color: '#6B7280',
  },
  appointmentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentTime: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  recordButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 0.45,
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 0.45,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  voiceSection: {
    marginBottom: 16,
  },
  voiceButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingButton: {
    backgroundColor: '#EF4444',
  },
  voiceButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  filterButtonText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  
  // Filter modal styles
  filterModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxHeight: '60%',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedFilterOption: {
    backgroundColor: '#EBF8FF',
    borderColor: '#2563EB',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  selectedFilterOptionText: {
    color: '#2563EB',
    fontWeight: '600',
  },
  priorityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  closeFilterButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
    alignSelf: 'center',
  },
  closeFilterButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Empty state styles
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },



});
