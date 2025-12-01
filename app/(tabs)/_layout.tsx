import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { signOut } from 'firebase/auth';
// 👇 Modal aur useState add kiya hai
import React, { useState } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { auth } from '../../firebaseConfig';

function CustomDrawerContent(props: any) {
  const router = useRouter();
  const user = auth.currentUser;
  
  // 👇 1. MODAL STATE
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const userName = user?.email ? user.email.split('@')[0] : "Guest";
  const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);

  // 👇 2. ASLI LOGOUT FUNCTION
  const performLogout = async () => {
    setShowLogoutModal(false);
    await signOut(auth);
    router.replace('/login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFDF5' }}>
      
      {/* --- HEADER SECTION --- */}
      <View style={styles.drawerHeader}>
        <View style={styles.userInfoContainer}>
            <Image 
                source={require('../../assets/images/logo.png')} 
                style={styles.logoImage}
                resizeMode="cover" 
            />
            <View style={styles.userDetails}>
                <Text style={styles.userNameText}>Hi, {formattedName}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
        </View>
      </View>

      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 10 }}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <View style={styles.drawerFooter}>
        <TouchableOpacity 
            style={styles.logoutBtn} 
            // 👇 3. CHANGE: Alert ki jagah Modal open hoga
            onPress={() => setShowLogoutModal(true)}
        >
          <Ionicons name="log-out-outline" size={22} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        <Text style={styles.versionText}>v1.0.0 • Made with ❤️</Text>
      </View>

      {/* 👇 4. CUSTOM LOGOUT MODAL ADDED HERE 👇 */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            
            <View style={styles.modalIconBg}>
               <Ionicons name="log-out" size={32} color="#D65A31" />
            </View>

            <Text style={styles.modalTitle}>Log Out?</Text>
            <Text style={styles.modalMessage}>Are you sure you want to leave?</Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowLogoutModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.confirmBtn} onPress={performLogout}>
                <Text style={styles.confirmBtnText}>Yes, Logout</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </View>
  );
}

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerStyle: { backgroundColor: '#FFFDF5', elevation: 0, shadowOpacity: 0 },
          headerTintColor: '#D65A31',
          headerTitleStyle: { fontWeight: 'bold', color: '#333' },
          
          drawerActiveBackgroundColor: '#FFE8D6',
          drawerActiveTintColor: '#D65A31',
          drawerInactiveTintColor: '#333',
          
          drawerIconStyle: { marginRight: 0, width: 24 },
          drawerLabelStyle: { marginLeft: 20, fontSize: 15, fontWeight: '600' },
          drawerItemStyle: { borderRadius: 10, marginHorizontal: 10, marginBottom: 5 },
          drawerType: 'front',
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: "Home",
            title: "Soul & Stitch",
            drawerIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />,
          }}
        />
        <Drawer.Screen
          name="profile"
          options={{
            drawerLabel: "My Profile",
            title: "Profile",
            drawerIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />,
          }}
        />
        <Drawer.Screen name="explore" options={{ drawerItemStyle: { display: 'none' } }} />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 25,
    backgroundColor: '#FFE8D6',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  logoImage: {
    width: 85,
    height: 85,
    borderRadius: 42.5, 
    borderWidth: 2, 
    borderColor: '#fff', 
    backgroundColor: '#fff', 
  },
  userDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  userNameText: { 
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D65A31',
  },
  userEmail: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
    fontWeight: '500',
  },
  
  drawerFooter: { padding: 20, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#FFFDF5' },
  logoutBtn: { flexDirection: 'row', backgroundColor: '#D65A31', padding: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 15 },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  versionText: { textAlign: 'center', color: '#ccc', fontSize: 12 },

  // 👇 5. MODAL STYLES ADDED 👇
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '80%', backgroundColor: '#FFFDF5', borderRadius: 20, padding: 20, alignItems: 'center', elevation: 10 },
  modalIconBg: { backgroundColor: '#FFE8D6', padding: 15, borderRadius: 50, marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  modalMessage: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 25 },
  modalBtnRow: { flexDirection: 'row', gap: 15, width: '100%' },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  cancelBtnText: { color: '#555', fontWeight: 'bold' },
  confirmBtn: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#D65A31', alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontWeight: 'bold' }
});