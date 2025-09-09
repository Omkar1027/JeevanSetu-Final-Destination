import { Tabs } from 'expo-router';
import { Home, FileText, UserCheck, MessageCircle, User } from 'lucide-react-native';

export default function PatientLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          paddingTop: 8,
          paddingBottom: 20, // Same as doctor layout
          height: 92, // Same as doctor layout
        },
        tabBarLabelStyle: {
          fontSize: 11, // Same as doctor layout
          fontWeight: '500', // Same as doctor layout
          marginTop: 4, // Same as doctor layout
          marginBottom: 4, // Added margin below the label text
        },

      }}>
      <Tabs.Screen
        name="today"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="consultations"
        options={{
          title: 'Consultations',
          tabBarIcon: ({ color, size }) => (
            <FileText color={color} size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="doctors"
        options={{
          title: 'Doctors',
          tabBarIcon: ({ color, size }) => (
            <UserCheck color={color} size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: 'Assistant',
          tabBarIcon: ({ color, size }) => (
            <MessageCircle color={color} size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="sos"
        options={{
          href: null, // This hides the tab from the tab bar
        }}
      />
    </Tabs>
  );
}