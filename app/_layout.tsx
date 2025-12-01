import { Stack } from "expo-router";
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// 👇 Toast Imports
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

// 👇 1. FONT AUR SPLASH SCREEN IMPORTS (Ye add kiya hai)
import { Pacifico_400Regular, useFonts } from '@expo-google-fonts/pacifico';
import { Ionicons } from '@expo/vector-icons'; // Web icons fix
import * as SplashScreen from 'expo-splash-screen';

// Splash screen roke rakhna jab tak font load na ho
SplashScreen.preventAutoHideAsync();

// --- CUSTOM TOAST DESIGN (Soul & Stitch Theme) ---
const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#D65A31', // Orange Stripe
        backgroundColor: '#FFFDF5', // Cream Background
        marginTop: 40, 
        borderRadius: 15,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: '#eee',
        height: 70,
        width: '90%'
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: '#D65A31' // Title Color
      }}
      text2Style={{
        fontSize: 13,
        color: '#666' // Message Color
      }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: 'red',
        marginTop: 40,
        borderRadius: 15,
        backgroundColor: '#FFFDF5',
        height: 70,
        width: '90%',
        elevation: 5
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: 'red'
      }}
      text2Style={{
        fontSize: 13,
        color: '#333'
      }}
    />
  )
};

export default function RootLayout() {
  // 👇 2. FONTS LOAD KARNA (Ionicons zaruri hai web ke liye)
  let [fontsLoaded] = useFonts({
    Pacifico_400Regular,
    ...Ionicons.font, // <--- YEH LINE WEB PAR ICONS DIKHAYEGI
  });

  // 👇 3. SPLASH SCREEN HIDE LOGIC
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    // 1. GestureHandlerRootView sabse bahar hona chahiye
    <GestureHandlerRootView style={{ flex: 1 }}>
      
      {/* 2. Tera Navigation Stack */}
      <Stack screenOptions={{ headerShown: false }}>
        {/* Index file sabse pehle chalegi (Gatekeeper) */}
        <Stack.Screen name="index" /> 
        
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        
        {/* Tabs (Home/Profile) */}
        <Stack.Screen name="(tabs)" />
        
        {/* Subscreens (Inko bhi stack mein add karna padta hai) */}
        <Stack.Screen name="subscreens/cart" />
        <Stack.Screen name="subscreens/wishlist" />
        <Stack.Screen name="subscreens/checkout" />
        <Stack.Screen name="subscreens/edit-profile" />
        <Stack.Screen name="subscreens/orders" />
        <Stack.Screen name="subscreens/help" />
        <Stack.Screen name="product-details" />
        <Stack.Screen name="collection" /> 
      </Stack>

      {/* 3. Toast Component (Sabse Last Mein) */}
      <Toast config={toastConfig} />
      
    </GestureHandlerRootView>
  );
}