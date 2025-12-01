import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator, Alert,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { auth, db } from '../../firebaseConfig';

export default function WishlistScreen() {
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- 1. DATA FETCH KARNA ---
  const fetchWishlist = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      // User ke personal wishlist folder se data lao
      const querySnapshot = await getDocs(collection(db, "users", auth.currentUser.uid, "wishlist"));
      const items: any[] = [];
      
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      
      setWishlistItems(items);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  // --- 2. REMOVE ITEM ---
  const removeItem = async (id: string) => {
    if (!auth.currentUser) return;
    try {
      await deleteDoc(doc(db, "users", auth.currentUser.uid, "wishlist", id));
      Alert.alert("Removed", "Item removed from wishlist.");
      fetchWishlist(); // List refresh karo
    } catch (e) {
      Alert.alert("Error", "Could not remove item.");
    }
  };

  // Screen khulte hi data lao
  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#333" /></TouchableOpacity>
        <Text style={styles.title}>My Wishlist</Text>
        <View style={{width: 24}}/>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#D65A31" style={{marginTop: 50}} />
      ) : wishlistItems.length === 0 ? (
        // --- EMPTY STATE ---
        <View style={styles.emptyState}>
            <Ionicons name="heart-dislike-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>Your wishlist is empty.</Text>
            <Text style={styles.subText}>Save items you love here! ❤️</Text>
            <TouchableOpacity style={styles.shopBtn} onPress={() => router.replace('/(tabs)')}>
                <Text style={{color: '#fff', fontWeight: 'bold'}}>Start Shopping</Text>
            </TouchableOpacity>
        </View>
      ) : (
        // --- LIST OF ITEMS ---
        <FlatList 
          data={wishlistItems}
          keyExtractor={item => item.id}
          contentContainerStyle={{padding: 20}}
          renderItem={({item}) => (
            <TouchableOpacity 
              style={styles.card}
              // Card click karne par Product Details khulega
              onPress={() => router.push({ pathname: '/product-details', params: { ...item } })}
            >
              <Image 
                source={{ uri: item.image }} 
                style={styles.image} 
                resizeMode="cover" // Warning fix ke liye prop use kiya
              />
              
              <View style={styles.info}>
                  <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.price}>₹{item.price}</Text>
              </View>

              {/* Delete Button */}
              <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF5' },
  header: { flexDirection: 'row', padding: 20, paddingTop: 50, justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', elevation: 2 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#D65A31' },
  
  // Empty State
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: -50 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 10 },
  subText: { color: '#888', marginTop: 5 },
  shopBtn: { backgroundColor: '#D65A31', padding: 12, borderRadius: 20, marginTop: 20 },

  // Card Styles
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 10, borderRadius: 15, marginBottom: 15, alignItems: 'center', elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  image: { width: 70, height: 70, borderRadius: 12, marginRight: 15 },
  info: { flex: 1 },
  name: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  price: { color: '#D65A31', fontWeight: 'bold', marginTop: 4 },
  
  deleteBtn: { backgroundColor: '#FF6B6B', padding: 8, borderRadius: 10 }
});