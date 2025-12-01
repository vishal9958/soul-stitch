import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { updateProfile } from 'firebase/auth';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useState } from 'react';
import {
  ActivityIndicator, Image,
  Keyboard,
  Platform,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { auth, storage } from '../../firebaseConfig';

export default function EditProfile() {
  const user = auth.currentUser;
  const router = useRouter();
  
  const [name, setName] = useState(user?.displayName || '');
  const [image, setImage] = useState(user?.photoURL || null); 
  const [uploading, setUploading] = useState(false); 
  const [loading, setLoading] = useState(false); 

  // --- 1. GALLERY OPEN KARNA ---
  const pickImage = async () => {
    if (Platform.OS === 'web') {
      Toast.show({ type: 'info', text1: 'Note', text2: 'Mobile app use karein photo change ke liye.' });
      return;
    }

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], // ✅ Updated Syntax
        allowsEditing: true,
        aspect: [1, 1], 
        quality: 0.5, // ✅ Quality kam ki taaki fast upload ho
      });

      if (!result.canceled) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Gallery open nahi hui.' });
    }
  };

  // --- 2. UPLOAD LOGIC (XHR METHOD - 100% WORKING) ---
  const uploadImage = async (uri: string) => {
    setUploading(true);
    try {
      // Step A: Image ko Blob (File) mein convert karna
      const blob: any = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function (e) {
          console.log(e);
          reject(new TypeError("Network request failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", uri, true);
        xhr.send(null);
      });

      // Step B: Firebase Storage Reference
      const filename = user ? `profile_pics/${user.uid}` : `profile_pics/${Date.now()}`;
      const storageRef = ref(storage, filename);
      
      // Step C: Upload karna
      await uploadBytes(storageRef, blob);
      
      // Step D: Memory free karna
      blob.close();

      // Step E: Naya URL lena
      const downloadURL = await getDownloadURL(storageRef);
      setImage(downloadURL); 
      
      // Step F: User Profile Update karna
      if(user) {
        await updateProfile(user, { photoURL: downloadURL });
        await user.reload(); 
      }
      
      Toast.show({ type: 'success', text1: 'Success! 📸', text2: 'Photo change ho gayi!' });

    } catch (error: any) {
      console.error("Upload Error:", error);
      Toast.show({ type: 'error', text1: 'Upload Failed', text2: 'Internet check karein.' });
    } finally {
      setUploading(false);
    }
  };

  // --- 3. NAME SAVE KARNA ---
  const handleUpdate = async () => {
    Keyboard.dismiss();
    if (!name.trim()) {
        Toast.show({ type: 'error', text1: 'Oops!', text2: 'Naam likhna zaruri hai.' });
        return;
    }
    setLoading(true);
    try {
      if (user) {
        await updateProfile(user, { displayName: name });
        await user.reload();
        
        Toast.show({
            type: 'success',
            text1: 'Saved! ✅',
            text2: 'Profile details update ho gayi.',
            onPress: () => router.back()
        });
      }
    } catch (error: any) {
        Toast.show({ type: 'error', text1: 'Error', text2: error.message });
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={{width: 28}}/>
      </View>

      <View style={styles.form}>
        
        {/* Photo Section */}
        <View style={{alignItems: 'center', marginBottom: 30}}>
            <TouchableOpacity onPress={pickImage} style={styles.imageContainer} disabled={uploading}>
                {uploading ? (
                    <ActivityIndicator size="large" color="#D65A31" />
                ) : image ? (
                    <Image source={{ uri: image }} style={styles.profileImage} />
                ) : (
                    <Text style={styles.initials}>{name ? name.charAt(0).toUpperCase() : "U"}</Text>
                )}
                
                <View style={styles.cameraIcon}>
                    <Ionicons name="camera" size={16} color="#fff" />
                </View>
            </TouchableOpacity>
            <Text style={{fontSize: 12, color: '#888', marginTop: 10}}>
              {uploading ? "Uploading..." : "Tap to change photo"}
            </Text>
        </View>

        {/* Inputs */}
        <Text style={styles.label}>Full Name</Text>
        <TextInput 
            style={styles.input} 
            value={name} 
            onChangeText={setName} 
            placeholder="Enter your name"
        />

        <Text style={styles.label}>Email (Locked)</Text>
        <TextInput 
            style={[styles.input, {backgroundColor: '#f0f0f0', color: '#888'}]} 
            value={user?.email || ''} 
            editable={false} 
        />

        {/* Save Button */}
        <TouchableOpacity style={styles.btn} onPress={handleUpdate} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.btnText}>Save Changes</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF5' },
  header: { 
    flexDirection: 'row', 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'android' ? 50 : 60, 
    paddingBottom: 20,
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#fff',
    elevation: 5,
    zIndex: 999, 
  },
  backBtn: { padding: 10, marginLeft: -10 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#D65A31' },
  form: { padding: 20 },
  imageContainer: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#FFE8D6', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#D65A31', position: 'relative' },
  profileImage: { width: 116, height: 116, borderRadius: 58 },
  initials: { fontSize: 40, fontWeight: 'bold', color: '#D65A31' },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#333', padding: 8, borderRadius: 20, borderWidth: 2, borderColor: '#fff' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 5, marginTop: 15 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', fontSize: 16 },
  btn: { backgroundColor: '#D65A31', padding: 15, borderRadius: 10, marginTop: 30, alignItems: 'center', elevation: 3 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});