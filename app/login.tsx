import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
  // Dhyan de: Yahan se 'SafeAreaView' hata diya hai maine
} from 'react-native';

// ✅ CORRECT IMPORT (Isse warning nahi aayegi aur VS Code delete nahi karega)
import { SafeAreaView } from 'react-native-safe-area-context';

import Toast from 'react-native-toast-message';
import { auth } from '../firebaseConfig';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
  if (email === '' || password === '') {
    Toast.show({ type: 'error', text1: 'Missing Fields', text2: 'Please fill email & password.' });
    return;
  }
  setLoading(true);
  try {
    await signInWithEmailAndPassword(auth, email, password);
    setLoading(false);
    
    // Login Success Toast
    Toast.show({ type: 'success', text1: 'Welcome Back! 👋', text2: 'Logging you in...' });
    
    setTimeout(() => router.replace('/(tabs)'), 1000); // Thoda ruk ke bhejo taaki toast dikhe
  } catch (error: any) {
    setLoading(false);
    Toast.show({ type: 'error', text1: 'Login Failed', text2: 'Email ya Password galat hai.' });
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.responsiveBox}>
          
          {/* --- BRANDING --- */}
          <View style={styles.header}>
            <Text style={styles.brandName}>SOUL & STITCH</Text>
            <Text style={styles.tagline}>Crafted with Soul 🧶</Text>
          </View>

          {/* --- FORM --- */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="hello@soulstitch.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {/* BUTTON */}
            {loading ? (
              <ActivityIndicator size="large" color="#D65A31" style={{marginTop: 20}} />
            ) : (
              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Log In</Text>
              </TouchableOpacity>
            )}

            {/* SIGNUP LINK */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>New here? </Text>
              <TouchableOpacity onPress={() => router.push('/signup')}>
                <Text style={styles.link}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>

        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}

// ✨ RESPONSIVE STYLES
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFDF5' 
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  responsiveBox: {
    width: '100%',
    maxWidth: 450, 
    alignSelf: 'center', 
    backgroundColor: '#fff', 
    padding: 25,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5, 
  },
  header: { alignItems: 'center', marginBottom: 40 },
  brandName: { fontSize: 28, fontWeight: '900', color: '#D65A31', letterSpacing: 1.5 },
  tagline: { fontSize: 16, color: '#888', fontStyle: 'italic', marginTop: 5 },
  
  form: { width: '100%' },
  inputContainer: { marginBottom: 15 },
  label: { fontSize: 14, color: '#333', fontWeight: '700', marginBottom: 8, marginLeft: 4 },
  input: {
    backgroundColor: '#FAFAFA', padding: 16, borderRadius: 12, fontSize: 16, color: '#333',
    borderWidth: 1, borderColor: '#EEE'
  },
  button: {
    backgroundColor: '#D65A31', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10,
    shadowColor: "#D65A31", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
  footerText: { color: '#666', fontSize: 15 },
  link: { color: '#D65A31', fontWeight: 'bold', fontSize: 15 },
});