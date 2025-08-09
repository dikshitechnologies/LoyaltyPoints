import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ImageBackground,
} from "react-native";
import DatePicker from "react-native-date-picker";

export default function CompanyCreationScreen() {
    const [date, setDate] = useState(new Date());
    const [open, setOpen] = useState(false);

    const [companyName, setCompanyName] = useState("");
    const [gstin, setGstin] = useState("");
    const [phone, setPhone] = useState("");
    const [address1, setAddress1] = useState("");
    const [address2, setAddress2] = useState("");
    const [address3, setAddress3] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rePassword, setRePassword] = useState("");

    const clearForm = () => {
        setDate(new Date());
        setCompanyName("");
        setGstin("");
        setPhone("");
        setAddress1("");
        setAddress2("");
        setAddress3("");
        setUsername("");
        setPassword("");
        setRePassword("");
    };

    const register = () => {
        console.log({
            date,
            companyName,
            gstin,
            phone,
            address1,
            address2,
            address3,
            username,
            password,
            rePassword,
        });
    };

    const renderInput = (
        label,
        value,
        setValue,
        secure = false,
        keyboard = "default",
        style = {}
    ) => (
        <View style={[styles.inputContainer, style]}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={setValue}
                secureTextEntry={secure}
                keyboardType={keyboard}
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header Image */}
                    <ImageBackground
                        source={require("./assets/image.png")}
                        style={styles.header}
                        resizeMode="cover"
                    >
                      
                    </ImageBackground>

                    {/* Form Card */}
                    <View style={styles.card}>
                        <Text style={styles.subtitle}>
                            Fill in the details below to register your company.
                        </Text>

                        {/* Row 1 */}
                        <View style={styles.row}>
                            <View style={[styles.inputContainer, { flex: 1, marginRight: 6 }]}>
                                <Text style={styles.label}>CREATION DATE</Text>
                                <TouchableOpacity
                                    style={styles.input}
                                    onPress={() => setOpen(true)}
                                >
                                    <Text style={{ color: "#000" }}>
                                        {date ? date.toLocaleDateString() : "Select Date"}
                                    </Text>
                                </TouchableOpacity>
                                <DatePicker
                                    modal
                                    open={open}
                                    date={date}
                                    mode="date"
                                    onConfirm={(selectedDate) => {
                                        setOpen(false);
                                        setDate(selectedDate);
                                    }}
                                    onCancel={() => setOpen(false)}
                                />
                            </View>
                            {renderInput(
                                "COMPANY NAME",
                                companyName,
                                setCompanyName,
                                false,
                                "default",
                                { flex: 1, marginLeft: 6 }
                            )}
                        </View>

                        {/* Row 2 */}
                        <View style={styles.row}>
                            {renderInput(
                                "GSTIN",
                                gstin,
                                setGstin,
                                false,
                                "default",
                                { flex: 1, marginRight: 6 }
                            )}
                            {renderInput(
                                "PHONE",
                                phone,
                                setPhone,
                                false,
                                "phone-pad",
                                { flex: 1, marginLeft: 6 }
                            )}
                        </View>

                        {/* Addresses */}
                        {renderInput("ADDRESS 1", address1, setAddress1)}
                        {renderInput("ADDRESS 2", address2, setAddress2)}
                        {renderInput("ADDRESS 3", address3, setAddress3)}

                        {/* Username */}
                        {renderInput("USERNAME", username, setUsername)}

                        {/* Password Row */}
                        <View style={styles.row}>
                            {renderInput(
                                "PASSWORD",
                                password,
                                setPassword,
                                false,
                                "default",
                                { flex: 1, marginRight: 6 }
                            )}
                            {renderInput(
                                "RE-ENTER PASSWORD",
                                rePassword,
                                setRePassword,
                                true,
                                "default",
                                { flex: 1, marginLeft: 6 }
                            )}
                        </View>

                        {/* Buttons */}
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.button, styles.registerBtn]}
                                onPress={register}
                            >
                                <Text style={styles.registerText}>REGISTER</Text>
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
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#EDE7F6" },
    header: {
        width: "100%",
        aspectRatio: 1.9, // Keeps image proportionate
        justifyContent: "center",
        alignItems: "center",
    },
    headerText: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#fff",
        backgroundColor: "rgba(0,0,0,0.3)",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
    },
    card: {
        backgroundColor: "#fff",
        marginHorizontal: 20,
        marginTop: -10,
        borderRadius: 12,
        padding: 15,
        elevation: 3,
    },
    subtitle: {
        fontSize: 14,
        color: "#555",
        marginBottom: 20,
        textAlign: "center",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    inputContainer: {
        marginBottom: 12,
    },
    label: {
        fontSize: 12,
        fontWeight: "600",
        color: "#555",
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        backgroundColor: "#fff",
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
    registerBtn: { backgroundColor: "#7E57C2" },
    registerText: { color: "#fff", fontWeight: "bold" },
    clearBtn: { backgroundColor: "#ECECEC" },
    clearText: { color: "#555", fontWeight: "bold" },
});
