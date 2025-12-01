import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { addDoc, collection, doc, getDocs, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { auth, db } from '../../firebaseConfig';

interface Product {
  id: string;
  name: string;
  price: number | string;
  image: string;
  desc?: string;
  category?: string;
  isTrending?: boolean;
}

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  
  const { width } = useWindowDimensions();
  const router = useRouter();
  const isWeb = width > 768;
  const user = auth.currentUser;

  // Grid Calculation
  const gridCardWidth = (width - 55) / 2; 

  const categories = [
    { id: 1, name: "All", icon: "grid-outline" },
    { id: 2, name: "Toys", icon: "happy-outline" },
    { id: 3, name: "Bags", icon: "bag-handle-outline" },
    { id: 4, name: "Decor", icon: "rose-outline" },
    { id: 5, name: "Wear", icon: "shirt-outline" },
    { id: 6, name: "Winter", icon: "snow-outline" },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsList: Product[] = [];
        querySnapshot.forEach((doc) => {
          productsList.push({ id: doc.id, ...doc.data() } as Product);
        });
        setProducts(productsList);
        setFilteredProducts(productsList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products: ", error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // --- 🛒 ADD TO CART (NEW STYLE) ---
  const addToCart = async (item: Product) => {
    if (!user) { 
        Toast.show({
            type: 'error',
            text1: 'Login Required',
            text2: 'Please login to shop 🧶'
        });
        return; 
    }
    
    try {
      await addDoc(collection(db, "users", user.uid, "cart"), { ...item, qty: 1 });
      
      // ✨ YEH HAI NAYA MAGIC ALERT
      Toast.show({
        type: 'success', // Humara custom design use karega
        text1: 'Added to Cart! 🛒',
        text2: `${item.name} is waiting for you.`,
        visibilityTime: 3000,
        onPress: () => router.push('/subscreens/cart') // Click karne pe Cart khulega
      });

    } catch (error) { 
        Toast.show({ type: 'error', text1: 'Oops!', text2: 'Could not add to cart.' });
    }
  };

  // --- ❤️ ADD TO WISHLIST (NEW STYLE) ---
  const addToWishlist = async (item: Product) => {
    if (!user) { 
        Toast.show({ type: 'error', text1: 'Login Required', text2: 'Please login first.' }); 
        return; 
    }
    
    try {
      await setDoc(doc(db, "users", user.uid, "wishlist", item.id), item);
      
      // ✨ NEW STYLE
      Toast.show({
        type: 'success',
        text1: 'Saved to Wishlist ❤️',
        text2: 'You have good taste!',
        visibilityTime: 3000,
        onPress: () => router.push('/subscreens/wishlist')
      });

    } catch (error) { 
        Toast.show({ type: 'error', text1: 'Error', text2: 'Could not save.' });
    }
  };
  const handleSearch = (text: string) => {
    setSearchText(text);
    filterData(text, selectedCategory);
  };

  const handleCategoryPress = (catName: string) => {
    setSelectedCategory(catName);
    filterData(searchText, catName);
  };

  const filterData = (text: string, category: string) => {
    let data = products;
    if (category !== 'All') {
      data = data.filter(item => item.category === category);
    }
    if (text) {
      data = data.filter(item => item.name.toLowerCase().includes(text.toLowerCase()));
    }
    setFilteredProducts(data);
  };

  const ProductCard = ({ item, style }: { item: Product, style?: any }) => (
    <TouchableOpacity 
      style={[styles.card, style]} 
      activeOpacity={0.9}
      onPress={() => router.push({ pathname: '/product-details', params: { ...item } })}
    >
      <TouchableOpacity style={styles.wishlistBtn} onPress={() => addToWishlist(item)}>
        <Ionicons name="heart-outline" size={20} color="#D65A31" />
      </TouchableOpacity>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardDesc} numberOfLines={1}>{item.category || "Handmade"}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.cardPrice}>₹{item.price}</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(item)}>
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D65A31" />
      </View>
    );
  }

  const trendingList = products.filter(p => p.isTrending === true);

  return (
    <View style={styles.mainContainer}>
      
      {/* 1. WELCOME SECTION (Merged Look) */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Welcome to S&S</Text>
        <Text style={styles.subWelcomeText}>Crafting happiness, one stitch at a time ✨</Text>
      </View>

      {/* 2. HEADER SEARCH (Spacing Reduced & Color Matched) */}
      <View style={styles.topHeader}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#888" style={{marginLeft: 10}} />
          <TextInput 
            placeholder="Search cozy items..." 
            style={styles.searchInput} 
            placeholderTextColor="#999" 
            value={searchText}
            onChangeText={handleSearch} 
          />
        </View>
        <TouchableOpacity style={styles.cartIcon} onPress={() => router.push('/subscreens/cart')}>
           <Ionicons name="cart-outline" size={26} color="#333" />
           <View style={styles.badge}><Text style={styles.badgeText}>!</Text></View>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        // FIX: Mobile gap reduced to 20
        contentContainerStyle={{ paddingBottom: Platform.select({ web: 0, android: 20, ios: 30 }) }}
      >
        
        {/* HERO BANNER */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Winter Warmth</Text>
            <Text style={styles.heroSubtitle}>20% Off on Beanies!</Text>
            <TouchableOpacity style={styles.shopNowBtn} onPress={() => router.push('/collection')}>
                <Text style={styles.shopNowText}>Shop Now</Text>
            </TouchableOpacity>
          </View>
          <Ionicons name="snow-outline" size={80} color="rgba(255,255,255,0.3)" style={{position:'absolute', right: -10, bottom: -10}} />
        </View>

        {/* CATEGORIES */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.categoryScrollContent, isWeb && { width: '100%', justifyContent: 'center' }]}>
            {categories.map((cat) => (
              <TouchableOpacity key={cat.id} style={styles.catItem} onPress={() => handleCategoryPress(cat.name)}>
                <View style={[styles.catIconBox, selectedCategory === cat.name && {backgroundColor: '#D65A31'}]}>
                  <Ionicons name={cat.icon as any} size={24} color={selectedCategory === cat.name ? '#fff' : '#D65A31'} />
                </View>
                <Text style={styles.catText}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* TRENDING NOW */}
        {searchText === '' && selectedCategory === 'All' && (
          <View style={styles.productsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>✨ Trending Now</Text>
              <Text style={styles.seeAll}>See All</Text>
            </View>

            {isWeb ? (
              <View style={styles.webGrid}>
                {trendingList.map((item) => <ProductCard key={item.id} item={item} style={styles.webCard} />)}
              </View>
            ) : (
              <FlatList
                horizontal
                data={trendingList}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
                renderItem={({ item }) => <ProductCard item={item} style={styles.mobileSwipeCard} />}
              />
            )}
          </View>
        )}

         {/* ALL COLLECTION */}
         <View style={styles.productsSection}>
          <Text style={[styles.sectionTitle, {marginLeft: 20, marginBottom: 15}]}>
             {searchText ? `Search Results` : '🧶 All Collection'}
          </Text>
          <View style={styles.gridContainer}>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((item) => (
                  <ProductCard 
                    key={item.id} 
                    item={item} 
                    style={[styles.webCard, { width: isWeb ? '23%' : gridCardWidth }]} 
                  />
                ))
              ) : (
                <Text style={{color: '#888', marginLeft: 20}}>No products found.</Text>
              )}
          </View>
        </View>

        {/* FABRIC INFO */}
        <View style={styles.fabricContainer}>
          <View style={styles.fabricCard}>
            <View style={styles.fabricHeader}>
                <Ionicons name="leaf" size={24} color="#D65A31" />
                <Text style={styles.fabricTitle}>Premium Quality</Text>
            </View>
            <Text style={styles.fabricText}>
              Made with 100% Milk Cotton Yarn. Soft, breathable, and perfect for sensitive skin. 
            </Text>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>SOUL & STITCH</Text>
          <Text style={styles.copyright}>© 2025 All rights reserved.</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FFFDF5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFDF5' },
  
  // WELCOME (Gap Reduced & Cleaned)
  welcomeSection: { 
    paddingTop: 15, 
    paddingBottom: 0, // Gap hata diya
    paddingHorizontal: 20, 
    backgroundColor: '#FFFDF5', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  welcomeText: { fontSize: 24, fontWeight: 'bold', color: '#D65A31', letterSpacing: 1 },
  subWelcomeText: { fontSize: 12, color: '#888', marginTop: 2, fontStyle: 'italic', marginBottom: 10 },

  // HEADER (Matches background color)
  topHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 15, 
    paddingBottom: 15, 
    paddingTop: 5, // Upar se gap kam kiya
    backgroundColor: '#FFFDF5', // Color match kiya taaki ek lage
    // elevation hata diya taaki line na dikhe
  },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 8, marginRight: 15, borderWidth: 1, borderColor: '#eee' },
  searchInput: { marginLeft: 10, flex: 1, fontSize: 16, color: '#333' },
  cartIcon: { position: 'relative', padding: 5 },
  badge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#D65A31', width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  heroSection: { margin: 20, height: 160, backgroundColor: '#D65A31', borderRadius: 20, padding: 20, justifyContent: 'center', overflow: 'hidden', elevation: 5 },
  heroContent: { zIndex: 1 },
  heroTitle: { fontSize: 28, fontWeight: '900', color: '#fff' },
  heroSubtitle: { fontSize: 16, color: '#FFE8D6', marginTop: 5, marginBottom: 15 },
  shopNowBtn: { backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start' },
  shopNowText: { color: '#D65A31', fontWeight: 'bold' },

  categorySection: { marginBottom: 25 },
  categoryScrollContent: { paddingHorizontal: 20 },
  catItem: { alignItems: 'center', marginHorizontal: 15 },
  catIconBox: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFE8D6', justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: '#D65A31' },
  catText: { fontSize: 12, color: '#333', fontWeight: '600' },

  productsSection: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  seeAll: { color: '#D65A31', fontWeight: '600' },

  card: { backgroundColor: '#fff', borderRadius: 15, overflow: 'hidden', elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, marginBottom: 15 },
  wishlistBtn: { position: 'absolute', top: 10, right: 10, zIndex: 1, backgroundColor: 'rgba(255,255,255,0.8)', padding: 6, borderRadius: 20 },
  cardImage: { width: '100%', height: 160, resizeMode: 'contain' },
  cardInfo: { padding: 10 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  cardDesc: { fontSize: 11, color: '#888', marginBottom: 8 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardPrice: { fontSize: 15, fontWeight: 'bold', color: '#D65A31' },
  addBtn: { backgroundColor: '#333', padding: 5, borderRadius: 8 },

  mobileSwipeCard: { width: 170, marginRight: 15 }, 
  webCard: { marginBottom: 20 }, 
  
  gridContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    paddingHorizontal: 20,
    justifyContent: 'space-between', 
    gap: 10 
  },
  webGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, paddingHorizontal: 20, justifyContent: 'center' },

  fabricContainer: { padding: 20, marginTop: 10 },
  fabricCard: { backgroundColor: '#FFF0E5', padding: 20, borderRadius: 15, borderLeftWidth: 5, borderLeftColor: '#D65A31' },
  fabricHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  fabricTitle: { fontSize: 18, fontWeight: 'bold', color: '#D65A31' },
  fabricText: { fontSize: 14, color: '#555', lineHeight: 22 },

  footer: { alignItems: 'center', padding: 40, backgroundColor: '#222', marginTop: 30, marginBottom: 0 },
  footerBrand: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: 2, marginBottom: 15 },
  copyright: { fontSize: 12, color: '#888' },
});