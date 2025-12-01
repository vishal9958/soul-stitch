import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../firebaseConfig';

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const q = query(collection(db, "orders"), where("userId", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const orderList: any[] = [];
      querySnapshot.forEach((doc) => {
        orderList.push({ id: doc.id, ...doc.data() });
      });
      // Latest order upar dikhega
      setOrders(orderList.reverse());
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <View style={styles.container}>
       <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#333" /></TouchableOpacity>
        <Text style={styles.title}>My Orders</Text>
        <View style={{width: 24}}/>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#D65A31" style={{marginTop: 50}} />
      ) : (
        <FlatList 
          data={orders}
          keyExtractor={item => item.id}
          contentContainerStyle={{padding: 20}}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Ionicons name="bag-remove-outline" size={60} color="#ccc" />
                <Text style={styles.emptyText}>No orders yet.</Text>
                <TouchableOpacity style={styles.shopBtn} onPress={() => router.replace('/(tabs)')}>
                    <Text style={{color: '#fff', fontWeight: 'bold'}}>Start Shopping</Text>
                </TouchableOpacity>
            </View>
          }
          renderItem={({item}) => (
            <View style={styles.card}>
              <View style={styles.row}>
                  {/* ✅ FIX: Image Show Hogi */}
                  <Image 
                    source={{ uri: item.orderImage || 'https://placehold.co/100' }} 
                    style={styles.orderImage} 
                  />
                  <View style={{flex: 1, marginLeft: 15}}>
                      {/* ✅ FIX: Sahi fields use kiye hain */}
                      <Text style={styles.itemName}>{item.items}</Text>
                      <Text style={styles.price}>₹{item.totalAmount}</Text>
                      <Text style={styles.date}>Date: {item.date}</Text>
                  </View>
              </View>
              
              <View style={styles.footerRow}>
                <View style={[styles.statusBadge, {backgroundColor: '#FFF3E0'}]}>
                    <Text style={{color: '#D65A31', fontWeight: 'bold', fontSize: 12}}>{item.status}</Text>
                </View>
                <Text style={styles.paymentText}>{item.paymentMethod}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF5' },
  header: { flexDirection: 'row', padding: 20, paddingTop: 50, justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#D65A31' },
  
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 15, elevation: 3 },
  row: { flexDirection: 'row', alignItems: 'center' },
  orderImage: { width: 70, height: 70, borderRadius: 10, backgroundColor: '#eee' },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  price: { fontSize: 16, fontWeight: 'bold', color: '#D65A31', marginTop: 2 },
  date: { color: '#888', fontSize: 12, marginTop: 5 },
  
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 5 },
  paymentText: { color: '#888', fontSize: 12 },

  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 10 },
  shopBtn: { backgroundColor: '#D65A31', padding: 12, borderRadius: 20, marginTop: 20 }
});