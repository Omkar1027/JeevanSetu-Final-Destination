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
  Animated,
  Easing,
} from 'react-native';
import { AuthContext } from '@/contexts/AuthContext';
import {
  TriangleAlert as AlertTriangle,
  Download,
  Phone,
  MessageCircle,
  Star,
  Calendar,
  MapPin,
  ChevronDown,
  ChevronUp,
  Clock,
  Award,
  GraduationCap,
  Users,
  Mail,
  Globe
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

const router = useRouter();

const handleSOSPress = () => {
  router.push('/(patient)/sos');
};

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  location: string;
  rating: number;
  phone: string;
  avatar: string;
  lastConsulted: string;
  nextAppointment?: string;
  // Additional fields for detailed view
  email?: string;
  experience?: string;
  education?: string;
  languages?: string[];
  consultationFee?: number;
  availability?: string;
  totalPatients?: number;
  about?: string;
}

export default function DoctorsScreen() {
  const { user } = useContext(AuthContext);
  const [doctors, setDoctors] = useState<Doctor[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedDoctor, setExpandedDoctor] = useState<string | null>(null);
  const [animationValues, setAnimationValues] = useState<{ [key: string]: Animated.Value }>({});

  const fetchDoctors = async () => {
    if (!user) {
      setDoctors([]);
      setLoading(false);
      return;
    }
    try {
      // Fetch doctors joined with users table to get user details
      const { data, error } = await supabase
        .from('users')
        .select('id, name, phone, location, avatar, role, email')
        .eq('role', 'doctor')
        .limit(100);

      if (error) {
        console.error('Error fetching doctors:', error);
        Alert.alert('Error', 'Failed to fetch doctors from database.');
        setDoctors([]);
      } else if (data) {
        // Map data to Doctor interface with enhanced mock data
        const mappedDoctors: Doctor[] = data.map((doc: any, index: number) => ({
          id: doc.id,
          name: doc.name || 'Unknown',
          specialty: ['Cardiology', 'Dermatology', 'Neurology', 'Pediatrics', 'Orthopedics'][index % 5],
          hospital: ['City General Hospital', 'Metro Medical Center', 'Advanced Care Clinic', 'Downtown Hospital'][index % 4],
          location: doc.location || 'Mumbai, Maharashtra',
          rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
          phone: doc.phone || '+91 98765 43210',
          avatar: doc.avatar || ``,
          lastConsulted: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          nextAppointment: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
          // Enhanced details
          email: doc.email || `${doc.name?.toLowerCase().replace(' ', '.')}@hospital.com`,
          experience: `${Math.floor(Math.random() * 15) + 5} years`,
          education: ['MBBS, MD', 'MBBS, MS', 'MBBS, DNB'][index % 3],
          languages: ['English', 'Hindi', 'Marathi'].slice(0, Math.floor(Math.random() * 3) + 1),
          consultationFee: Math.floor(Math.random() * 1000) + 500,
          availability: ['Mon-Fri 9AM-6PM', 'Mon-Sat 10AM-8PM', 'Tue-Sun 8AM-2PM'][index % 3],
          totalPatients: Math.floor(Math.random() * 500) + 100,
          about: `Experienced ${['Cardiology', 'Dermatology', 'Neurology', 'Pediatrics', 'Orthopedics'][index % 5]} specialist with extensive experience in patient care and advanced medical procedures.`,
        }));
        setDoctors(mappedDoctors);

        // Initialize animation values
        const animValues: { [key: string]: Animated.Value } = {};
        mappedDoctors.forEach(doctor => {
          animValues[doctor.id] = new Animated.Value(0);
        });
        setAnimationValues(animValues);
      }
    } catch (error) {
      console.error('Unexpected error fetching doctors:', error);
      Alert.alert('Error', 'Unexpected error occurred while fetching doctors.');
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDoctors();
  }, [user]);

  const toggleDoctorDetails = (doctorId: string) => {
    if (expandedDoctor === doctorId) {
      // Collapse
      Animated.timing(animationValues[doctorId], {
        toValue: 0,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: false,
      }).start(() => {
        setExpandedDoctor(null);
      });
    } else {
      // Expand
      if (expandedDoctor) {
        // Collapse previous
        Animated.timing(animationValues[expandedDoctor], {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }

      setExpandedDoctor(doctorId);
      Animated.timing(animationValues[doctorId], {
        toValue: 1,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleDownloadPDF = () => {
    Alert.alert(
      'Download PDF',
      'Doctor information PDF will be generated and downloaded.',
      [{ text: 'OK' }]
    );
  };

  const handleCall = (phone: string) => {
    Alert.alert(
      'Call Doctor',
      `Would you like to call ${phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => console.log('Calling:', phone) }
      ]
    );
  };

  const handleBookAppointment = async (doctorId: string) => {
    if (!user) return;

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          patient_id: user.id,
          doctor_id: doctorId,
          appointment_date: tomorrow.toISOString(),
          status: 'scheduled',
          symptoms: '',
          notes: 'Booked via app'
        });

      if (error) {
        console.error('Error booking appointment:', error);
        Alert.alert('Error', 'Failed to book appointment. Please try again.');
      } else {
        Alert.alert('Success', 'Appointment booked successfully!');
      }
    } catch (error) {
      console.error('Unexpected error booking appointment:', error);
      Alert.alert('Error', 'Unexpected error occurred while booking appointment.');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        color={index < Math.floor(rating) ? "#F59E0B" : "#E5E7EB"}
        size={16}
        fill={index < Math.floor(rating) ? "#F59E0B" : "none"}
      />
    ));
  };

  const renderDoctorDetails = (doctor: Doctor) => {
    if (!animationValues[doctor.id]) return null;

    const animatedHeight = animationValues[doctor.id].interpolate({
      inputRange: [0, 1],
      outputRange: [0, 400], // Adjust based on content
    });

    const animatedOpacity = animationValues[doctor.id].interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <Animated.View
        style={[
          styles.doctorDetailsContainer,
          { height: animatedHeight, opacity: animatedOpacity }
        ]}
      >
        <View style={styles.detailsContent}>
          {/* About Section */}
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>About</Text>
            <Text style={styles.detailText}>{doctor.about}</Text>
          </View>

          {/* Professional Info */}
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <GraduationCap color="#059669" size={18} />
              <View>
                <Text style={styles.detailLabel}>Education</Text>
                <Text style={styles.detailValue}>{doctor.education}</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <Award color="#059669" size={18} />
              <View>
                <Text style={styles.detailLabel}>Experience</Text>
                <Text style={styles.detailValue}>{doctor.experience}</Text>
              </View>
            </View>
          </View>

          {/* Contact & Availability */}
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Mail color="#059669" size={18} />
              <View>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue}>{doctor.email}</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <Clock color="#059669" size={18} />
              <View>
                <Text style={styles.detailLabel}>Availability</Text>
                <Text style={styles.detailValue}>{doctor.availability}</Text>
              </View>
            </View>
          </View>

          {/* Languages & Fee */}
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Globe color="#059669" size={18} />
              <View>
                <Text style={styles.detailLabel}>Languages</Text>
                <Text style={styles.detailValue}>{doctor.languages?.join(', ')}</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <Users color="#059669" size={18} />
              <View>
                <Text style={styles.detailLabel}>Patients Treated</Text>
                <Text style={styles.detailValue}>{doctor.totalPatients}+</Text>
              </View>
            </View>
          </View>

          {/* Consultation Fee */}
          <View style={styles.feeSection}>
            <Text style={styles.feeLabel}>Consultation Fee</Text>
            <Text style={styles.feeAmount}>₹{doctor.consultationFee}</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  if (loading) {
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
          <Text style={styles.headerTitle}>My Doctors</Text>
          <Text style={styles.headerSubtitle}>{doctors ? doctors.length : 0} consulting doctors</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadPDF}>
            <Download color="#059669" size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sosButton} onPress={handleSOSPress}>
            <AlertTriangle color="#FFFFFF" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {doctors && doctors.length > 0 ? (
          doctors.map((doctor) => (
            <View key={doctor.id} style={styles.doctorCard}>
              <TouchableOpacity
                style={styles.doctorMainContent}
                onPress={() => toggleDoctorDetails(doctor.id)}
                activeOpacity={0.7}
              >
                <View style={styles.doctorHeader}>
                  {doctor.avatar ? (
                    <Image
                      source={{ uri: doctor.avatar }}
                      style={styles.doctorAvatar}
                    />
                  ) : (
                    <Image
                      source={{
                        uri: "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg",
                      }}
                      style={styles.doctorAvatar}
                    />
                  )}
                  <View style={styles.doctorInfo}>
                    <Text style={styles.doctorName}>{doctor.name}</Text>
                    <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>

                    <View style={styles.ratingContainer}>
                      <View style={styles.stars}>
                        {renderStars(doctor.rating)}
                      </View>
                      <Text style={styles.ratingText}>{doctor.rating}</Text>
                    </View>
                  </View>
                  <View style={styles.expandIcon}>
                    {expandedDoctor === doctor.id ?
                      <ChevronUp color="#059669" size={24} /> :
                      <ChevronDown color="#6B7280" size={24} />
                    }
                  </View>
                </View>

                <View style={styles.hospitalInfo}>
                  <Text style={styles.hospitalName}>{doctor.hospital}</Text>
                  <View style={styles.locationContainer}>
                    <MapPin color="#6B7280" size={14} />
                    <Text style={styles.locationText}>{doctor.location}</Text>
                  </View>
                </View>

                <View style={styles.consultationInfo}>
                  <View style={styles.consultationItem}>
                    <Calendar color="#6B7280" size={16} />
                    <Text style={styles.consultationText}>
                      Last: {doctor.lastConsulted ? new Date(doctor.lastConsulted).toLocaleDateString() : 'No consultations yet'}
                    </Text>
                  </View>

                  {doctor.nextAppointment && (
                    <View style={styles.consultationItem}>
                      <Calendar color="#10B981" size={16} />
                      <Text style={styles.consultationText}>
                        Next: {new Date(doctor.nextAppointment).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              {/* Expandable Details */}
              {expandedDoctor === doctor.id && renderDoctorDetails(doctor)}

              {/* Action Buttons */}
              <View style={styles.doctorActions}>
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => handleCall(doctor.phone)}>
                  <Phone color="#FFFFFF" size={20} />
                  <Text style={styles.callButtonText}>Call</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.messageButton}>
                  <MessageCircle color="#2563EB" size={20} />
                  <Text style={styles.messageButtonText}>Message</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.appointmentButton}
                  onPress={() => handleBookAppointment(doctor.id)}>
                  <Calendar color="#059669" size={20} />
                  <Text style={styles.appointmentButtonText}>Book</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 20, color: '#6B7280' }}>No doctors found.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
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
    alignItems: 'center',
    gap: 12,
  },
  downloadButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F0FDF4',
  },
  sosButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  doctorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  doctorMainContent: {
    padding: 16,
  },
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  doctorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#059669',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  expandIcon: {
    padding: 4,
  },
  hospitalInfo: {
    marginBottom: 12,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
  },
  consultationInfo: {
    gap: 8,
  },
  consultationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  consultationText: {
    fontSize: 14,
    color: '#6B7280',
  },
  doctorDetailsContainer: {
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    overflow: 'hidden',
  },
  detailsContent: {
    padding: 16,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    flex: 1,
    marginRight: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  feeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  feeLabel: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
  },
  feeAmount: {
    fontSize: 18,
    color: '#92400E',
    fontWeight: 'bold',
  },
  doctorActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  callButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  callButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  messageButton: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  messageButtonText: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 14,
  },
  appointmentButton: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  appointmentButtonText: {
    color: '#059669',
    fontWeight: '600',
    fontSize: 14,
  },
  defaultAvatar: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B7280',
  },
});