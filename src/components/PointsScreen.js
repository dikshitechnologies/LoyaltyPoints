

import axios from "axios";
import { BASE_URL, fcomCode } from "./Services";

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
import Icon from 'react-native-vector-icons/MaterialIcons'; // Material Icon
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import DeviceInfo from 'react-native-device-info';
import { showConfirmation } from "./AlertUtils";


export default function PointsScreen() {
  // Add Mode State
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

  // Redeem Mode State
  const [redeemLoyaltyNumber, setRedeemLoyaltyNumber] = useState("");
  const [redeemName, setRedeemName] = useState("");
  const [redeemBalance, setRedeemBalance] = useState("");
  const [redeemPoints, setRedeemPoints] = useState("");
  const [redeemAmount, setRedeemAmount] = useState("");

  const [mode, setMode] = useState("add"); // "add" or "redeem"

  // Refs for focus navigation
  const purchaseAmountRef = useRef(null);
  const redeemPointsRef = useRef(null);



useFocusEffect(
  useCallback(() => {
    AddPoints();
    RedeemAmount();
  }, [])
);









  // Animation for segmented control
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

  // Points calculation
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

  const getPoints = async() => {
    if (mode === "add") {
    if (!addLoyaltyNumber) {
      Alert.alert("Error", "Please enter a loyalty number");
      return;
    }
  } else if (mode === "redeem") {
    if (!redeemLoyaltyNumber) {
      Alert.alert("Error", "Please enter a loyalty number");
      return;
    }
  }
  let loyaltyNumber = mode === "add" ? addLoyaltyNumber : redeemLoyaltyNumber;


    try{
      const response = await axios.get(`${BASE_URL}Register/points-summary/${loyaltyNumber}`);
      if(response.status == 200){
        if(response.data.length === 0) {

        }
        const data = response.data[0];
        if (mode === "add") {

        setAddName(data.customerName);
        setAddBalance(data.balance.toString());
        }
        else if (mode === "redeem") {
          setRedeemName(data.customerName);
          setRedeemBalance(data.balance.toString());
        }
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




  //-----------------------------------------------------------------
const device = useCameraDevice('back');
  const [hasPermission, setHasPermission] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
 

  const requestPermission = async () => {
    let status;
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'App needs access to your camera to scan QR codes',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK'
        }
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
    codeTypes: [
      'qr', 'ean-13', 'code-128', 'code-39', 'code-93',
      'codabar', 'upc-a', 'upc-e', 'itf', 'ean-8',
      'aztec', 'pdf-417', 'data-matrix'
    ],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && codes[0].value) {
        const value = codes[0].value;
        setAddLoyaltyNumber(value);
        setShowScanner(false);
        getPoints(); // optional: trigger fetch immediately
      }
    }
  });
  //-------------------------------------------------------------------

   return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.header}>
           <Text style={styles.headerText}>Loyalty Hub</Text>
          </View>
                      
          {/* Segmented Control */}
          <View style={styles.segmentContainer}>
            <Animated.View style={[styles.slider, { left: sliderLeft }]} />
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
              <Text style={{ fontSize: 16, fontWeight: "bold", color: "#006A72",position: "absolute", top: 10, right:10 }}>
                Per Point value:{" "}
                {currentValAmount && currentValPoint
                  ? (parseFloat(currentValAmount) / parseFloat(currentValPoint)).toFixed(2)
                  : "Loading..."}
              </Text>
            ) : (
              <Text style={{ fontSize: 16, fontWeight: "bold", color: "#006A72",position: "absolute", top: 10, right:10 }}>
                Per Redeem value:{" "}
                {currentRedeemAmount && currentRedeemPoint
                  ? (parseFloat(currentRedeemAmount) / parseFloat(currentRedeemPoint)).toFixed(2)
                  : "Loading..."}
              </Text>
            )}
</View>

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
    onPress={() => {
      if (hasPermission) {
        setShowScanner(true);
      } else {
        requestPermission();
      }
    }}
    style={styles.qrButton}
  >
    <Icon
      name="qr-code-scanner"
      size={isTablet ? wp('5%') : wp('7%')}
      color="#333"
    />
  </TouchableOpacity>
