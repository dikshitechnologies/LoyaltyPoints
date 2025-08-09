import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Easing,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import axios from "axios";
import { BASE_URL, fcomCode } from "./Services";
export default function PointsScreen() {
  // Add Mode State
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
    const points = parseFloat(amount) * 0.1; // 10% of purchase amount
    setPointsEarned(points ? points.toFixed(2) : "");
  };
  const convertPointsToAmount = (points) => {
    const amount = parseFloat(points) * 1; // 1 point = ₹1
    setRedeemAmount(amount ? amount.toFixed(2) : "");
  };

  const handleSave = () => {
    if (mode === "add") {
      addPoints();
    } else {
      RedeemPoints();
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
      else{
        Alert.alert("Error", "Failed to fetch points");
      }
    }
    catch (error){
      Alert.alert("Error", "Failed to fetch points");
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
        else{
            Alert.alert("Error", "Failed to add points");
        }

    }
    catch (error){
        Alert.alert("Error", "Failed to add points");
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
        else{
            Alert.alert("Error", "Failed to redeem points");
        }

    }
    catch (error){
        Alert.alert("Error", "Failed to redeem points");
    }

  };

   return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* Segmented Control */}
          <View style={styles.segmentContainer}>
            <Animated.View style={[styles.slider, { left: sliderLeft }]} />
            <TouchableOpacity
              style={styles.segmentButton}
              onPress={() => switchMode("add")}
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
              onPress={() => switchMode("redeem")}
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

          {/* ADD Mode */}
          {mode === "add" && (
            <>
              <Text style={styles.label}>Loyalty Number</Text>
              <TextInput
                style={styles.input}
                value={addLoyaltyNumber}
                onChangeText={setAddLoyaltyNumber}
                placeholder="Enter Loyalty Number"
                returnKeyType="next"
                onSubmitEditing={getPoints}
              />

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
            </>
          )}

          {/* REDEEM Mode */}
          {mode === "redeem" && (
            <>
              <Text style={styles.label}>Loyalty Number</Text>
              <TextInput
                style={styles.input}
                value={redeemLoyaltyNumber}
                onChangeText={setRedeemLoyaltyNumber}
                placeholder="Enter Loyalty Number"
                returnKeyType="next"
                onSubmitEditing={getPoints}
              />

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
  container: { flex: 1, padding: 20, backgroundColor: "#f5f7f9" },

  // Segmented Control
  segmentContainer: {
    flexDirection: "row",
    backgroundColor: "#d1e6e7",
    borderRadius: 14,
    padding: 3,
    position: "relative",
    marginBottom: 20,
    height: 50,
    elevation: 3,
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
    color: "#444",
  },
  segmentTextActive: {
    color: "#fff",
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

  buttonRow: { flexDirection: "row", marginTop: 20 },
  saveButton: {
    flex: 1,
    backgroundColor: "#008C99",
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    elevation: 2,
  },
  clearButton: {
    flex: 1,
    backgroundColor: "#d9f5f7",
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    elevation: 2,
  },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 16 },
  cbuttonText: { color: "#006A72", textAlign: "center", fontWeight: "bold", fontSize: 16 }
});





















