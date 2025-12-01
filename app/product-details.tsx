import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { deleteDoc, doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { auth, db } from '../firebaseConfig';

export default function ProductDetails() {
  // Pichle page se jo data bheja tha, wo yahan receive hoga
  const product = useLocalSearchParams(); 
  const router = useRouter();
  const user = auth.currentUser;
  const [liked, setLiked] = useState(false);

 // --- WISHLIST LOGIC (TOAST KE SAATH) ---
  const toggleWishlist = async () => {
    if (!user) { 
        // 👇 Old Alert hata diya, New Toast lagaya
        Toast.show({ type: 'error', text1: 'Login Required', text2: 'Please login to save items.' });
        return; 
    }
    
    if (!product.id) return;

    const wishlistRef = doc(db, "users", user.uid, "wishlist", product.id as string);
    
    try {
      if (liked) {
        await deleteDoc(wishlistRef);
        setLiked(false);
        // 👇 Red Toast (Removed)
        Toast.show({ type: 'error', text1: 'Removed 💔', text2: 'Item removed from wishlist.' });
      } else {
        await setDoc(wishlistRef, {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category || 'General'
        });
        setLiked(true);
        // 👇 Green/Orange Toast (Saved)
        Toast.show({ type: 'success', text1: 'Saved ❤️', text2: 'Added to your Wishlist!' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Something went wrong.' });
    }
  };

  // --- ADD TO CART LOGIC (TOAST KE SAATH) ---
  const handleAddToCart = async () => {
      if (!user) { 
        Toast.show({ type: 'error', text1: 'Login Required', text2: 'Please login first.' });
        return; 
      }
      try {
        await addDoc(collection(db, "users", user.uid, "cart"), { ...product, qty: 1 });
        
        // 👇 CART SUCCESS TOAST
        Toast.show({ 
            type: 'success', 
            text1: 'Added to Cart 🛒', 
            text2: `${product.name} added! Click to view.`,
            onPress: () => router.push('/subscreens/cart') // Click karne pe Cart khulega
        });

      } catch (error) {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Could not add to cart.' });
      }
  };

  // --- BUY NOW ---
  const handleBuy = () => {
    if (!user) { 
        Toast.show({ type: 'error', text1: 'Login Required', text2: 'Please login to buy.' });
        return; 
    }
    router.push({
      pathname: '/subscreens/checkout',
      params: { 
        name: product.name, 
        price: product.price,
        image: product.image,
        id: product.id
      }
    });
  };

  return (
    <View style={styles.container}>
      
      {/* Header (Back Button) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Details</Text>
        <TouchableOpacity onPress={toggleWishlist} style={styles.iconBtn}>
          <Ionicons name={liked ? "heart" : "heart-outline"} size={24} color="#D65A31" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{paddingBottom: 100}} showsVerticalScrollIndicator={false}>
        
        {/* Badi Image */}
        <Image source={{ uri: product.image as string }} style={styles.image} resizeMode="cover" />

        <View style={styles.infoContainer}>
          <View style={styles.row}>
            <Text style={styles.name}>{product.name}</Text>
            <Text style={styles.price}>₹{product.price}</Text>
          </View>

          {/* Category Tag */}
          <View style={styles.tag}>
            <Text style={styles.tagText}>{product.category || "Handmade"}</Text>
          </View>

          <Text style={styles.descTitle}>Description</Text>
          <Text style={styles.desc}>
            {product.desc || "This is a premium handmade crochet item made with high-quality milk cotton yarn. Soft, durable, and made with love. Perfect for gifting or personal use."}
          </Text>

          {/* Delivery Info Box */}
          <View style={styles.deliveryBox}>
            <Ionicons name="car-outline" size={24} color="#D65A31" />
            <Text style={styles.deliveryText}>Free Delivery within 5-7 days.</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.cartBtn} onPress={() => Alert.alert("Cart", "Added to Cart!")}>
            <Ionicons name="cart-outline" size={24} color="#D65A31" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyBtn} onPress={handleBuy}>
            <Text style={styles.buyText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF5' },
  // Header ko safe area ke niche lane ke liye top padding badhai
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', 
    padding: 20, paddingTop: Platform.OS === 'android' ? 50 : 60, 
    position: 'absolute', width: '100%', zIndex: 10 
  },
  iconBtn: { backgroundColor: 'rgba(255,255,255,0.9)', padding: 10, borderRadius: 20, elevation: 5 },
  headerTitle: { display: 'none' }, 
  
  image: { width: '100%', height: 450, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  
  infoContainer: { padding: 25 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  name: { fontSize: 26, fontWeight: 'bold', color: '#333', flex: 1 },
  price: { fontSize: 26, fontWeight: 'bold', color: '#D65A31' },
  
  tag: { backgroundColor: '#FFE8D6', alignSelf: 'flex-start', paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20, marginBottom: 20 },
  tagText: { color: '#D65A31', fontWeight: 'bold', fontSize: 14 },
  
  descTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  desc: { fontSize: 15, color: '#666', lineHeight: 24, marginBottom: 25 },
  
  deliveryBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 15, gap: 15, elevation: 2 },
  deliveryText: { color: '#555', fontWeight: '500', fontSize: 14 },

  bottomBar: { position: 'absolute', bottom: 0, width: '100%', flexDirection: 'row', padding: 20, paddingBottom: 30, backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, elevation: 20, shadowColor: '#000', shadowOffset: {width: 0, height: -5}, shadowOpacity: 0.1, shadowRadius: 10 },
  cartBtn: { backgroundColor: '#FFE8D6', padding: 18, borderRadius: 20, marginRight: 15, justifyContent: 'center', alignItems: 'center' },
  buyBtn: { flex: 1, backgroundColor: '#D65A31', padding: 18, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  buyText: { color: '#fff', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 }
});