</View>

              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={addName}
                onChangeText={setAddName}
                placeholder="Enter Name"
                editable={false}
              />

              <Text style={styles.label}>Balance Points</Text>
              <TextInput
                style={styles.input}
                value={addBalance}
                onChangeText={setAddBalance}
                placeholder="Enter Balance Points"
                keyboardType="numeric"
                editable={false}
              />

              <Text style={styles.label}>Purchase Amount</Text>
              <TextInput
                ref={purchaseAmountRef}
                style={styles.input}
                value={purchaseAmount}
                onChangeText={(val) => {
                  setPurchaseAmount(val);
                  calculatePoints(val);
                }}
                placeholder="Enter Purchase Amount"
                keyboardType="numeric"
              />

              <Text style={styles.label}>Points Earned</Text>
              <TextInput
                style={styles.input}
                value={pointsEarned}
                editable={false}
              />

              <Modal
        visible={showScanner}
        animationType="slide"
        onRequestClose={() => setShowScanner(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'black' }}>
          {device && hasPermission ? (
            <Camera
              style={{ flex: 1 }}
              device={device}
              isActive={showScanner}
              codeScanner={codeScanner}
            />
          ) : null}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowScanner(false)}
          >
            <Text style={{ color: 'white', fontSize: 18 }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
    placeholder="Enter Loyalty Number"
    returnKeyType="next"
    onSubmitEditing={getPoints}
  />
  <TouchableOpacity
    onPress={() => {
      if (hasPermission) {
        setShowScanner(true);
      } else {
        requestPermission();
      }
    }}
    style={styles.qrButton}
  >
    <Icon
      name="qr-code-scanner"
      size={isTablet ? wp('5%') : wp('7%')}
      color="#333"
    />
  </TouchableOpacity>
</View>


              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={redeemName}
                onChangeText={setRedeemName}
                placeholder="Enter Name"
                editable={false}
              />

              <Text style={styles.label}>Balance Points</Text>
              <TextInput
                style={styles.input}
                value={redeemBalance}
                onChangeText={setRedeemBalance}
                placeholder="Enter Balance Points"
                keyboardType="numeric"
                editable={false}
              />

              <Text style={styles.label}>Redeem Points</Text>
              <TextInput
                ref={redeemPointsRef}
                style={styles.input}
                value={redeemPoints}
                onChangeText={(val) => {
                  setRedeemPoints(val);
                  convertPointsToAmount(val);
                }}
                placeholder="Enter Points to Redeem"
                keyboardType="numeric"
              />

              <Text style={styles.label}>Amount</Text>
              <TextInput
                style={styles.input}
                value={redeemAmount}
                editable={false}
              />
            </>
          )}

          {/* Save & Clear */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <Text style={styles.cbuttonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 0, backgroundColor: "#f5f7f9" },
  header: {
        backgroundColor: '#006A72ff',
        padding: 20,
        paddingTop: 50,
        alignItems: 'center',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },

  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 40
  },
  closeButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#00000088',
    borderRadius: 5
  },
  // Segmented Control
  segmentContainer: {
    flexDirection: "row",
    backgroundColor: "#d1e6e7",
    borderRadius: 20,
    padding: 3,
    position: "relative",
    marginBottom: 20,
    height: 50,
    elevation: 3,
    marginTop: 10,
  },
  slider: {
    position: "absolute",
    top: 3,
    bottom: 3,
    width: "48%",
    backgroundColor: "#006A72",
    borderRadius: 12,
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
    color: "black",
  },
  segmentTextActive: {
    color: "white",
  },

  label: { fontSize: 15, marginTop: 12, fontWeight: "bold", color: "#006A72" },
  input: {
    borderWidth: 1,
    borderColor: "#cce2e3",
    padding: 12,
    borderRadius: 10,
    marginTop: 6,
    backgroundColor: "#fff",
    elevation: 1,

  },

buttonRow: {
  flexDirection: 'row',
  justifyContent: 'center', // center the buttons in row
  alignItems: 'center',
  marginTop: 20,
},
saveButton: {
  backgroundColor: '#006A72',
  borderRadius: 20,
  paddingVertical: 12,
  paddingHorizontal: 20,
  alignItems: 'center',
  width: 120, // smaller width
  marginHorizontal: 10, // space between buttons
},
clearButton: {
  backgroundColor: '#d9f5f7',
  borderRadius: 20,
  paddingVertical: 12,
  paddingHorizontal: 20,
  alignItems: 'center',
  width: 120, // smaller width
  marginHorizontal: 10,
},

  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 16 },
  cbuttonText: { color: "#006A72", textAlign: "center", fontWeight: "bold", fontSize: 16 },
  headerText: {
        fontSize: 24,
        color: 'white',
        fontWeight: 'bold',
    },
    row: {
  flexDirection: "row",
  alignItems: "center",
},
qrButton: {
  marginLeft: 8,
  paddingHorizontal: 6,
  justifyContent: "center",
  alignItems: "center",
},
});





















