// PointsScreen.js

import axios from "axios";
import { BASE_URL } from "./Services";

import React, { useEffect, useState, useRef ,useCallback  } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Modal,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  Alert,
  Animated,
  Easing,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { useFocusEffect } from "@react-navigation/native";
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import DeviceInfo from 'react-native-device-info';
import { showConfirmation } from "./AlertUtils";
 import {getCompanyCode } from "../store";
import { handleStatusCodeError } from "./ErrorHandler";

export default function PointsScreen() {
  // Add Mode State
   const fcomCode = getCompanyCode();
const [currentValPoint , setCurrentValPoint] = useState(null);
const [currentValAmount , setCurrentValAmount] = useState(null);

const [currentRedeemPoint , setCurrentRedeemPoint] = useState(null);
const [currentRedeemAmount , setCurrentRedeemAmount] = useState(null);

  const isTablet = DeviceInfo.isTablet();
  const [addLoyaltyNumber, setAddLoyaltyNumber] = useState("");
  const [addName, setAddName] = useState("");
  const [addBalance, setAddBalance] = useState("");
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [pointsEarned, setPointsEarned] = useState("");

  const [redeemLoyaltyNumber, setRedeemLoyaltyNumber] = useState("");
  const [redeemName, setRedeemName] = useState("");
  const [redeemBalance, setRedeemBalance] = useState("");
  const [redeemPoints, setRedeemPoints] = useState("");
  const [redeemAmount, setRedeemAmount] = useState("");

  const [mode, setMode] = useState("add");
  const purchaseAmountRef = useRef(null);
  const redeemPointsRef = useRef(null);



useFocusEffect(
  useCallback(() => {
    AddPoints();
    RedeemAmount();
  }, [])
);











useFocusEffect(
  useCallback(() => {
    AddPoints();
    RedeemAmount();
  }, [])
);









  const animation = useRef(new Animated.Value(0)).current;
  const switchMode = (newMode) => {
    setMode(newMode);
    Animated.timing(animation, {
      toValue: newMode === "add" ? 0 : 1,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  };
  const sliderLeft = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["2%", "50%"],
  });

  const calculatePoints = (amount) => {
    if (!amount || isNaN(amount)) {
      setPointsEarned("");
      return;
    }
    console.log("Calculating points...",   currentValPoint);
    const valAMT = parseFloat(currentValAmount) || 0;
    const valPOINT = parseFloat(currentValPoint) || 0;
    const onePointValue = valAMT / valPOINT || 0;
    let points = parseFloat(amount) / onePointValue;
    let VAL;
    if (points < 1) {
      VAL = 0;
    } else {
      VAL = points;
    }

    setPointsEarned(VAL.toString());
  };
  const convertPointsToAmount = (points) => {
    const RedeemvalPOINT = parseFloat(currentRedeemPoint) || 0;
    const onePointAMT = (parseFloat(currentRedeemAmount) || 0) / RedeemvalPOINT || 0;
    console.log("Converting points to amount...", currentRedeemAmount);
    const amount = parseFloat(points) * onePointAMT;
    setRedeemAmount(amount ? amount.toFixed(2) : "");
  };

  const handleSave = () => {
   
    if (mode === "add") {
       if(addLoyaltyNumber === "" || (mode === "add" && purchaseAmount === "") ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
      showConfirmation("Are you sure you want to add points?", addPoints);
    } else {
      if(redeemLoyaltyNumber === "" || (mode === "redeem" && redeemPoints === "" && redeemBalance === "")) {
        Alert.alert("Error", "Please fill in all required fields");
        return;
      }
      if(redeemBalance < 0 || redeemBalance == "0") {
        Alert.alert("Error", "Redeem points must be at least 1");
        return;
      }
      showConfirmation("Are you sure you want to redeem points?", RedeemPoints);
    }
  };
  const handleClear = () => {
    if (mode === "add") {
      setAddLoyaltyNumber("");
      setAddName("");
      setAddBalance("");
      setPurchaseAmount("");
      setPointsEarned("");
    } else {
      setRedeemLoyaltyNumber("");
      setRedeemName("");
      setRedeemBalance("");
      setRedeemPoints("");
      setRedeemAmount("");
    }
  };

  const getPoints = async () => {
    let loyaltyNumber = mode === "add" ? addLoyaltyNumber : redeemLoyaltyNumber;
    console.log("Fetching points for loyalty number:", loyaltyNumber);
    if (!loyaltyNumber) {
      Alert.alert("Error", "Please enter a loyalty number"); 
      return;
    }
    try {
      const response = await axios.get(`${BASE_URL}Register/points-summary/${loyaltyNumber}/${fcomCode}`);
      console.log("Response:", response.data);
      if(response.status == 200){
        if(response.data.length === 0) {
          Alert.alert("Error", "No points found for this loyalty number");
          return;
        }
        const data = response.data;
        if (mode === "add") {
          setAddName(data.customerName);
          setAddBalance(data.balance.toString());
        } else if (mode === "redeem") {
          setRedeemName(data.customerName);
          setRedeemBalance(data.balance.toString());
        }
      }
      else {
        handleStatusCodeError(response.status, "Error deleting data");
       handleClear();
      }
    }
    catch (error) {
      if (error.response) {
        handleStatusCodeError(
          error.response.status,
          error.response.data?.message || "An unexpected server error occurred.",
          handleClear()
        );
      } else if (error.request) {
        alert("No response received from the server. Please check your network connection.");
      } 
      else {
        alert(`Error: ${error.message}. This might be due to an invalid URL or network issue.`);
      }
    }
  };


  const addPoints = async() => {
    try{
        const todayDate = new Date().toISOString().split("T")[0];
        const payload = {
            loyaltyNumber: addLoyaltyNumber,
            lAmt: Number(purchaseAmount) || 0,
            lDate: todayDate,
            points: Number(pointsEarned) || 0,
            fcomCode: fcomCode
        }
        console.log(payload)
        const response = await axios.post(`${BASE_URL}AddPoints/newPoints`, payload);
        if(response.status == 200){
            Alert.alert("Success", "Points added successfully");
            handleClear();
        }
        else {
        handleStatusCodeError(response.status, "Error deleting data");
      }

    }
  catch (error) {
      if (error.response) {
        handleStatusCodeError(
          error.response.status,
          error.response.data?.message || "An unexpected server error occurred."
        );
      } else if (error.request) {
        alert("No response received from the server. Please check your network connection.");
      } 
      else {
        alert(`Error: ${error.message}. This might be due to an invalid URL or network issue.`);
      }
    }
  };

  const RedeemPoints = async() => {
    try{
       const todayDate = new Date();
    const formattedDate = `${String(todayDate.getDate()).padStart(2, "0")}/${String(todayDate.getMonth() + 1).padStart(2, "0")}/${todayDate.getFullYear()}`;

        const payload = {
            LoyaltyNum: redeemLoyaltyNumber,
            RedeemDate: formattedDate,
            RedeemAmt: Number(redeemAmount) || 0,
            RedeemPoint: Number(redeemPoints) || 0,
            compCode: fcomCode
        }
        
        console.log(payload)
        const response = await axios.post(`${BASE_URL}RedeemPoints/RedeemPoints`, payload);
        if(response.status == 200){
            Alert.alert("Success", "Points redeemed successfully");
            handleClear();
        }   
         else {
        handleStatusCodeError(response.status, "Error deleting data");
      }

    }
    catch (error) {
      if (error.response) {
        handleStatusCodeError(
          error.response.status,
          error.response.data?.message || "An unexpected server error occurred."
        );
      } else if (error.request) {
        alert("No response received from the server. Please check your network connection.");
      } 
      else {
        alert(`Error: ${error.message}. This might be due to an invalid URL or network issue.`);
      }
    }
  };
//--------------------------------------------Points Value Get  ---------------------------------------
const AddPoints = async ()=>{

  try{
    const response = await axios.get(`${BASE_URL}Ratefixing/Addpointfix/${fcomCode}`)
    console.log(response)
    if(response.status == 200){
      
      setCurrentValAmount(response.data[0].amount);
      setCurrentValPoint(response.data[0].point);
    }
     else {
        handleStatusCodeError(response.status, "Error deleting data");
      }
  }
catch (error) {
      if (error.response) {
        handleStatusCodeError(
          error.response.status,
          error.response.data?.message || "An unexpected server error occurred."
        );
      } else if (error.request) {
        alert("No response received from the server. Please check your network connection.");
      } 
      else {
        alert(`Error: ${error.message}. This might be due to an invalid URL or network issue.`);
      }
    }
  };
//--------------------------------------------Points Value Get  ---------------------------------------
const RedeemAmount = async ()=>{
  try{
    const response = await axios.get(`${BASE_URL}Ratefixing/Redeempoints/${fcomCode}`)
    if(response.status == 200){
      console.log(response.data)
      setCurrentRedeemAmount(response.data[0].fpointVal);
      setCurrentRedeemPoint(response.data[0].point);
    }
     else {
        handleStatusCodeError(response.status, "Error deleting data");
      }
  }
catch (error) {
      if (error.response) {
        handleStatusCodeError(
          error.response.status,
          error.response.data?.message || "An unexpected server error occurred."
        );
      } else if (error.request) {
        alert("No response received from the server. Please check your network connection.");
      } 
      else {
        alert(`Error: ${error.message}. This might be due to an invalid URL or network issue.`);
      }
    }
  };




  const device = useCameraDevice('back');
  const [hasPermission, setHasPermission] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const requestPermission = async () => {
    let status;
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      status = granted === PermissionsAndroid.RESULTS.GRANTED ? 'authorized' : 'denied';
    } else {
      status = await Camera.requestCameraPermission();
    }
    setHasPermission(status === 'authorized');
  };

  useEffect(() => {
    requestPermission();
  }, []);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'code-128'],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && codes[0].value) {
        const value = codes[0].value;
        setAddLoyaltyNumber(value);
        setShowScanner(false);
        getPoints();
      }
    }
  });

  return (
    <KeyboardAvoidingView style={{ flex: 1,backgroundColor:'white' }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerText}>Loyalty Hub</Text>
          </View>
                      
          {/* Segmented Control */}
          <View style={styles.segmentContainer}>
            <Animated.View style={[styles.slider, { left: sliderLeft , zIndex: -1}]} />
            <TouchableOpacity
              style={styles.segmentButton}
              onPress={() => { switchMode("add"); handleClear(); }}
            >
              <Text
                style={[
                  styles.segmentText,
                  mode === "add" && styles.segmentTextActive,
                ]}
              >
                Add
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.segmentButton}
              onPress={() => { switchMode("redeem"); handleClear(); }}
            >
              <Text
                style={[
                  styles.segmentText,
                  mode === "redeem" && styles.segmentTextActive,
                ]}
              >
                Redeem
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginVertical: 10 }}>
            {mode === "add" ? (
              <Text style={{ fontSize: 16, fontWeight: "bold", color: "#006A72",position: "absolute", top: 1, right:10 }}>
                Per Point value:{" "}
                {currentValAmount && currentValPoint
                  ? (parseFloat(currentValAmount) / parseFloat(currentValPoint)).toFixed(2)
                  : "Loading..."}
              </Text>
            ) : (
              <Text style={{ fontSize: 16, fontWeight: "bold", color: "#006A72",position: "absolute", top: 1, right:10 }}>
                Per Redeem value:{" "}
                {currentRedeemAmount && currentRedeemPoint
                  ? (parseFloat(currentRedeemAmount) / parseFloat(currentRedeemPoint)).toFixed(2)
                  : "Loading..."}
              </Text>
            )}
