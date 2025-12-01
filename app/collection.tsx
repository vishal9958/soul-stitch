import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { db } from '../firebaseConfig';
// 1. Stylish Font Import
import { Pacifico_400Regular, useFonts } from '@expo-google-fonts/pacifico';

interface Product {
  id: string;
  name: string;
  price: number | string;
  image: string;
  desc?: string;
  category?: string;
}

export default function SeasonalCollectionScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 2. Font Load
  let [fontsLoaded] = useFonts({ Pacifico_400Regular });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsList: Product[] = [];
        querySnapshot.forEach((doc) => {
          productsList.push({ id: doc.id, ...doc.data() } as Product);
        });
        setProducts(productsList);
        setLoading(false);
      } catch (error) {
        console.error("Error: ", error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // --- REUSABLE PRODUCT CARD (SAME AS HOME) ---
  const ProductCard = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => router.push({ pathname: '/product-details', params: { ...item } })}
    >
      <View style={styles.wishlistBtn}>
        <Ionicons name="snow-outline" size={18} color="#D65A31" />
      </View>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardDesc} numberOfLines={1}>Premium Wool</Text>
        <View style={styles.priceRow}>
          <Text style={styles.cardPrice}>₹{item.price}</Text>
          <View style={styles.addBtn}>
             <Ionicons name="add" size={20} color="#fff" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // --- SEASON SECTION COMPONENT ---
  const SeasonSection = ({ title, data, icon, color }: any) => {
    if (data.length === 0) return null;
    
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
            <Ionicons name={icon} size={24} color={color} />
            <Text style={[styles.sectionTitle, {color: color}]}>{title}</Text>
        </View>
        <FlatList
          horizontal
          data={data}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          renderItem={({ item }) => <ProductCard item={item} />}
        />
      </View>
    );
  };

  if (loading || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D65A31" />
      </View>
    );
  }

  // Categories Filter
  const winterItems = products.filter(item => item.category === 'Winter');
  const summerItems = products.filter(item => item.category === 'Summer');
  const monsoonItems = products.filter(item => item.category === 'Monsoon');

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seasonal Collections</Text>
        <View style={{width: 26}} /> 
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
          
          {/* 1. WINTER SECTION */}
          <SeasonSection 
              title="Winter Collection" 
              data={winterItems} 
              icon="snow" 
              color="#00a8ff" // Icy Blue
          />

          {/* 2. SUMMER SECTION */}
          <SeasonSection 
              title="Summer Collection" 
              data={summerItems} 
              icon="sunny" 
              color="#fbc531" // Sunny Yellow
          />

          {/* 3. MONSOON SECTION */}
          <SeasonSection 
              title="Monsoon Collection" 
              data={monsoonItems} 
              icon="rainy" 
              color="#4cd137" // Fresh Green
          />

          {/* EMPTY STATE */}
          {products.length > 0 && winterItems.length === 0 && summerItems.length === 0 && (
              <View style={{alignItems: 'center', marginTop: 100}}>
                  <Ionicons name="leaf-outline" size={50} color="#ccc" />
                  <Text style={{color: '#888', marginTop: 10}}>No seasonal items found.</Text>
                  <Text style={{fontSize: 12, color: '#ccc'}}>Add 'Winter' or 'Summer' category in Firebase</Text>
              </View>
          )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFDF5' },

  // HEADER
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, paddingTop: Platform.OS === 'android' ? 50 : 60, 
    backgroundColor: '#FFFDF5', // Match background
    elevation: 0 // Flat look
  },
  backBtn: { padding: 5 },
  headerTitle: { 
    fontSize: 26, 
    color: '#D65A31', 
    fontFamily: 'Pacifico_400Regular', // Stylish Font
  },

  // SECTIONS
  sectionContainer: { marginTop: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15, gap: 10 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold' },

  // CARD STYLES (MATCHING HOME PAGE)
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    overflow: 'hidden', 
    marginRight: 15, 
    width: 170, 
    height: 260, // Fixed Height
    elevation: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6,
    marginBottom: 15,
    borderWidth: 1, borderColor: '#f0f0f0'
  },
  wishlistBtn: { position: 'absolute', top: 10, right: 10, zIndex: 1, backgroundColor: 'rgba(255,255,255,0.9)', padding: 6, borderRadius: 20 },
  cardImage: { 
    width: '100%', height: 150, resizeMode: 'contain', 
    backgroundColor: '#f9f9f9' 
  },
  cardInfo: { 
    padding: 12, flex: 1, justifyContent: 'space-between' 
  },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  cardDesc: { fontSize: 11, color: '#888' },
  
  priceRow: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' 
  },
  cardPrice: { fontSize: 16, fontWeight: 'bold', color: '#D65A31' },
  addBtn: { backgroundColor: '#333', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 }
});