import React, { useState } from "react";
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
} from "react-native";
import DatePicker from "react-native-date-picker";

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

    const saveTab1 = () => {
        console.log("Tab 1 saved:", { rateDate1, amount1, points1 });
    };
    const clearTab1 = () => {
        setRateDate1(new Date());
        setAmount1("");
        setPoints1("");
    };

    const saveTab2 = () => {
        console.log("Tab 2 saved:", { rateDate2, points2, amount2 });
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
                <Image
                    source={require("./assets/image.png")}
                    style={styles.topImage}
                    resizeMode="cover"
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
    imageContainer: { position: "absolute", top: 0, left: 0, right: 0, height: 250 },
    topImage: { width: "100%", height: "150%" },
    card: {
        backgroundColor: "#fff",
        marginHorizontal: 20,
        marginTop:150,
        borderRadius: 12,
        padding: 15,
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headingContainer: { alignItems: "center", marginBottom: 15 },
    headingText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#006A72",
        letterSpacing: 1,
        textTransform: "uppercase",
    },
    tabContainer: { flexDirection: "row", marginBottom: 15, borderRadius: 8, overflow: "hidden" },
    tabButton: {
        flex: 1,
        backgroundColor: "#D9F5F7",
        paddingVertical: 10,
        alignItems: "center",
    },
    activeTab: { backgroundColor: "#006A72" },
    tabText: { color: "#006A72", fontWeight: "bold" },
    activeTabText: { color: "#fff" },
    inputContainer: { marginBottom: 12 },
    label: {
        fontSize: 12,
        fontWeight: "600",
        color: "#006A72",
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: "#8FD6DA",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        backgroundColor: "#fff",
        color: "#00363A",
    },
    buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: "center",
        marginHorizontal: 5,
    },
    saveBtn: { backgroundColor: "#006A72" },
    saveText: { color: "#fff", fontWeight: "bold" },
    clearBtn: { backgroundColor: "#D9F5F7" },
    clearText: { color: "#006A72", fontWeight: "bold" },
});
