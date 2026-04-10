import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import authApi from '../../api/authApi';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const DEPARTMENTS = [
  'Computer Science', 'Electrical Engineering', 'Mechanical Engineering',
  'Civil Engineering', 'Law', 'Business', 'Applied Sciences', 'Architecture'
];

export default function RegisterScreen({ navigation }: Props) {
  const [formData, setFormData] = useState({
    full_name: '',
    student_id: '',
    department: DEPARTMENTS[0],
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore(state => state.setAuth);

  const handleRegister = async () => {
    const { full_name, email, password, confirmPassword, department } = formData;

    if (!full_name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.register({
        full_name,
        email,
        password,
        department,
        student_id: formData.student_id
      });
      
      await setAuth(response.user, response.token);
      // Auth state change will trigger navigation in RootNavigator
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.title}>Join NUST Library</Text>
      
      <TextInput
        style={s.input}
        placeholder="Full Name"
        value={formData.full_name}
        onChangeText={(v) => setFormData({...formData, full_name: v})}
      />

      <TextInput
        style={s.input}
        placeholder="Student ID (Optional)"
        value={formData.student_id}
        onChangeText={(v) => setFormData({...formData, student_id: v})}
      />

      <View style={s.pickerContainer}>
        <Text style={s.label}>Department</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {DEPARTMENTS.map(dept => (
            <TouchableOpacity 
              key={dept} 
              onPress={() => setFormData({...formData, department: dept})}
              style={[s.deptBadge, formData.department === dept && s.deptBadgeActive]}
            >
              <Text style={[s.deptText, formData.department === dept && s.deptTextActive]}>{dept}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <TextInput
        style={s.input}
        placeholder="Email (@nust.ac.zw)"
        autoCapitalize="none"
        keyboardType="email-address"
        value={formData.email}
        onChangeText={(v) => setFormData({...formData, email: v})}
      />

      <TextInput
        style={s.input}
        placeholder="Password"
        secureTextEntry
        value={formData.password}
        onChangeText={(v) => setFormData({...formData, password: v})}
      />

      <TextInput
        style={s.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={formData.confirmPassword}
        onChangeText={(v) => setFormData({...formData, confirmPassword: v})}
      />

      <TouchableOpacity style={s.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Register</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={s.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { padding: 24, flexGrow: 1, backgroundColor: '#fff', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#185FA5', marginBottom: 32, textAlign: 'center' },
  input: { backgroundColor: '#f5f5f5', padding: 16, borderRadius: 12, marginBottom: 16, fontSize: 16 },
  label: { fontSize: 14, color: '#666', marginBottom: 8 },
  pickerContainer: { marginBottom: 16 },
  deptBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 8 },
  deptBadgeActive: { backgroundColor: '#185FA5' },
  deptText: { color: '#666' },
  deptTextActive: { color: '#fff' },
  button: { backgroundColor: '#185FA5', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  linkText: { color: '#185FA5', textAlign: 'center', marginTop: 24, fontSize: 16 }
});
