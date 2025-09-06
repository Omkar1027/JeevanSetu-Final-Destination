import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { AuthContext } from '@/contexts/AuthContext';
import {
  TriangleAlert as AlertTriangle,
  Calendar,
  FileText,
  Download,
  Send,
  User,
  Clock,
  ChevronRight,
  ChevronDown,
  Plus,
  Heart,
  Activity,
  Brain,
  Eye,
  Stethoscope
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

const router = useRouter();
const handleSOSPress = () => {
  router.push('/(patient)/sos');
};

interface Prescription {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  medicines: string[];
  instructions: string;
  status: 'active' | 'completed';
}

interface SpecialtyContainer {
  specialty: string;
  prescriptions: Prescription[];
  icon: string;
  color: string;
}

// Dummy data for when no prescriptions are fetched
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


// Specialty icons and colors mapping
const specialtyConfig: { [key: string]: { icon: any, color: string } } = {
  'Cardiologist': { icon: Heart, color: '#EF4444' },
  'Oncologist': { icon: Activity, color: '#8B5CF6' },
  'Neurologist': { icon: Brain, color: '#06B6D4' },
  'Dermatologist': { icon: Eye, color: '#F59E0B' },
  'General': { icon: Stethoscope, color: '#10B981' }
};

export default function PrescriptionsScreen() {
  const { user } = useContext(AuthContext);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSpecialties, setExpandedSpecialties] = useState<Set<string>>(new Set());

  const fetchPrescriptions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          *,
          doctors!prescriptions_doctor_id_fkey(specialty, hospital),
          users!prescriptions_doctor_id_fkey(name, avatar)
        `)
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching prescriptions:', error);
        // Use dummy data if there's an error
        setPrescriptions(dummyPrescriptions);
      } else if (data && data.length > 0) {
        const mappedPrescriptions: Prescription[] = data.map((pres: any) => ({
          id: pres.id,
          doctorName: pres.users?.name || 'Unknown Doctor',
          doctorSpecialty: pres.doctors?.specialty || 'General',
          date: pres.created_at,
          medicines: Array.isArray(pres.medicines) ? pres.medicines : [],
          instructions: pres.instructions || '',
          status: pres.status,
        }));
        setPrescriptions(mappedPrescriptions);
      } else {
        // Use dummy data if no data is returned
        setPrescriptions(dummyPrescriptions);
      }
    } catch (error) {
      console.error('Unexpected error fetching prescriptions:', error);
      // Use dummy data on unexpected error
      setPrescriptions(dummyPrescriptions);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [user]);

  // Group prescriptions by specialty
  const groupedPrescriptions = React.useMemo(() => {
    const grouped: { [key: string]: Prescription[] } = {};
    
    prescriptions.forEach((prescription) => {
      const specialty = prescription.doctorSpecialty || 'General';
      if (!grouped[specialty]) {
        grouped[specialty] = [];
      }
      grouped[specialty].push(prescription);
    });

    return Object.entries(grouped).map(([specialty, prescriptions]) => ({
      specialty,
      prescriptions,
      icon: specialtyConfig[specialty]?.icon || specialtyConfig['General'].icon,
      color: specialtyConfig[specialty]?.color || specialtyConfig['General'].color
    }));
  }, [prescriptions]);

  const toggleSpecialty = (specialty: string) => {
    const newExpanded = new Set(expandedSpecialties);
    if (newExpanded.has(specialty)) {
      newExpanded.delete(specialty);
    } else {
      newExpanded.add(specialty);
    }
    setExpandedSpecialties(newExpanded);
  };

  const isDoctorInterface = user?.role === 'doctor';

  if (isDoctorInterface) {
    // Doctor's common prescriptions view (unchanged)
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Common Prescriptions</Text>
            <Text style={styles.headerSubtitle}>Quick access templates</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.calendarButton}>
              <Calendar color="#2563EB" size={24} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton}>
              <Plus color="#FFFFFF" size={24} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.templateCard}>
            <Text style={styles.templateTitle}>Diabetes Management</Text>
            <Text style={styles.templateDescription}>Standard prescription for Type 2 Diabetes</Text>
            <Text style={styles.templateMedicines}>Metformin 500mg, Glipizide 5mg</Text>
          </View>

          <View style={styles.templateCard}>
            <Text style={styles.templateTitle}>Hypertension Control</Text>
            <Text style={styles.templateDescription}>Blood pressure management protocol</Text>
            <Text style={styles.templateMedicines}>Amlodipine 5mg, Losartan 50mg</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#059669" />
      </SafeAreaView>
    );
  }

  // Patient's containerized prescriptions view
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Consultations</Text>
          <Text style={styles.headerSubtitle}>
            {groupedPrescriptions.length} specialties • {prescriptions.length} total prescriptions
          </Text>
        </View>
        <TouchableOpacity style={styles.sosButton} onPress={handleSOSPress}>
          <AlertTriangle color="#FFFFFF" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {groupedPrescriptions.map((container) => {
          const IconComponent = container.icon;
          const isExpanded = expandedSpecialties.has(container.specialty);
          
          return (
            <View key={container.specialty} style={styles.specialtyContainer}>
              {/* Specialty Header */}
              <TouchableOpacity
                style={styles.specialtyHeader}
                onPress={() => toggleSpecialty(container.specialty)}
              >
                <View style={styles.specialtyHeaderLeft}>
                  <View style={[styles.specialtyIconContainer, { backgroundColor: `${container.color}20` }]}>
                    <IconComponent color={container.color} size={24} />
                  </View>
                  <View style={styles.specialtyInfo}>
                    <Text style={styles.specialtyTitle}>{container.specialty}</Text>
                    <Text style={styles.specialtyCount}>
                      {container.prescriptions.length} prescription{container.prescriptions.length > 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
                <View style={styles.specialtyHeaderRight}>
                  <View style={[styles.activeCount, { backgroundColor: container.color }]}>
                    <Text style={styles.activeCountText}>
                      {container.prescriptions.filter(p => p.status === 'active').length}
                    </Text>
                  </View>
                  {isExpanded ? (
                    <ChevronDown color="#6B7280" size={20} />
                  ) : (
                    <ChevronRight color="#6B7280" size={20} />
                  )}
                </View>
              </TouchableOpacity>

              {/* Expanded Prescriptions */}
              {isExpanded && (
                <View style={styles.prescriptionsContainer}>
                  {container.prescriptions.map((prescription) => (
                    <View key={prescription.id} style={styles.prescriptionCard}>
                      <View style={styles.prescriptionHeader}>
                        <Image
                          source={{ uri: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg' }}
                          style={styles.doctorAvatar}
                        />
                        <View style={styles.doctorInfo}>
                          <Text style={styles.doctorName}>{prescription.doctorName}</Text>
                          <View style={styles.dateContainer}>
                            <Clock color="#6B7280" size={14} />
                            <Text style={styles.prescriptionDate}>
                              {new Date(prescription.date).toLocaleDateString()}
                            </Text>
                          </View>
                        </View>
                        <View style={[
                          styles.statusBadge,
                          { backgroundColor: prescription.status === 'active' ? '#D1FAE5' : '#F3F4F6' }
                        ]}>
                          <Text style={[
                            styles.statusText,
                            { color: prescription.status === 'active' ? '#059669' : '#6B7280' }
                          ]}>
                            {prescription.status === 'active' ? 'ACTIVE' : 'COMPLETED'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.medicinesSection}>
                        <Text style={styles.medicinesTitle}>Medicines:</Text>
                        {prescription.medicines.map((medicine, index) => (
                          <View key={index} style={styles.medicineItem}>
                            <Text style={styles.medicineText}>• {medicine}</Text>
                          </View>
                        ))}
                      </View>

                      <Text style={styles.instructions}>{prescription.instructions}</Text>

                      <View style={styles.prescriptionActions}>
                        <TouchableOpacity style={styles.actionButton}>
                          <Download color="#2563EB" size={20} />
                          <Text style={styles.actionButtonText}>Download</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton}>
                          <Send color="#059669" size={20} />
                          <Text style={styles.actionButtonText}>Send to Pharmacy</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  calendarButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  addButton: {
    padding: 8,
    backgroundColor: '#059669',
    borderRadius: 8,
  },
  sosButton: {
    backgroundColor: '#DC2626',
    padding: 12,
    borderRadius: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  
  // Specialty Container Styles
  specialtyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  specialtyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  specialtyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  specialtyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  specialtyInfo: {
    flex: 1,
  },
  specialtyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  specialtyCount: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  specialtyHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeCount: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  activeCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Prescriptions Container
  prescriptionsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
  },
  prescriptionCard: {
    padding: 16,
    marginHorizontal: 8,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#059669',
  },
  prescriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  doctorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  prescriptionDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  medicinesSection: {
    marginBottom: 12,
  },
  medicinesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  medicineItem: {
    marginBottom: 4,
  },
  medicineText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  instructions: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  prescriptionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  
  // Template styles (for doctor interface)
  templateCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  templateMedicines: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
});