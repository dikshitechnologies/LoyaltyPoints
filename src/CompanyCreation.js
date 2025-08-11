import React, { useState, useRef } from "react";
import axios from "axios";
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
    Image,
    Alert,
} from "react-native";
import DatePicker from "react-native-date-picker";
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from "react-native-responsive-screen";

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

    const [gstinError, setGstinError] = useState("");
    const [phoneError, setPhoneError] = useState("");

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
        setGstinError("");
        setPhoneError("");
    };

    const validateGstin = (text) => {
        const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        if (!gstinRegex.test(text)) return "Invalid GSTIN format";
        return "";
    };

    const validatePhone = (text) => {
        const phoneRegex = /^[6-9][0-9]{9}$/;
        if (!phoneRegex.test(text)) return "Invalid phone number";
        return "";
    };

    const register = async () => {
        if (
            !companyName.trim() ||
            !address1.trim() ||
            !username.trim() ||
            !password ||
            !rePassword
        ) {
            Alert.alert("Missing Fields", "Please fill all the required fields.");
            return;
        }

        if (password !== rePassword) {
            Alert.alert("Password Mismatch", "Passwords do not match. Please re-enter.");
            return;
        }

        try {
            const payload = {
                companyCode: "",
                companyName: companyName.trim(),
                gstNumber: gstin.trim(),
                phone: phone.trim(),
                addressLine1: address1.trim(),
                addressLine2: address2.trim(),
                userName: username.trim(),
                password: password,
                roleFlag: "N",
            };

            const response = await axios.post(
                "http://dikshi.ddns.net/loyaltypoints/api/Company",
                payload,
                { headers: { "Content-Type": "application/json" } }
            );

            if (response.status === 201) {
                Alert.alert("Success", "Company registered successfully!");
                clearForm();
                navigation.navigate("Login");
            } else {
                Alert.alert("Error", `Unexpected server response: ${response.status}`);
            }
        } catch (error) {
            console.error("Registration Error:", error.message);
            if (error.message.includes("Network")) {
                Alert.alert(
                    "Network Error",
                    "Cannot connect to server. Please check your internet or server address."
                );
            } else {
                Alert.alert("Error", "Failed to register company. Please try again.");
            }
        }
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
        returnKeyType = "next",
        onBlur = null
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
                    onBlur={onBlur}
                    autoCapitalize="characters"
                />
                {showEye && (
                    <TouchableOpacity onPress={toggleEye} style={styles.eyeIcon}>
                        <Text style={{ fontSize: wp("4.5%") }}>{secure ? "🔒" : "🔓"}</Text>
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
                keyboardVerticalOffset={Platform.OS === "ios" ? hp("12%") : 0}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: hp("10%") }}
                    keyboardShouldPersistTaps="handled"
                >
                    <Image
                        source={require("./assets/image1.png")}
                        style={styles.topImage}
                        resizeMode="cover"
                    />
                    <View style={styles.card}>
                        <View style={styles.headingContainer}>
                            <Text style={styles.headingText}>COMPANY CREATION</Text>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>CREATION DATE</Text>
                            <TouchableOpacity style={styles.input} onPress={() => setOpen(true)}>
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

                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: wp("1.5%") }}>
                                {renderInput(
                                    "GSTIN",
                                    gstin,
                                    (text) => {
                                        setGstin(text.toUpperCase());
                                    },
                                    false,
                                    "default",
                                    {},
                                    gstinRef,
                                    () => {
                                        const error = validateGstin(gstin);
                                        setGstinError(error);
                                        if (!error) phoneRef.current.focus();
                                    },
                                    false,
                                    null,
                                    "next"
                                )}
                                {gstinError ? <Text style={styles.errorText}>{gstinError}</Text> : null}
                            </View>

                            <View style={{ flex: 1, marginLeft: wp("1.5%") }}>
                                {renderInput(
                                    "PHONE",
                                    phone,
                                    (text) => {
                                        setPhone(text);
                                    },
                                    false,
                                    "phone-pad",
                                    {},
                                    phoneRef,
                                    () => {
                                        const error = validatePhone(phone);
                                        setPhoneError(error);
                                        if (!error) address1Ref.current.focus();
                                    },
                                    false,
                                    null,
                                    "next"
                                )}
                                {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
                            </View>
                        </View>

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

                        <View style={styles.row}>
                            {renderInput(
                                "PASSWORD",
                                password,
                                setPassword,
                                !showPassword,
                                "default",
                                { flex: 1, marginRight: wp("1.5%") },
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
                                { flex: 1, marginLeft: wp("1.5%") },
                                rePasswordRef,
                                () => {
                                    if (password !== rePassword) {
                                        Alert.alert(
                                            "Password Mismatch",
                                            "Passwords do not match. Please re-enter."
                                        );
                                        setRePassword("");
                                    } else {
                                        register();
                                    }
                                },
                                true,
                                () => setShowRePassword(!showRePassword),
                                "done"
                            )}
                        </View>

                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.button, styles.registerBtn]}
                                onPress={register}
                            >
                                <Text style={styles.registerText}>REGISTER</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, styles.clearBtn]} onPress={clearForm}>
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
    topImage: { width: wp("100%"), height: hp("25%") },
    card: {
        backgroundColor: "#ffffff",
        marginHorizontal: wp("5%"),
        marginTop: -hp("2.5%"),
        borderRadius: wp("3%"),
        padding: wp("4%"),
        elevation: 3,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    headingContainer: {
        alignItems: "center",
        marginVertical: hp("2%"),
    },
    headingText: {
        marginTop: -hp("0.5%"),
        fontSize: wp("5%"),
        fontWeight: "bold",
        color: "#006A72",
        letterSpacing: 1,
        textTransform: "uppercase",
    },
    inputContainer: {
        marginBottom: hp("1.5%"),
    },
    label: {
        fontSize: wp("3%"),
        fontWeight: "600",
        color: "#006A72",
        marginBottom: hp("0.5%"),
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
    },
    input: {
        borderWidth: 1,
        borderColor: "#8FD6DA",
        borderRadius: wp("2%"),
        paddingHorizontal: wp("3%"),
        paddingVertical: hp("1.2%"),
        fontSize: wp("3.5%"),
        backgroundColor: "#ffffff",
        color: "#00363A",
    },
    eyeIcon: {
        paddingHorizontal: wp("2.5%"),
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: hp("1%"),
    },
    button: {
        flex: 1,
        paddingVertical: hp("1.5%"),
        borderRadius: wp("6%"),
        alignItems: "center",
        marginHorizontal: wp("1%"),
    },
    registerBtn: { backgroundColor: "#006A72" },
    registerText: { color: "#ffffff", fontWeight: "bold" },
    clearBtn: { backgroundColor: "#D9F5F7" },
    clearText: { color: "#006A72", fontWeight: "bold" },
    errorText: {
        color: "red",
        fontSize: wp("3%"),
        marginTop: hp("0.2%"),
        marginLeft: wp("1%"),
    },
});
