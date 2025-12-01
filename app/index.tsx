import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { auth } from '../firebaseConfig';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // 2 Second ka artificial delay diya taaki user sundar logo dekh sake
    // (Warna fast internet pe logo jhapki lete hi gayab ho jayega)
    const checkLogin = setTimeout(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          router.replace('/(tabs)');
        } else {
          router.replace('/login');
        }
      });
      return () => unsubscribe();
    }, 2000); 

    return () => clearTimeout(checkLogin);
  }, []);

  return (
    <View style={styles.container}>
      
      {/* --- BRAND LOGO SECTION --- */}
      <View style={styles.logoContainer}>
        <View style={styles.iconCircle}>
          {/* Crochet jaisa dikhne wala aesthetic flower icon */}
          <Ionicons name="rose-outline" size={60} color="#D65A31" />
        </View>
        
        <Text style={styles.title}>SOUL & STITCH</Text>
        <Text style={styles.tagline}>Knitting warmth into every thread 🧶</Text>
      </View>

      {/* --- LOADER AT BOTTOM --- */}
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#D65A31" />
        <Text style={styles.loadingText}>Starting up...</Text>
      </View>

      {/* --- FOOTER DECORATION --- */}
      <Text style={styles.footerText}>© 2025 Soul & Stitch</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'space-between', // Upar Logo, Beech mein kuch nahi, Niche Loader
    alignItems: 'center', 
    backgroundColor: '#FFFDF5', // Cream Background
    paddingVertical: 60,
  },
  
  // LOGO STYLES
  logoContainer: {
    alignItems: 'center',
    marginTop: 100, // Thoda niche shift kiya
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFE8D6', // Light Peach Circle
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#D65A31', // Terracotta Border
    elevation: 10, // Shadow effect
    shadowColor: '#D65A31',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '900', // Extra Bold
    color: '#D65A31',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  tagline: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 5,
  },

  // LOADER STYLES
  loaderContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#D65A31',
    fontWeight: '600',
    fontSize: 12,
  },

  // FOOTER
  footerText: {
    fontSize: 10,
    color: '#CCC',
    letterSpacing: 1,
  }
});