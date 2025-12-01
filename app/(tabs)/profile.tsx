import { Ionicons } from '@expo/vector-icons'; // Inbuilt Icons
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import React from 'react';
import {
  Alert, Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../firebaseConfig'; // Path check kar lena (../../ sahi hai agar root mein file hai)
export default function ProfileScreen() {
  const router = useRouter();
  const user = auth.currentUser; // Logged in user ka data

  // Agar user ka naam nahi set hai toh Email ka pehla hissa dikha do
  const displayName = user?.displayName || user?.email?.split('@')[0] || "User";
  const userEmail = user?.email || "No Email";
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    // Web aur Mobile dono ke liye alag style
    if (Platform.OS === 'web') {
      signOut(auth).then(() => router.replace('/login'));
    } else {
      Alert.alert(
        "Logout",
        "Are you sure you want to leave?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Logout", 
            style: 'destructive',
            onPress: async () => {
              await signOut(auth);
              router.replace('/login'); 
            } 
          }
        ]
      );
    }
  };

  // Helper Component for Menu Items
  const MenuItem = ({ icon, title, subtitle, onPress }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={24} color="#D65A31" />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.responsiveBox}>

          {/* --- HEADER SECTION --- */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userEmail}>{userEmail}</Text>
            
            <TouchableOpacity 
              style={styles.editBtn}
              onPress={() => router.push('/subscreens/edit-profile')} 
            >
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* --- MENU OPTIONS --- */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>My Account</Text>
            
            <MenuItem 
              icon="bag-handle-outline" 
              title="My Orders" 
              subtitle="Track your crochet parcels" 
              onPress={() => router.push('/subscreens/orders')}
            />
            <MenuItem 
              icon="heart-outline" 
              title="Wishlist" 
              subtitle="Your favorite items" 
              onPress={() => router.push('/subscreens/wishlist')}
            />
            <MenuItem 
              icon="location-outline" 
              title="Shipping Address" 
              subtitle="Manage delivery locations" 
              onPress={() => router.push('/subscreens/address')}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Support</Text>
            <MenuItem 
              icon="call-outline" 
              title="Help Center" 
              onPress={() => router.push('/subscreens/help')}
            />
          </View>

          {/* --- LOGOUT BUTTON --- */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#fff" style={{marginRight: 8}} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ✨ STYLES (Soul & Stitch Theme)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF5' },
  scrollContainer: { paddingBottom: 30 },
  
  // WEB RESPONSIVE
  responsiveBox: {
    width: '100%',
    maxWidth: 500, // Laptop pe center mein rahega
    alignSelf: 'center',
    padding: 20,
  },

  // HEADER
  header: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  avatarContainer: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#FFD3B6', 
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2, borderColor: '#D65A31',
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 5,
  },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: '#D65A31' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  userEmail: { fontSize: 14, color: '#888', marginBottom: 15 },
  editBtn: { borderWidth: 1, borderColor: '#333', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  editBtnText: { fontSize: 12, fontWeight: '600', color: '#333' },

  // MENU
  section: { marginBottom: 25 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10, marginLeft: 5 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  iconBox: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFF0E5',
    justifyContent: 'center', alignItems: 'center', marginRight: 15
  },
  menuTextContainer: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  menuSubtitle: { fontSize: 12, color: '#999', marginTop: 2 },

  // LOGOUT
  logoutButton: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#D65A31',
    padding: 16, borderRadius: 16,
    marginTop: 10,
    shadowColor: "#D65A31", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});