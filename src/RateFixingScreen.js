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

export default function RateFixingScreen({ route, navigation }) {
    const { companyName, date } = route.params;
    const [points, setPoints] = useState("");

    const saveRate = () => {
        console.log("Rate fixed for", companyName, ":", points);
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
                <ImageBackground
                    source={require("./assets/image.png")}
                    style={styles.header}
                    resizeMode="cover"
                >
                    <Text style={styles.headerText}>Rate Fixing</Text>
                </ImageBackground>

                <View style={styles.card}>
                    <Text style={styles.subtitle}>
                        Specify the points for {companyName} ({date.toLocaleDateString()})
                    </Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>RATE POINTS</Text>
                        <TextInput
                            style={styles.input}
                            value={points}
                            onChangeText={setPoints}
                            keyboardType="numeric"
                            placeholder="Enter points"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, styles.registerBtn]}
                        onPress={saveRate}
                    >
                        <Text style={styles.registerText}>SAVE</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#E6F9FF" },
    header: {
        width: "100%",
        aspectRatio: 1.9,
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
    button: {
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: "center",
        marginTop: 10,
    },
    registerBtn: { backgroundColor: "#006A72" },
    registerText: { color: "#ffffff", fontWeight: "bold" },
});
