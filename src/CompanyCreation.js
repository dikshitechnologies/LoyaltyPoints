import React, { useState, useRef } from "react";
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
    Alert
} from "react-native";
import DatePicker from "react-native-date-picker";

export default function CompanyCreationScreen({ navigation }) {
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

    const [showPassword, setShowPassword] = useState(false);
    const [showRePassword, setShowRePassword] = useState(false);

    // Refs for navigation
    const gstinRef = useRef();
    const phoneRef = useRef();
    const address1Ref = useRef();
    const address2Ref = useRef();
    const usernameRef = useRef();
    const passwordRef = useRef();
    const rePasswordRef = useRef();

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


        navigation.navigate("RateFixing", {
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
        style = {},
        refProp = null,
        onSubmitEditing = null,
        showEye = false,
        toggleEye = null,
        returnKeyType = "next"
    ) => (
        <View style={[styles.inputContainer, style]}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputWrapper}>
                <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={value}
                    onChangeText={setValue}
                    secureTextEntry={secure}
                    keyboardType={keyboard}
                    ref={refProp}
                    returnKeyType={returnKeyType}
                    onSubmitEditing={onSubmitEditing}
                    blurOnSubmit={false}
                />
                {showEye && (
                    <TouchableOpacity onPress={toggleEye} style={styles.eyeIcon}>
                        <Text style={{ fontSize: 18 }}>
                            {secure ? "🔒" : "🔓"}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
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
                    {/* Header Image with Title */}
                    <ImageBackground
                        source={require("./assets/image.png")}
                        style={styles.header}
                        resizeMode="cover"
                    >
                        <Text style={styles.headerText}>Company Creation</Text>
                    </ImageBackground>

                    {/* Form Card */}
                    <View style={styles.card}>
                        <Text style={styles.subtitle}>
                            Fill in the details below to register your company.
                        </Text>

                        {/* Creation Date */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>CREATION DATE</Text>
                            <TouchableOpacity
                                style={styles.input}
                                onPress={() => setOpen(true)}
                            >
                                <Text style={{ color: "#000" }}>
                                    {date
                                        ? date.toLocaleDateString("en-GB", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })
                                        : "Select Date"}
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

                        {/* Company Name */}
                        {renderInput(
                            "COMPANY NAME",
                            companyName,
                            setCompanyName,
                            false,
                            "default",
                            {},
                            null,
                            () => gstinRef.current.focus()
                        )}

                        {/* GSTIN & Phone */}
                        <View style={styles.row}>
                            {renderInput(
                                "GSTIN",
                                gstin,
                                setGstin,
                                false,
                                "default",
                                { flex: 1, marginRight: 6 },
                                gstinRef,
                                () => phoneRef.current.focus()
                            )}
                            {renderInput(
                                "PHONE",
                                phone,
                                setPhone,
                                false,
                                "phone-pad",
                                { flex: 1, marginLeft: 6 },
                                phoneRef,
                                () => address1Ref.current.focus()
                            )}
                        </View>

                        {/* Addresses */}
                        {renderInput(
                            "ADDRESS 1",
                            address1,
                            setAddress1,
                            false,
                            "default",
                            {},
                            address1Ref,
                            () => address2Ref.current.focus()
                        )}
                        {renderInput(
                            "ADDRESS 2",
                            address2,
                            setAddress2,
                            false,
                            "default",
                            {},
                            address2Ref,
                            () => usernameRef.current.focus()
                        )}

                        {/* Username */}
                        {renderInput(
                            "USERNAME",
                            username,
                            setUsername,
                            false,
                            "default",
                            {},
                            usernameRef,
                            () => passwordRef.current.focus()
                        )}

                        {/* Password & Re-enter */}
                        <View style={styles.row}>
                            {renderInput(
                                "PASSWORD",
                                password,
                                setPassword,
                                !showPassword,
                                "default",
                                { flex: 1, marginRight: 6 },
                                passwordRef,
                                () => rePasswordRef.current.focus(),
                                true,
                                () => setShowPassword(!showPassword)
                            )}
                            {renderInput(
                                "RE-ENTER PASSWORD",
                                rePassword,
                                setRePassword,
                                !showRePassword,
                                "default",
                                { flex: 1, marginLeft: 6 },
                                rePasswordRef,
                                () => {
                                    if (password !== rePassword) {
                                        Alert.alert("Password Mismatch", "Passwords do not match. Please re-enter.");
                                        setRePassword("");
                                    } else {
                                        register(); // If they match, directly call register
                                    }
                                },
                                true,
                                () => setShowRePassword(!showRePassword),
                                "done"
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
        backgroundColor: "rgba(0, 106, 114, 0.75)", // same teal tone as theme
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
        color: "#006A72",
        marginBottom: 5,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
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
    eyeIcon: {
        paddingHorizontal: 10,
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
