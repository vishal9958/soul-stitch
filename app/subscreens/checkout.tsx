import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { auth, db } from '../../firebaseConfig';
// 👇 YEH NAYA HAI (QR CODE KE LIYE)
import QRCode from 'react-native-qrcode-svg';
import Toast from 'react-native-toast-message';

export default function CheckoutScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const user = auth.currentUser;

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD', 'ONLINE', 'QR'

  const productName = params.name || "Cart Order";
  const finalPrice = params.price || params.totalAmount || "0";
  const productImage = params.image || "https://placehold.co/100x100/png?text=Order";

  // --- UPI CONFIG (TERA NUMBER) ---
  const UPI_ID = "9958268957@kotak811"; 
  const NAME = "Soul & Stitch";
  
  // Dynamic UPI Link (Jo QR banega)
  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${NAME}&am=${finalPrice}&cu=INR`;

  // --- 1. DIRECT APP LOGIC ---
  const handleOnlinePayment = async () => {
    if (!address || !phone) { Alert.alert("Ruko!", "Address aur Phone number toh daalo."); return; }
    const url = `upi://pay?pa=${UPI_ID}&pn=${NAME}&tn=Order&am=${finalPrice}&cu=INR`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        confirmQrPayment("Online (App)");
      } else {
        Alert.alert("Error", "Koi UPI App nahi mila.");
      }
    } catch (err) {
      Alert.alert("Error", "Payment initiate nahi hua.");
    }
  };

  // --- 2. QR CONFIRMATION ---
  const confirmQrPayment = (method: string) => {
    Alert.alert(
      "Payment Confirmation",
      "Kya aapne payment complete kar di?",
      [
        { text: "Nahi, Ruko", style: "cancel" },
        { text: "Haan, Kar di", onPress: () => saveOrder(method) }
      ]
    );
  };

  // --- 3. ORDER SAVE LOGIC ---
  const saveOrder = async (method: string) => {
    if (!address || !phone) { Alert.alert("Missing Details", "Address aur Phone number bharo."); return; }
    
    setLoading(true);
    try {
      await addDoc(collection(db, "orders"), {
        userId: user?.uid,
        userEmail: user?.email,
        items: productName,
        totalAmount: finalPrice,
        orderImage: productImage,
        shippingAddress: address,
        phone: phone,
        status: 'Ordered', 
        paymentMethod: method,
        date: new Date().toDateString(),
        timestamp: new Date()
      });

      // ✨ ORDER SUCCESS TOAST
    Toast.show({
      type: 'success',
      text1: 'Order Placed! 🎉',
      text2: 'Thank you for shopping with us.',
      visibilityTime: 4000, // Thoda lamba time
    });

    // 2 Second baad Orders page pe bhej do
    setTimeout(() => router.replace('/subscreens/orders'), 2000);

  } catch (error) {
    Toast.show({ type: 'error', text1: 'Order Failed', text2: 'Please try again.' });
  }
  setLoading(false);
};

  const handlePlaceOrder = () => {
    if (!address || !phone) { Alert.alert("Missing Details", "Address aur Phone number bharo."); return; }

    if (paymentMethod === 'ONLINE') {
      handleOnlinePayment();
    } else if (paymentMethod === 'QR') {
      confirmQrPayment("Online (QR Code)");
    } else {
      saveOrder("Cash on Delivery");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#333" /></TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
        <View style={{width: 24}}/>
      </View>

      <ScrollView contentContainerStyle={{padding: 20}}>
        {/* Summary */}
        <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>Order Summary</Text>
            <View style={styles.row}>
                <Text style={styles.prodName}>{productName}</Text>
                <Text style={styles.prodPrice}>₹{finalPrice}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
                <Text style={{fontWeight: 'bold'}}>Total To Pay</Text>
                <Text style={{fontWeight: 'bold', color: '#D65A31', fontSize: 18}}>₹{finalPrice}</Text>
            </View>
        </View>

        {/* Inputs */}
        <Text style={styles.label}>Shipping Details</Text>
        <TextInput style={styles.input} placeholder="Full Address (House No, Street, City)" multiline value={address} onChangeText={setAddress} />
        <TextInput style={styles.input} placeholder="Phone Number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />

        {/* Payment Selection */}
        <Text style={styles.label}>Select Payment Method</Text>
        
        {/* 1. COD */}
        <TouchableOpacity 
            style={[styles.paymentOption, paymentMethod === 'COD' && styles.selectedOption]} 
            onPress={() => setPaymentMethod('COD')}
        >
            <Ionicons name={paymentMethod === 'COD' ? "radio-button-on" : "radio-button-off"} size={24} color="#D65A31" />
            <Text style={styles.payText}>Cash on Delivery</Text>
            <Ionicons name="cash-outline" size={24} color="#555" />
        </TouchableOpacity>

        {/* 2. Direct UPI App */}
        <TouchableOpacity 
            style={[styles.paymentOption, paymentMethod === 'ONLINE' && styles.selectedOption]} 
            onPress={() => setPaymentMethod('ONLINE')}
        >
            <Ionicons name={paymentMethod === 'ONLINE' ? "radio-button-on" : "radio-button-off"} size={24} color="#D65A31" />
            <Text style={styles.payText}>Open UPI App (GPay/PhonePe)</Text>
            <Ionicons name="apps-outline" size={24} color="#555" />
        </TouchableOpacity>

        {/* 3. QR Code (NEW OPTION) */}
        <TouchableOpacity 
            style={[styles.paymentOption, paymentMethod === 'QR' && styles.selectedOption]} 
            onPress={() => setPaymentMethod('QR')}
        >
            <Ionicons name={paymentMethod === 'QR' ? "radio-button-on" : "radio-button-off"} size={24} color="#D65A31" />
            <Text style={styles.payText}>Scan QR Code</Text>
            <Ionicons name="qr-code-outline" size={24} color="#555" />
        </TouchableOpacity>

        {/* --- QR CODE DISPLAY SECTION --- */}
        {paymentMethod === 'QR' && (
            <View style={styles.qrContainer}>
                <Text style={styles.qrTitle}>Scan to Pay ₹{finalPrice}</Text>
                <View style={styles.qrBorder}>
                    {/* Yahan QR Code banega */}
                    <QRCode value={upiUrl} size={180} />
                </View>
                <Text style={styles.qrSubText}>Scan with Paytm, GPay, or PhonePe</Text>
            </View>
        )}

      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.btn} onPress={handlePlaceOrder}>
            {loading ? <ActivityIndicator color="#fff"/> : 
                <Text style={styles.btnText}>
                    {paymentMethod === 'COD' ? 'Place Order (COD)' : 
                     paymentMethod === 'QR' ? 'I have Paid (Confirm)' : 
                     `Pay ₹${finalPrice} & Order`}
                </Text>
            }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF5' },
  header: { flexDirection: 'row', padding: 20, paddingTop: 50, justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  
  summaryCard: { backgroundColor: '#fff', padding: 20, borderRadius: 15, marginBottom: 20, elevation: 2 },
  cardTitle: { color: '#888', marginBottom: 10, fontWeight: 'bold' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  prodName: { fontSize: 16, fontWeight: '600', width: '70%' },
  prodPrice: { fontSize: 16, fontWeight: 'bold', color: '#D65A31' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, marginTop: 10 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  
  paymentOption: { 
      flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', 
      padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#ddd', marginBottom: 10 
  },
  selectedOption: { borderColor: '#D65A31', backgroundColor: '#FFF0E5' },
  payText: { flex: 1, marginLeft: 10, fontWeight: '600', color: '#333' },

  // New QR Styles
  qrContainer: { alignItems: 'center', backgroundColor: '#fff', padding: 20, borderRadius: 15, marginTop: 10, elevation: 3 },
  qrTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  qrBorder: { padding: 10, borderWidth: 1, borderColor: '#eee', borderRadius: 10 },
  qrSubText: { marginTop: 10, color: '#888', fontSize: 12 },

  footer: { padding: 20, backgroundColor: '#fff', elevation: 10 },
  btn: { backgroundColor: '#D65A31', padding: 18, borderRadius: 15, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});