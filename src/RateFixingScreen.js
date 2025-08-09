import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    ImageBackground
} from "react-native";
import DatePicker from "react-native-date-picker";

export default function RateFixingScreen({ route, navigation }) {
    const { companyName, date: creationDate } = route.params;

    const [rateDate, setRateDate] = useState(new Date());
    const [openDatePicker, setOpenDatePicker] = useState(false);

    const [amount, setAmount] = useState("");
    const [points, setPoints] = useState("");

    const saveRate = () => {
        console.log("Saving Rate Fixing Details:", {
            companyName,
            creationDate,
            rateDate,
            amount,
            points
        });
        navigation.goBack();
    };

    const clearForm = () => {
        setRateDate(new Date());
        setAmount("");
        setPoints("");
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
                {/* Header */}
                <ImageBackground
                    source={require("./assets/image.png")}
                    style={styles.header}
                    resizeMode="cover"
                >
                    
                </ImageBackground>

                {/* Card */}
                <View style={styles.card}>
                    <Text style={styles.subtitle}>
                        Fix Points for {companyName}
                       
                    </Text>

                    {/* Date */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>DATE</Text>
                        <TouchableOpacity
                            style={styles.input}
                            onPress={() => setOpenDatePicker(true)}
                        >
                            <Text style={{ color: "#00363A" }}>
                                {rateDate.toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric"
                                })}
                            </Text>
                        </TouchableOpacity>
                        <DatePicker
                            modal
                            open={openDatePicker}
                            date={rateDate}
                            mode="date"
                            onConfirm={(selectedDate) => {
                                setOpenDatePicker(false);
                                setRateDate(selectedDate);
                            }}
                            onCancel={() => setOpenDatePicker(false)}
                        />
                    </View>

                    {/* Amount */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>AMOUNT</Text>
                        <TextInput
                            style={styles.input}
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                            placeholder="Enter amount"
                        />
                    </View>

                    {/* Points */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>POINTS</Text>
                        <TextInput
                            style={styles.input}
                            value={points}
                            onChangeText={setPoints}
                            keyboardType="numeric"
                            placeholder="Enter points"
                        />
                    </View>

                    {/* Buttons Row */}
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.button, styles.registerBtn]}
                            onPress={saveRate}
                        >
                            <Text style={styles.registerText}>SAVE</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.clearBtn]}
                            onPress={clearForm}
                        >
                            <Text style={styles.clearText}>CLEAR</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#E6F9FF" },
    header: {
        width: "100%",
        aspectRatio: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    headerText: {
        marginTop: 90,
        fontSize: 22,
        fontWeight: "600",
        color: "#ffffff",
        backgroundColor: "rgba(0, 106, 114, 0.75)",
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 25,
        letterSpacing: 1,
        overflow: "hidden",
    },
    card: {
        backgroundColor: "#ffffff",
        marginHorizontal: 20,
        marginTop: -20,
        borderRadius: 12,
        padding: 15,
        elevation: 3,
    },
    subtitle: {
        fontSize: 14,
        color: "#006A72",
        marginBottom: 20,
        textAlign: "center",
    },
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
        backgroundColor: "#ffffff",
        color: "#00363A",
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 8,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: "center",
        marginHorizontal: 5,
    },
    registerBtn: { backgroundColor: "#006A72" },
    registerText: { color: "#ffffff", fontWeight: "bold" },
    clearBtn: { backgroundColor: "#D9F5F7" },
    clearText: { color: "#006A72", fontWeight: "bold" },
});
