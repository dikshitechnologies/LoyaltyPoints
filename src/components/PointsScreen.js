import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";

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

  // Points calculation
  const calculatePoints = (amount) => {
    const points = parseFloat(amount) * 0.1; // Example: 10% of purchase amount
    setPointsEarned(points ? points.toFixed(2) : "");
  };

  const convertPointsToAmount = (points) => {
    const amount = parseFloat(points) * 1; // Example: 1 point = ₹1
    setRedeemAmount(amount ? amount.toFixed(2) : "");
  };

  const handleSave = () => {
    if (mode === "add") {
      Alert.alert("Saved", `Points Earned: ${pointsEarned}`);
    } else {
      Alert.alert("Redeemed", `Amount Redeemed: ₹${redeemAmount}`);
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

  return (
    <View style={styles.container}>
      {/* Top Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.topButton, mode === "add" && styles.activeButton]}
          onPress={() => setMode("add")}
        >
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.topButton, mode === "redeem" && styles.activeButton]}
          onPress={() => setMode("redeem")}
        >
          <Text style={styles.buttonText}>Redeem</Text>
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
          />

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={addName}
            onChangeText={setAddName}
            placeholder="Enter Name"
          />

          <Text style={styles.label}>Balance Points</Text>
          <TextInput
            style={styles.input}
            value={addBalance}
            onChangeText={setAddBalance}
            placeholder="Enter Balance Points"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Purchase Amount</Text>
          <TextInput
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
          <TextInput style={styles.input} value={pointsEarned} editable={false} />
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
          />

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={redeemName}
            onChangeText={setRedeemName}
            placeholder="Enter Name"
          />

          <Text style={styles.label}>Balance Points</Text>
          <TextInput
            style={styles.input}
            value={redeemBalance}
            onChangeText={setRedeemBalance}
            placeholder="Enter Balance Points"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Redeem Points</Text>
          <TextInput
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
          <TextInput style={styles.input} value={redeemAmount} editable={false} />
        </>
      )}

      {/* Save & Clear Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  topButton: { flex: 1, padding: 10, backgroundColor: "#ccc", marginHorizontal: 5, borderRadius: 8 },
  activeButton: { backgroundColor: "#4CAF50" },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  label: { fontSize: 16, marginTop: 10, fontWeight: "bold" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8, marginTop: 5 },
  saveButton: { flex: 1, backgroundColor: "#2196F3", padding: 12, borderRadius: 8, marginHorizontal: 5, marginTop: 15 },
  clearButton: { flex: 1, backgroundColor: "#f44336", padding: 12, borderRadius: 8, marginHorizontal: 5, marginTop: 15 },
});
