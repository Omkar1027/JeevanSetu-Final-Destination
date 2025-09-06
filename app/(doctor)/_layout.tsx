import { Tabs } from 'expo-router';
import { Calendar, Users, FileText, ClipboardList, User } from 'lucide-react-native';

export default function DoctorLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          paddingTop: 8,
          paddingBottom: 20, // Increased from 8 to 20
          height: 92, // Increased from 80 to 92 to accommodate the extra padding
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
          marginBottom: 4, // Added margin below the label text
        },
      }}>
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Appointments',
          tabBarIcon: ({ color, size }) => (
            <Calendar color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="patients"
        options={{
          title: 'Patients',
          tabBarIcon: ({ color, size }) => (
            <Users color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="prescriptions"
        options={{
          title: 'Prescriptions',
          tabBarIcon: ({ color, size }) => (
            <FileText color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color, size }) => (
            <ClipboardList color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          href: null, // This hides the tab from the tab bar
        }}
      />
    </Tabs>
  );
}