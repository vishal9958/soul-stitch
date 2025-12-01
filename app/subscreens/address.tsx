import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../firebaseConfig';

export default function AddressScreen() {
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const router = useRouter();

  const saveAddress = async () => {
    if(!address || !city || !pincode) { alert("Please fill all details"); return; }
    try {
      const user = auth.currentUser;
      if (user) {
        // User ke naam pe document banega
        await setDoc(doc(db, "users", user.uid), {
          shippingAddress: { address, city, pincode }
        }, { merge: true });
        Alert.alert("Saved", "Address updated successfully!");
        router.back();
      }
    } catch (e) { alert("Error saving address"); }
  };

  return (
    <ScrollView style={styles.container}>
       <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#333" /></TouchableOpacity>
        <Text style={styles.title}>Shipping Address</Text>
        <View style={{width: 24}}/>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Street Address / House No.</Text>
        <TextInput style={styles.input} placeholder="e.g. 123, Crochet Lane" value={address} onChangeText={setAddress} multiline />

        <Text style={styles.label}>City</Text>
        <TextInput style={styles.input} placeholder="Gurugram" value={city} onChangeText={setCity} />

        <Text style={styles.label}>Pincode</Text>
        <TextInput style={styles.input} placeholder="122001" keyboardType="numeric" value={pincode} onChangeText={setPincode} />

        <TouchableOpacity style={styles.btn} onPress={saveAddress}>
          <Text style={styles.btnText}>Save Address</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
// Styles same as EditProfile (Copy paste kar lena upar wale styles)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF5' },
  header: { flexDirection: 'row', padding: 20, paddingTop: 50, justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#D65A31' },
  form: { padding: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 5, marginTop: 15 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#ddd' },
  btn: { backgroundColor: '#D65A31', padding: 15, borderRadius: 10, marginTop: 30, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});