import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Shield, Users, Clock, UserCheck } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function LandingScreen() {
  const features = [
    {
      icon: <Heart color="#10B981" size={32} />,
      title: "Compassionate Care",
      description: "Connect with certified doctors who understand your health needs"
    },
    {
      icon: <Shield color="#2563EB" size={32} />,
      title: "Secure & Private",
      description: "Your medical data is protected with highest security standards"
    },
    {
      icon: <Users color="#059669" size={32} />,
      title: "Complete Family Care",
      description: "Manage health records for your entire family in one place"
    },
    {
      icon: <Clock color="#1D4ED8" size={32} />,
      title: "24/7 Support",
      description: "Get medical assistance whenever you need it most"
    }
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <LinearGradient
        colors={['#EBF8FF', '#F0FDF4', '#FFFFFF']}
        style={styles.heroSection}>
        <View style={styles.heroContent}>
          <Text style={styles.appTitle}>JeevanSetu</Text>
          <Text style={styles.tagline}>जीवन सेतु</Text>
          <Text style={styles.subtitle}>
            Your Bridge to Better Health
          </Text>
          <Text style={styles.description}>
            Connecting patients and doctors through modern technology 
            for comprehensive healthcare management
          </Text>
        </View>
        
        <Image
          source={{ uri: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg' }}
          style={styles.heroImage}
          resizeMode="cover"
        />
      </LinearGradient>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Why Choose JeevanSetu?</Text>
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={styles.featureIcon}>
                {feature.icon}
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>10K+</Text>
          <Text style={styles.statLabel}>Happy Patients</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>500+</Text>
          <Text style={styles.statLabel}>Expert Doctors</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>24/7</Text>
          <Text style={styles.statLabel}>Support</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <Text style={styles.actionTitle}>Get Started Today</Text>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.doctorButton]}
          onPress={() => router.push('/login?role=doctor')}>
          <LinearGradient
            colors={['#2563EB', '#1D4ED8']}
            style={styles.buttonGradient}>
            <UserCheck color="#FFFFFF" size={28} />
            <Text style={styles.buttonText}>Continue as Doctor</Text>
            <Text style={styles.buttonSubtext}>Professional Dashboard</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.patientButton]}
          onPress={() => router.push('/login?role=patient')}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.buttonGradient}>

              
            <Heart color="#FFFFFF" size={28} />
            <Text style={styles.buttonText}>Continue as Patient</Text>
            <Text style={styles.buttonSubtext}>Personal Health Hub</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Trusted by healthcare professionals across India
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  heroSection: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
    minHeight: height * 0.6,
  },
  heroContent: {
    alignItems: 'center',
    marginBottom: 30,
  },
  appTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#1E40AF',
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 20,
    color: '#059669',
    fontWeight: '600',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  heroImage: {
    width: width - 48,
    height: 200,
    borderRadius: 16,
    marginTop: 20,
  },
  featuresSection: {
    padding: 24,
    backgroundColor: '#F9FAFB',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 32,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: (width - 72) / 2,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIcon: {
    backgroundColor: '#F0FDF4',
    borderRadius: 50,
    padding: 16,
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 32,
    paddingHorizontal: 24,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D4ED8',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  actionSection: {
    padding: 32,
    backgroundColor: '#FFFFFF',
  },
  actionTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 32,
  },
  actionButton: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  doctorButton: {},
  patientButton: {},
  buttonGradient: {
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  buttonSubtext: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    padding: 24,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});