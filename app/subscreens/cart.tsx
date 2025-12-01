import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { auth, db } from '../../firebaseConfig';

export default function CartScreen() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchCart = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users", auth.currentUser.uid, "cart"));
      const items: any[] = [];
      let totalPrice = 0;
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // FIX: Humne 'uniqueId' alag se banaya hai list ke liye
        // data.id = Product ID (Duplicate ho sakta hai)
        // doc.id = Cart Item ID (Hamesha Unique hoga)
        items.push({ ...data, uniqueId: doc.id }); 
        totalPrice += Number(data.price);
      });
      
      setCartItems(items);
      setTotal(totalPrice);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const removeItem = async (id: string) => {
    if (!auth.currentUser) return;
    // FIX: Unique Cart ID se delete karenge
    await deleteDoc(doc(db, "users", auth.currentUser.uid, "cart", id));
    fetchCart(); 
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#333" /></TouchableOpacity>
        <Text style={styles.title}>My Cart</Text>
        <View style={{width: 24}}/>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#D65A31" style={{marginTop: 50}} />
      ) : cartItems.length === 0 ? (
        <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={80} color="#ccc" />
            <Text style={{color: '#888', marginTop: 10}}>Your cart is empty.</Text>
        </View>
      ) : (
        <>
          <FlatList 
            data={cartItems}
            // FIX: Unique ID use kar rahe hain taaki error na aaye
            keyExtractor={item => item.uniqueId} 
            contentContainerStyle={{padding: 20}}
            renderItem={({item}) => (
              <View style={styles.card}>
                <Image 
                  source={{ uri: item.image }} 
                  style={styles.image} 
                  resizeMode="cover" // Warning fix
                />
                <View style={styles.info}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.price}>₹{item.price}</Text>
                </View>
                {/* FIX: Delete ke liye uniqueId bhej rahe hain */}
                <TouchableOpacity onPress={() => removeItem(item.uniqueId)}>
                    <Ionicons name="trash-outline" size={24} color="red" />
                </TouchableOpacity>
              </View>
            )}
          />
          
          {/* Footer Total & Checkout */}
          <View style={styles.footer}>
            <View>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalPrice}>₹{total}</Text>
            </View>
            <TouchableOpacity 
                style={styles.checkoutBtn}
                onPress={() => router.push({
                    pathname: '/subscreens/checkout',
                    params: { price: total, name: 'Cart Order' }
                })}
            >
                <Text style={styles.btnText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF5' },
  header: { flexDirection: 'row', padding: 20, paddingTop: 50, justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#D65A31' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 10, borderRadius: 15, marginBottom: 10, alignItems: 'center', elevation: 2 },
  image: { width: 60, height: 60, borderRadius: 10, marginRight: 15 },
  info: { flex: 1 },
  name: { fontWeight: 'bold', fontSize: 16 },
  price: { color: '#D65A31', fontWeight: 'bold' },
  footer: { flexDirection: 'row', padding: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'space-between', elevation: 10 },
  totalLabel: { color: '#888', fontSize: 12 },
  totalPrice: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  checkoutBtn: { backgroundColor: '#D65A31', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 20 },
  btnText: { color: '#fff', fontWeight: 'bold' }
});