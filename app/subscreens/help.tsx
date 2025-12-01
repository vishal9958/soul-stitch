import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Linking, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { auth, db } from '../../firebaseConfig';

export default function HelpScreen() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submitTicket = async () => {
  if (!message.trim()) {
    Toast.show({ type: 'error', text1: 'Empty Message', text2: 'Kuch likho toh sahi bhai!' });
    return;
  }

    setLoading(true);
    try {
      await addDoc(collection(db, "support_tickets"), {
        userId: auth.currentUser?.uid,
        userEmail: auth.currentUser?.email,
        message: message,
        date: new Date().toISOString(),
        status: 'Pending'
      });
      
      // Success Toast
    Toast.show({
      type: 'success',
      text1: 'Message Sent! 📨',
      text2: 'Team will contact you soon.',
    });
    setMessage(""); 
  } catch (error) {
    Toast.show({ type: 'error', text1: 'Error', text2: 'Message fail ho gaya.' });
  }
  setLoading(false);
};

  // --- 👇 WHATSAPP LOGIC UPDATED 👇 ---
  const openWhatsApp = () => {
    // 1. Tera Number (Country code 91 ke saath)
    const phoneNumber = '919318395641'; 
    
    // 2. Wo message jo automatically likha hua aayega
    const text = "Hello Soul & Stitch! 🧶 I need help with my order.";

    // 3. Link banana (Direct Chat ke liye)
    // encodeURIComponent zaruri hai taaki spaces aur special characters sahi se kaam karein
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(text)}`;

    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Make sure WhatsApp is installed on your device.');
    });
  };

  return (
    <View style={styles.container}>
       <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#333" /></TouchableOpacity>
        <Text style={styles.title}>Help Center</Text>
        <View style={{width: 24}}/>
      </View>

      <View style={styles.content}>
        <Text style={styles.desc}>Having issues? Send us a message directly to our database.</Text>

        <TextInput 
          style={styles.input} 
          placeholder="Describe your issue..." 
          multiline 
          numberOfLines={4} 
          value={message}
          onChangeText={setMessage}
        />
        
        <TouchableOpacity style={styles.btn} onPress={submitTicket}>
          {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.btnText}>Submit Ticket</Text>}
        </TouchableOpacity>

        <View style={styles.divider} />

        <Text style={styles.label}>Direct Contact:</Text>
        
        {/* WhatsApp Button */}
        <TouchableOpacity style={styles.whatsappBtn} onPress={openWhatsApp}>
          <Ionicons name="logo-whatsapp" size={24} color="#fff" />
          <Text style={styles.whatsappText}>Chat on WhatsApp</Text>
        </TouchableOpacity>
        
        {/* Number Display (Optional) */}
        <Text style={{textAlign: 'center', marginTop: 10, color: '#888'}}>+91 93183 95641</Text>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF5' },
  header: { flexDirection: 'row', padding: 20, paddingTop: 50, justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#D65A31' },
  content: { padding: 20 },
  desc: { color: '#666', marginBottom: 20 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', height: 100, textAlignVertical: 'top' },
  btn: { backgroundColor: '#333', padding: 15, borderRadius: 10, marginTop: 15, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#ddd', marginVertical: 30 },
  label: { fontWeight: 'bold', marginBottom: 10 },
  whatsappBtn: { flexDirection: 'row', backgroundColor: '#25D366', padding: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center', gap: 10 },
  whatsappText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});