import React, { useState, useContext } from 'react';
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
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Mail, Lock } from 'lucide-react-native';
import { AuthContext } from '@/contexts/AuthContext';

export default function SignupScreen() {
  const { signup } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'doctor' | 'patient' | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !name || !role) {
      Alert.alert('Error', 'Please fill in all fields and select a role');
      return;
    }

    try {
      await signup(email, password, name, role);
      router.replace('/login');
    } catch (error) {
      Alert.alert('Error', 'Signup failed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft color="#374151" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#9CA3AF"
            />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#9CA3AF"
            />
            <View style={styles.passwordContainer}>
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
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <Text>Hide</Text>
                ) : (
                  <Text>Show</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.roleSelection}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'doctor' && styles.roleButtonSelected,
                ]}
                onPress={() => setRole('doctor')}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === 'doctor' && styles.roleButtonTextSelected,
                  ]}
                >
                  Doctor
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'patient' && styles.roleButtonSelected,
                ]}
                onPress={() => setRole('patient')}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === 'patient' && styles.roleButtonTextSelected,
                  ]}
                >
                  Patient
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleSignup}>
              <LinearGradient
                colors={['#2563EB', '#1D4ED8']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Sign Up</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
  form: {
    flex: 1,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#374151',
    marginBottom: 16,
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 18,
  },
  roleSelection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  roleButtonSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  roleButtonText: {
    fontSize: 16,
    color: '#374151',
  },
  roleButtonTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  primaryButton: {
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
});
