import React, { useState } from "react";
import axios from "axios";
import Video from "react-native-video";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert
} from "react-native";
import DatePicker from "react-native-date-picker";
import { getCompanyCode } from "./store";

export default function RateFixingScreen() {
    const [activeTab, setActiveTab] = useState("amountToPoints");

    // Tab 1 state
    const [rateDate1, setRateDate1] = useState(new Date());
    const [amount1, setAmount1] = useState("");
    const [points1, setPoints1] = useState("");
    const [openDatePicker1, setOpenDatePicker1] = useState(false);

    // Tab 2 state
    const [rateDate2, setRateDate2] = useState(new Date());
    const [points2, setPoints2] = useState("");
    const [amount2, setAmount2] = useState("");
    const [openDatePicker2, setOpenDatePicker2] = useState(false);

    const fcompcode = getCompanyCode();

    const formatDate = (date) => date.toISOString();

    const saveTab1 = async () => {
        if (!amount1 || !points1) {
            Alert.alert("Validation", "Please enter both amount and points.");
            return;
        }
        try {
            const payload = {
                amount: amount1,
                point: points1,
                date: formatDate(rateDate1),
                fcompcode,

            };
            console.log("Sending to Amount→Point API:", payload);

            const res = await axios.post(
                "http://dikshi.ddns.net/loyaltypoints/api/Ratefixing/AmountPoint",
                payload
            );
            console.log("Tab 1 Response:", res.data);
            Alert.alert("Success", "Amount → Points saved successfully");

        } catch (err) {
            console.error("Tab 1 Save Error:", err);
            Alert.alert("Error", "Failed to save Amount → Points");
        }
    };

    const clearTab1 = () => {
        setRateDate1(new Date());
        setAmount1("");
        setPoints1("");
    };

    const saveTab2 = async () => {
        if (!points2 || !amount2) {
            Alert.alert("Validation", "Please enter both points and amount.");
            return;
        }
        try {
            const payload = {
                pointAmount: amount2,
                point: points2,
                date: formatDate(rateDate2),
                fcompcode,

            };
            console.log("Sending to Point→Amount API:", payload);

            const res = await axios.post(
                "http://dikshi.ddns.net/loyaltypoints/api/Ratefixing/RedeemPointAmount",
                payload
            );
            console.log("Tab 2 Response:", res.data);
            Alert.alert("Success", "Points → Amount saved successfully");

        } catch (err) {
            console.error("Tab 2 Save Error:", err);
            Alert.alert("Error", "Failed to save Points → Amount");
        }
    };

    const clearTab2 = () => {
        setRateDate2(new Date());
        setPoints2("");
        setAmount2("");
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Top Image */}
            <View style={styles.imageContainer}>
                <Video
                    source={require("./assets/ratefix.mp4")} // place your video in assets folder
                    style={styles.topImage}
                    resizeMode="cover"
                    repeat
                    muted
                    autoplay
                    ignoreSilentSwitch="obey"
                />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingTop: 200, paddingBottom: 30 }}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Card */}
                    <View style={styles.card}>
                        <View style={styles.headingContainer}>
                            <Text style={styles.headingText}>RATE FIXING</Text>
                        </View>

                        {/* Tabs */}
                        <View style={styles.tabContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.tabButton,
                                    activeTab === "amountToPoints" && styles.activeTab,
                                ]}
                                onPress={() => setActiveTab("amountToPoints")}
                            >
                                <Text
                                    style={[
                                        styles.tabText,
                                        activeTab === "amountToPoints" && styles.activeTabText,
                                    ]}
                                >
                                    Amount → Points
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.tabButton,
                                    activeTab === "pointsToAmount" && styles.activeTab,
                                ]}
                                onPress={() => setActiveTab("pointsToAmount")}
                            >
                                <Text
                                    style={[
                                        styles.tabText,
                                        activeTab === "pointsToAmount" && styles.activeTabText,
                                    ]}
                                >
                                    Points → Amount
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Tab Content */}
                        {activeTab === "amountToPoints" ? (
                            <>
                                {/* Date */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>DATE</Text>
                                    <TouchableOpacity
                                        style={styles.input}
                                        onPress={() => setOpenDatePicker1(true)}
                                    >
                                        <Text style={{ color: "#00363A" }}>
                                            {rateDate1.toLocaleDateString("en-GB", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </Text>
                                    </TouchableOpacity>
                                    <DatePicker
                                        modal
                                        open={openDatePicker1}
                                        date={rateDate1}
                                        mode="date"
                                        onConfirm={(selectedDate) => {
                                            setOpenDatePicker1(false);
                                            setRateDate1(selectedDate);
                                        }}
                                        onCancel={() => setOpenDatePicker1(false)}
                                    />
                                </View>

                                {/* Amount */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>AMOUNT</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={amount1}
                                        onChangeText={setAmount1}
                                        keyboardType="numeric"
                                        placeholder="Enter amount"
                                    />
                                </View>

                                {/* Points */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>POINTS</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={points1}
                                        onChangeText={setPoints1}
                                        keyboardType="numeric"
                                        placeholder="Enter points"
                                    />
                                </View>

                                {/* Buttons */}
                                <View style={styles.buttonRow}>
                                    <TouchableOpacity
                                        style={[styles.button, styles.saveBtn]}
                                        onPress={saveTab1}
                                    >
                                        <Text style={styles.saveText}>SAVE</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.button, styles.clearBtn]}
                                        onPress={clearTab1}
                                    >
                                        <Text style={styles.clearText}>CLEAR</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : (
                            <>
                                {/* Date */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>DATE</Text>
                                    <TouchableOpacity
                                        style={styles.input}
                                        onPress={() => setOpenDatePicker2(true)}
                                    >
                                        <Text style={{ color: "#00363A" }}>
                                            {rateDate2.toLocaleDateString("en-GB", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </Text>
                                    </TouchableOpacity>
                                    <DatePicker
                                        modal
                                        open={openDatePicker2}
                                        date={rateDate2}
                                        mode="date"
                                        onConfirm={(selectedDate) => {
                                            setOpenDatePicker2(false);
                                            setRateDate2(selectedDate);
                                        }}
                                        onCancel={() => setOpenDatePicker2(false)}
                                    />
                                </View>

                                {/* Points */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>POINTS</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={points2}
                                        onChangeText={setPoints2}
                                        keyboardType="numeric"
                                        placeholder="Enter points"
                                    />
                                </View>

                                {/* Amount */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>AMOUNT</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={amount2}
                                        onChangeText={setAmount2}
                                        keyboardType="numeric"
                                        placeholder="Enter amount"
                                    />
                                </View>

                                {/* Buttons */}
                                <View style={styles.buttonRow}>
                                    <TouchableOpacity
                                        style={[styles.button, styles.saveBtn]}
                                        onPress={saveTab2}
                                    >
                                        <Text style={styles.saveText}>SAVE</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.button, styles.clearBtn]}
                                        onPress={clearTab2}
                                    >
                                        <Text style={styles.clearText}>CLEAR</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#E6F9FF" },
    imageContainer: { position: "absolute", top: 0, left: 0, right: 0, height: hp("30%") },
    topImage: { width: wp("100%"), height: hp("40%") },
    card: {
        backgroundColor: "#fff",
        marginHorizontal: wp("5%"),
        marginTop:hp("10%"),
        borderRadius: wp("3%"),
        padding: wp("4%"),
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: wp("1%"),
    },
    headingContainer: { alignItems: "center", marginBottom: hp("2%") },
    headingText: {
        fontSize: wp("5%"),
        fontWeight: "bold",
        color: "#006A72",
        letterSpacing: wp("0.3%"),
        textTransform: "uppercase",
    },
    tabContainer: {
        flexDirection: "row",
        marginBottom: hp("2%"),
        borderRadius: 30, // large for pill effect
        backgroundColor: "#D9F5F7", // light background
        padding: hp("0.5%"),
        overflow: "hidden",
    },

    tabButton: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: hp("1.5%"),
        borderRadius: 30, // match container radius for smooth highlight edges
    },

    activeTab: {
        backgroundColor: "#006A72", // highlight color
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3, // Android shadow
    },

    tabText: {
        color: "#006A72",
        fontWeight: "bold",
        fontSize: wp("4%"),
    },

    activeTabText: {
        color: "#fff",
    },

    inputContainer: { marginBottom: hp("1.5%") },
    label: {
        fontSize: wp("3.2%"),
        fontWeight: "600",
        color: "#006A72",
        marginBottom: hp("0.5%"),
    },
    input: {
        borderWidth: 1,
        borderColor: "#8FD6DA",
        borderRadius: wp("2%"),
        paddingHorizontal: wp("3%"),
        paddingVertical: hp("1.2%"),
        fontSize: wp("3.5%"),
        backgroundColor: "#fff",
        color: "#00363A",
    },
    buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: hp("1%") },
    button: {
        flex: 1,
        paddingVertical: hp("1.8%"),
        borderRadius: wp("8%"),
        alignItems: "center",
        marginHorizontal: wp("1.5%"),
    },
    saveBtn: { backgroundColor: "#006A72" },
    saveText: { color: "#fff", fontWeight: "bold", fontSize: wp("4%") },
    clearBtn: { backgroundColor: "#D9F5F7" },
    clearText: { color: "#006A72", fontWeight: "bold", fontSize: wp("4%") },
});
