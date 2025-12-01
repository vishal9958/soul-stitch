import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView, Platform,

  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { auth } from '../firebaseConfig';

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
  if (!email || !password || !name) {
    Toast.show({ type: 'error', text1: 'Missing Details', text2: 'Please fill all fields.' });
    return;
  }
  setLoading(true);
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    setLoading(false);
    
    // Success Toast
    Toast.show({
      type: 'success',
      text1: 'Account Created! 🎉',
      text2: 'Welcome to the family.',
    });

    setTimeout(() => router.replace('/(tabs)'), 1500);
  } catch (error: any) {
    setLoading(false);
    Toast.show({ type: 'error', text1: 'Signup Failed', text2: error.message });
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.responsiveBox}>
          
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the Soul & Stitch family ✨</Text>
          </View>

          <View style={styles.form}>
            {/* NAME INPUT */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
            </View>

            {/* PHONE INPUT */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mobile Number</Text>
              <TextInput style={styles.input} placeholder="Phone number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
            </View>

            {/* EMAIL INPUT */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
            </View>
            
            {/* PASSWORD INPUT */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
            </View>

            {loading ? (
              <ActivityIndicator size="large" color="#D65A31" style={{marginTop: 20}} />
            ) : (
              <TouchableOpacity style={styles.button} onPress={handleSignup}>
                <Text style={styles.buttonText}>Sign Up</Text>
              </TouchableOpacity>
            )}

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.link}>Login here</Text>
              </TouchableOpacity>
            </View>
          </View>

        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles Login jaise hi same rahenge consistency ke liye
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF5' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  responsiveBox: {
    width: '100%', maxWidth: 450, alignSelf: 'center', backgroundColor: '#fff',
    padding: 25, borderRadius: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 10, elevation: 5,
  },
  header: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 26, fontWeight: '800', color: '#D65A31' },
  subtitle: { fontSize: 16, color: '#888', marginTop: 5 },
  form: { width: '100%' },
  inputContainer: { marginBottom: 15 },
  label: { fontSize: 14, color: '#333', fontWeight: '700', marginBottom: 5, marginLeft: 2 },
  input: { backgroundColor: '#FAFAFA', padding: 15, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: '#EEE' },
  button: { backgroundColor: '#D65A31', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, elevation: 5 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
  footerText: { color: '#666', fontSize: 15 },
  link: { color: '#D65A31', fontWeight: 'bold', fontSize: 15 },
});