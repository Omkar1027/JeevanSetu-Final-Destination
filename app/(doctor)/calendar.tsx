import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface Appointment {
  date: string;
  patientName: string;
  time: string;
  condition: string;
}

const appointmentDates = ['2024-09-08', '2024-09-18', '2024-09-20', '2024-09-25'];

const appointments: Appointment[] = [
  { date: '2024-09-08', patientName: 'Anjali Choudhary', time: '10:00 AM', condition: 'Arthritis' },
  { date: '2024-09-18', patientName: 'Yash Hingu', time: '2:30 PM', condition: 'Cardiac Care' },
  { date: '2024-09-20', patientName: 'Varad Shinde', time: '11:00 AM', condition: 'Diabetes Type 2' },
  { date: '2024-09-25', patientName: 'Suzanne Dantis', time: '3:00 PM', condition: 'Hypertension' },
];

export default function CalendarScreen() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date(2024, 8, 1)); // September 2024
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const hasAppointment = (dateString: string) => {
    return appointmentDates.includes(dateString);
  };

  const getAppointmentsForDate = (dateString: string) => {
    return appointments.filter(apt => apt.date === dateString);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
    setSelectedDate(null);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Day headers
    const dayHeaders = dayNames.map(day => (
      <View key={day} style={styles.dayHeader}>
        <Text style={styles.dayHeaderText}>{day}</Text>
      </View>
    ));

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.dayCell}>
          <Text style={styles.emptyDayText}></Text>
        </View>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
      const hasApt = hasAppointment(dateString);
      const isSelected = selectedDate === dateString;

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            isSelected && styles.selectedDayCell,
          ]}
          onPress={() => setSelectedDate(dateString)}
        >
          <Text style={[
            styles.dayText,
            hasApt && styles.appointmentDayText,
            isSelected && styles.selectedDayText,
          ]}>
            {day}
          </Text>
          {hasApt && !isSelected && <View style={styles.appointmentDot} />}
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.calendarContainer}>
        <View style={styles.dayHeaderContainer}>
          {dayHeaders}
        </View>
        <View style={styles.daysContainer}>
          {days}
        </View>
      </View>
    );
  };

  const monthYear = currentDate.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  const selectedAppointments = selectedDate ? getAppointmentsForDate(selectedDate) : [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color="#2563EB" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calendar</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Month Navigation */}
        <View style={styles.monthNavigation}>
          <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navButton}>
            <ChevronLeft color="#374151" size={20} />
          </TouchableOpacity>
          <Text style={styles.monthText}>{monthYear}</Text>
          <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navButton}>
            <ChevronRight color="#374151" size={20} />
          </TouchableOpacity>
        </View>

        {/* Calendar */}
        {renderCalendar()}

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={styles.legendDot} />
            <Text style={styles.legendText}>Appointment scheduled</Text>
          </View>
        </View>

        {/* Selected Date Appointments */}
        {selectedDate && (
          <View style={styles.appointmentsSection}>
            <Text style={styles.appointmentsSectionTitle}>
              Appointments for {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            
            {selectedAppointments.length > 0 ? (
              selectedAppointments.map((appointment, index) => (
                <View key={index} style={styles.appointmentCard}>
                  <View style={styles.appointmentHeader}>
                    <View style={styles.patientAvatar}>
                      <User color="#6B7280" size={16} />
                    </View>
                    <View style={styles.appointmentInfo}>
                      <Text style={styles.patientName}>{appointment.patientName}</Text>
                      <Text style={styles.appointmentTime}>{appointment.time}</Text>
                      <Text style={styles.condition}>{appointment.condition}</Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.noAppointmentsCard}>
                <CalendarIcon color="#9CA3AF" size={24} />
                <Text style={styles.noAppointmentsText}>No appointments scheduled</Text>
              </View>
            )}
          </View>
        )}

        {/* All Upcoming Appointments */}
        <View style={styles.upcomingSection}>
          <Text style={styles.upcomingSectionTitle}>Upcoming Appointments</Text>
          {appointments.map((appointment, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.upcomingAppointmentCard}
              onPress={() => setSelectedDate(appointment.date)}
            >
              <View style={styles.appointmentHeader}>
                <View style={styles.patientAvatar}>
                  <User color="#6B7280" size={16} />
                </View>
                <View style={styles.appointmentInfo}>
                  <Text style={styles.patientName}>{appointment.patientName}</Text>
                  <Text style={styles.appointmentTime}>{appointment.time}</Text>
                  <Text style={styles.condition}>{appointment.condition}</Text>
                </View>
                <View style={styles.appointmentDate}>
                  <Text style={styles.appointmentDateText}>
                    {new Date(appointment.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  navButton: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dayHeaderContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  selectedDayCell: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
  },
  dayText: {
    fontSize: 16,
    color: '#374151',
  },
  appointmentDayText: {
    color: '#2563EB',
    fontWeight: 'bold',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  emptyDayText: {
    fontSize: 16,
    color: 'transparent',
  },
  appointmentDot: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  legend: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#6B7280',
  },
  appointmentsSection: {
    marginBottom: 24,
  },
  appointmentsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  noAppointmentsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  noAppointmentsText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  appointmentInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  appointmentTime: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  condition: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '500',
  },
  upcomingSection: {
    marginBottom: 32,
  },
  upcomingSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  upcomingAppointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  appointmentDate: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  appointmentDateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
});