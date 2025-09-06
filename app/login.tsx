import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const { role } = useLocalSearchParams<{ role: string }>();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await login(email, password, role as 'doctor' | 'patient');
      router.replace('/');
    } catch (error) {
      Alert.alert('Error', 'Invalid credentials');
    }
  };

  const handleSignup = () => {
    router.push('/signup');
  };

  const isDoctorLogin = role === 'doctor';

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}>
            <ArrowLeft color="#374151" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isDoctorLogin ? 'Doctor Login' : 'Patient Login'}
          </Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </Text>
            <Text style={styles.subtitle}>
              {isDoctorLogin 
                ? 'Access your professional dashboard' 
                : 'Manage your health journey'
              }
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Mail color="#9CA3AF" size={20} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Lock color="#9CA3AF" size={20} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff color="#9CA3AF" size={20} />
                ) : (
                  <Eye color="#9CA3AF" size={20} />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
              <LinearGradient
                colors={isDoctorLogin ? ['#2563EB', '#1D4ED8'] : ['#10B981', '#059669']}
                style={styles.buttonGradient}>
                <Text style={styles.buttonText}>
                  {isSignup ? 'Sign Up' : 'Sign In'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Removed Google login button as per request */}
            {/* <TouchableOpacity
              style={styles.googleButton}
              onPress={async () => {
                try {
                  await loginWithGoogle(role as 'doctor' | 'patient');
                } catch (error) {
                  Alert.alert('Error', 'Google login failed');
                }
              }}>
              <View style={styles.googleButtonContent}>
                <Chrome color="#4285F4" size={20} />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </View>
            </TouchableOpacity> */}

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/signup')}>
              <Text style={styles.secondaryButtonText}>
                {isSignup 
                  ? 'Already have an account? Sign In' 
                  : "Don't have an account? Sign Up"
                }
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Demo Credentials */}
        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>Demo Credentials:</Text>
          <Text style={styles.demoText}>
            Email: {isDoctorLogin ? 'doctor@demo.com' : 'patient@demo.com'}
          </Text>
          <Text style={styles.demoText}>Password: demo123</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#374151',
  },
  eyeIcon: {
    padding: 4,
  },
  primaryButton: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '500',
  },
  demoSection: {
    backgroundColor: '#F3F4F6',
    margin: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  googleButton: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    alignItems: 'center',
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
});