</View>


<View style={styles.card}>

            {/* ADD Mode */}
            {mode === "add" && (
              <>
                <Text style={styles.label}>Loyalty Number</Text>
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={addLoyaltyNumber}
                    onChangeText={setAddLoyaltyNumber}
                    onBlur={getPoints}
                    placeholder="Enter Loyalty Number"
                    returnKeyType="next"
                    onSubmitEditing={() => purchaseAmountRef.current.focus()}
                  />
                  <TouchableOpacity
                    onPress={() => (hasPermission ? setShowScanner(true) : requestPermission())}
                    style={styles.qrButton}
                  >
                    <Icon name="qr-code-scanner" size={isTablet ? wp('5%') : wp('7%')} color="#333" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>Name</Text>
                <TextInput style={styles.input} value={addName} editable={false} />

                <Text style={styles.label}>Balance Points</Text>
                <TextInput style={styles.input} value={addBalance} editable={false} />

                <Text style={styles.label}>Purchase Amount</Text>
                <TextInput
                  ref={purchaseAmountRef}
                  style={styles.input}
                  value={purchaseAmount}
                  onChangeText={(val) => {
                    setPurchaseAmount(val);
                    calculatePoints(val);
                  }}
                  keyboardType="numeric"
                />

                <Text style={styles.label}>Points Earned</Text>
                <TextInput style={styles.input} value={pointsEarned} editable={false} />
              </>
            )}

            {/* REDEEM Mode */}
            {mode === "redeem" && (
              <>
                <Text style={styles.label}>Loyalty Number</Text>
                <View style={styles.row}>
                   <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={redeemLoyaltyNumber}
                    onChangeText={setRedeemLoyaltyNumber}
                    onBlur={getPoints}
                    placeholder="Enter Loyalty Number"
                    returnKeyType="next"
                    onSubmitEditing={() => redeemPointsRef.current.focus()}
                  />
                  <TouchableOpacity
                    onPress={() => (hasPermission ? setShowScanner(true) : requestPermission())}
                    style={styles.qrButton}
                  >
                    <Icon name="qr-code-scanner" size={isTablet ? wp('5%') : wp('7%')} color="#333" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>Name</Text>
                <TextInput style={styles.input} value={redeemName} editable={false} />

                <Text style={styles.label}>Balance Points</Text>
                <TextInput style={styles.input} value={redeemBalance} editable={false} />

                <Text style={styles.label}>Redeem Points</Text>
                <TextInput
                  ref={redeemPointsRef}
                  style={styles.input}
                  value={redeemPoints}
                  onChangeText={(val) => {
                    setRedeemPoints(val);
                    convertPointsToAmount(val);
                  }}
                  keyboardType="numeric"
                />

                <Text style={styles.label}>Amount</Text>
                <TextInput style={styles.input} value={redeemAmount} editable={false} />
              </>
            )}

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.button, styles.saveBtn]} onPress={handleSave}>
                <Text style={styles.saveText}>SAVE</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.clearBtn]} onPress={handleClear}>
                <Text style={styles.clearText}>CLEAR</Text>
              </TouchableOpacity>
            </View>
         
        </View>
      </View>
      </ScrollView>

      {/* QR Scanner */}
      <Modal visible={showScanner} animationType="slide" onRequestClose={() => setShowScanner(false)}>
        <View style={{ flex: 1, backgroundColor: 'black' }}>
          {device && hasPermission && (
            <Camera style={{ flex: 1 }} device={device} isActive={showScanner} codeScanner={codeScanner} />
          )}
          <TouchableOpacity style={styles.closeButton} onPress={() => setShowScanner(false)}>
            <Text style={{ color: 'white', fontSize: 18 }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#006A72',
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerText: { fontSize: 24, color: 'white', fontWeight: 'bold' },

  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    margin: 15,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  label: { fontSize: 12, fontWeight: "600", color: "#006A72", marginTop: 10, marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#8FD6DA",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#ffffff",
    color: "#00363A",
  },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  button: { flex: 1, paddingVertical: 12, borderRadius: 25, alignItems: "center", marginHorizontal: 5 },
  saveBtn: { backgroundColor: "#006A72" },
  saveText: { color: "#ffffff", fontWeight: "bold" },
  clearBtn: { backgroundColor: "#D9F5F7" },
  clearText: { color: "#006A72", fontWeight: "bold" },
segmentContainer: {
  flexDirection: "row",
  backgroundColor: "#d1e6e7",
  borderRadius: 40,       // matches slider
  padding: 3,
  position: "relative",
  marginBottom: 20,
  height: 50,
  elevation: 3,
  marginTop: 10,
  width: "100%",
  overflow: "hidden",     // keeps slider inside rounded edges
},
slider: {
  position: "absolute",
  top: 3,
  bottom: 3,
  width: "48%",
  backgroundColor: "#006A72",
  borderRadius: 40,
  elevation: 4,
},
segmentButton: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  
},
segmentText: {
  fontSize: 16,
  fontWeight: "600",
  color: "#444",
  
},
segmentTextActive: {
  color: "#fff",
},

  row: { flexDirection: "row", alignItems: "center" },
  qrButton: { marginLeft: 8, paddingHorizontal: 6, justifyContent: "center", alignItems: "center" },
  closeButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#00000088',
    borderRadius: 5
  },
});
