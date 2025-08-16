import React, { useState, useRef, useCallback } from "react";
import axios from "axios";
import Video from "react-native-video";
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
    Alert,
    Modal,
    FlatList
} from "react-native";
import DatePicker from "react-native-date-picker";
import { useFocusEffect } from "@react-navigation/native";
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { handleStatusCodeError } from "./components/ErrorHandler";
import { BASE_URL } from "./components/Services";

export default function CreationScreen({ navigation }) {
    const [activeTab, setActiveTab] = useState("company");

    // --- Company Creation State ---
    const [date, setDate] = useState(new Date());
    const [open, setOpen] = useState(false);
    const [companyName, setCompanyName] = useState("");
    const [gstin, setGstin] = useState("");
    const [phone, setPhone] = useState("");
    const [address1, setAddress1] = useState("");
    const [address2, setAddress2] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rePassword, setRePassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showRePassword, setShowRePassword] = useState(false);
    const [gstinError, setGstinError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedGroupCode, setSelectedGroupCode] = useState(null);
    const [showGroupDropdown, setShowGroupDropdown] = useState(false);

    // --- Group Creation State ---
    const [groupName, setGroupName] = useState("");
    const [groupCode, setGroupCode] = useState("");
    const [groupList, setGroupList] = useState([]);

    // --- Refs for Company Form ---
    const gstinRef = useRef();
    const phoneRef = useRef();
    const address1Ref = useRef();
    const address2Ref = useRef();
    const usernameRef = useRef();
    const passwordRef = useRef();
    const rePasswordRef = useRef();

    // --- Refs for Group Form ---
    const groupCodeRef = useRef();

    // Fetch group list on focus
    useFocusEffect(
        useCallback(() => {
            getGroupNameList();
        }, [])
    );

    const getGroupNameList = async () => {
        try {
            const response = await axios.get(`${BASE_URL}GroupCreation/GetGroups`);
            if (response.status === 200) {
                setGroupList(response.data);
            } else {
                handleStatusCodeError(response.status, "Error fetching group name list");
            }
        } catch (error) {
            if (error.response) {
                handleStatusCodeError(
                    error.response.status,
                    error.response.data?.message || "An unexpected server error occurred."
                );
            } else if (error.request) {
                Alert.alert("Network Error", "No response received from the server. Please check your network connection.");
            } else {
                Alert.alert("Request Error", `Error: ${error.message}. This might be due to an invalid URL or network issue.`);
            }
        }
    };

    // --- Company Form Functions ---
    const clearCompanyForm = () => {
        setDate(new Date());
        setShowPassword(false);
        setShowRePassword(false);
        setCompanyName("");
        setGstin("");
        setPhone("");
        setAddress1("");
        setAddress2("");
        setUsername("");
        setPassword("");
        setRePassword("");
        setGstinError("");
        setPhoneError("");
        setSelectedGroup(null);
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

    const registerCompany = async () => {
        if (!companyName.trim() || !address1.trim() || !username.trim() || !password || !rePassword || !selectedGroup) {
            Alert.alert("Missing Fields", "Please fill all the required fields including selecting a group.");
            return;
        }

        if (password !== rePassword) {
            Alert.alert("Password Mismatch", "Passwords do not match. Please re-enter.");
            return;
        }

        try {
            const payload = {
                companyName: companyName.trim(),
                gstNumber: gstin.trim(),
                phone: phone.trim(),
                addressLine1: address1.trim(),
                addressLine2: address2.trim(),
                userName: username.trim(),
                password: password,
                roleFlag: "N",
                groupCode: selectedGroupCode 
            };
console.log(payload)
            const response = await axios.post(`${BASE_URL}Company/companyCreation`, payload, {
                headers: { "Content-Type": "application/json" },
            });
            
            if (response.status === 201 || response.status === 200) {
                Alert.alert("Success", "Company registered successfully!");
                clearCompanyForm();
                navigation.navigate("Login");
            } else {
                handleStatusCodeError(response.status, "Error registering company");
            }
        } catch (error) {
            if (error.response) {
                handleStatusCodeError(
                    error.response.status,
                    error.response.data?.message || "An unexpected server error occurred."
                );
            } else if (error.request) {
                Alert.alert("Network Error", "No response received from the server. Please check your network connection.");
            } else {
                Alert.alert("Request Error", `Error: ${error.message}. This might be due to an invalid URL or network issue.`);
            }
        }
    };

    // --- Group Form Functions ---
    const clearGroupForm = () => {
        setGroupName("");
        setGroupCode("");
    };

    const registerGroup = async () => {
        if (!groupName.trim() || !groupCode.trim()) {
            Alert.alert("Missing Fields", "Please enter both Group Name and Group Code.");
            return;
        }

        try {
            const payload = {
                fid: 0,
                fGroupCode: groupCode.trim(),
                fGroupName: groupName.trim(),
            };

            const response = await axios.post(`${BASE_URL}GroupCreation`, payload, {
                headers: { "Content-Type": "application/json" },
            });

            if (response.status === 201 || response.status === 200) {
                Alert.alert("Success", "Group created successfully!");
                clearGroupForm();
                getGroupNameList(); // Refresh the group list
            } else {
                handleStatusCodeError(response.status, "Error creating group");
            }
        } catch (error) {
            if (error.response) {
                handleStatusCodeError(
                    error.response.status,
                    error.response.data?.message || "An unexpected server error occurred."
                );
            } else if (error.request) {
                Alert.alert("Network Error", "No response received from the server. Please check your network connection.");
            } else {
                Alert.alert("Request Error", `Error: ${error.message}. This might be due to an invalid URL or network issue.`);
            }
        }
    };

    // --- Render Functions ---
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
        onBlur = null,
        multiline = false
    ) => (
        <View style={[styles.inputContainer, style]}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputWrapper}>
                <TextInput
                    style={[styles.input, { flex: 1, height: multiline ? hp('10%') : hp('5%'), textAlignVertical: multiline ? 'top' : 'center' }]}
                    value={value}
                    onChangeText={setValue}
                    secureTextEntry={secure}
                    keyboardType={keyboard}
                    ref={refProp}
                    returnKeyType={returnKeyType}
                    onSubmitEditing={onSubmitEditing}
                    blurOnSubmit={!multiline}
                    onBlur={onBlur}
                    autoCapitalize={label.includes("GSTIN") || label.includes("CODE") ? "characters" : "none"}
                    multiline={multiline}
                />
                {showEye && (
                    <TouchableOpacity onPress={toggleEye} style={styles.eyeIcon}>
                        <Text style={{ fontSize: wp("4.5%"), color: secure ? "#666" : "green" }}>
                            {secure ? "🔒" : "🔓"}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    const renderGroupDropdown = () => (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>SELECT GROUP</Text>
            <TouchableOpacity 
                style={styles.input} 
                onPress={() => setShowGroupDropdown(true)}
            >
                <Text style={{ color: selectedGroup ? "#000" : "#999" }}>
                    {selectedGroup ? selectedGroup.fGroupName : "Select a group"}
                </Text>
            </TouchableOpacity>
            
            <Modal
                visible={showGroupDropdown}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowGroupDropdown(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <FlatList
                            data={groupList}
                            keyExtractor={(item, index) => index + 1}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    onPress={() => {
                                        setSelectedGroup(item);
                                        setSelectedGroupCode(item.fGroupCode);
                                        setShowGroupDropdown(false);
                                    }}
                                >
                                    <Text>{item.fGroupName} ({item.fGroupCode})</Text>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <View style={styles.dropdownItem}>
                                    <Text>No groups available</Text>
                                </View>
                            }
                        />
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowGroupDropdown(false)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );

    const renderCompanyForm = () => (
        <>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>CREATION DATE</Text>
                <TouchableOpacity style={styles.input} onPress={() => setOpen(true)}>
                    <Text style={{ color: "#000", fontSize: wp("3.5%") }}>
                        {date.toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        })}
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

            {renderInput("COMPANY NAME", companyName, setCompanyName, false, "default", {}, null, () => gstinRef.current.focus())}

            {renderGroupDropdown()}

            <View style={styles.row}>
                <View style={{ flex: 1, marginRight: wp("1.5%") }}>
                    {renderInput("GSTIN", gstin, (text) => setGstin(text.toUpperCase()), false, "default", {}, gstinRef, () => {
                        const error = validateGstin(gstin);
                        setGstinError(error);
                        if (!error) phoneRef.current.focus();
                    })}
                    {gstinError ? <Text style={styles.errorText}>{gstinError}</Text> : null}
                </View>

                <View style={{ flex: 1, marginLeft: wp("1.5%") }}>
                    {renderInput("PHONE", phone, setPhone, false, "phone-pad", {}, phoneRef, () => {
                        const error = validatePhone(phone);
                        setPhoneError(error);
                        if (!error) address1Ref.current.focus();
                    })}
                    {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
                </View>
            </View>

            {renderInput("ADDRESS 1", address1, setAddress1, false, "default", {}, address1Ref, () => address2Ref.current.focus())}
            {renderInput("ADDRESS 2", address2, setAddress2, false, "default", {}, address2Ref, () => usernameRef.current.focus())}
            {renderInput("USERNAME", username, setUsername, false, "default", {}, usernameRef, () => passwordRef.current.focus())}

            <View style={styles.row}>
                {renderInput("PASSWORD", password, setPassword, !showPassword, "default", { flex: 1, marginRight: wp("1.5%") }, passwordRef, () => rePasswordRef.current.focus(), true, () => setShowPassword(!showPassword))}
                {renderInput("RE-ENTER PASSWORD", rePassword, setRePassword, !showRePassword, "default", { flex: 1, marginLeft: wp("1.5%") }, rePasswordRef, () => {
                    if (password !== rePassword) {
                        Alert.alert("Password Mismatch", "Passwords do not match. Please re-enter.");
                        setRePassword("");
                    } else {
                        registerCompany();
                    }
                }, true, () => setShowRePassword(!showRePassword), "done")}
            </View>

            <View style={styles.buttonRow}>
                <TouchableOpacity style={[styles.button, styles.registerBtn]} onPress={registerCompany}>
                    <Text style={styles.registerText}>REGISTER</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.clearBtn]} onPress={clearCompanyForm}>
                    <Text style={styles.clearText}>CLEAR</Text>
                </TouchableOpacity>
            </View>
        </>
    );

    const renderGroupForm = () => (
        <>
            {renderInput("GROUP NAME", groupName, setGroupName, false, "default", {}, null, () => groupCodeRef.current.focus())}

            {renderInput("GROUP CODE", groupCode, setGroupCode, false, "default", {}, groupCodeRef, registerGroup, false, null, "done")}

            <View style={styles.buttonRow}>
                <TouchableOpacity style={[styles.button, styles.registerBtn]} onPress={registerGroup}>
                    <Text style={styles.registerText}>CREATE GROUP</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.clearBtn]} onPress={clearGroupForm}>
                    <Text style={styles.clearText}>CLEAR</Text>
                </TouchableOpacity>
            </View>
        </>
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
                    <Video
                        source={require("./assets/Company.mp4")}
                        style={styles.topImage}
                        resizeMode="cover"
                        repeat
                        muted
                        autoplay
                        controls={false}
                    />
                    <View style={styles.card}>
                        <View style={styles.headingContainer}>
                            <Text style={styles.headingText}>
                                {activeTab === 'company' ? 'COMPANY CREATION' : 'GROUP CREATION'}
                            </Text>
                        </View>
                        <View style={styles.tabContainer}>
                            <TouchableOpacity
                                style={[styles.tabButton, activeTab === "company" && styles.activeTab]}
                                onPress={() => setActiveTab("company")}
                            >
                                <Text style={[styles.tabText, activeTab === "company" && styles.activeTabText]}>
                                    Company Creation
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.tabButton, activeTab === "group" && styles.activeTab]}
                                onPress={() => setActiveTab("group")}
                            >
                                <Text style={[styles.tabText, activeTab === "group" && styles.activeTabText]}>
                                    Group Creation
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {activeTab === "company" ? renderCompanyForm() : renderGroupForm()}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#E6F9FF" },
    topImage: { width: wp("100%"), height: hp("20%") },
    card: {
        backgroundColor: "#ffffff",
        marginHorizontal: wp("5%"),
        marginTop: -hp("2.5%"),
        borderRadius: wp("3%"),
        padding: wp("4%"),
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
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
    tabContainer: {
        flexDirection: "row",
        marginBottom: hp("2%"),
        borderRadius: 30,
        backgroundColor: "#D9F5F7",
        padding: hp("0.5%"),
        overflow: "hidden",
    },
    tabButton: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: hp("1.5%"),
        borderRadius: 30,
    },
    activeTab: {
        backgroundColor: "#006A72",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    tabText: {
        color: "#006A72",
        fontWeight: "bold",
        fontSize: wp("4%"),
    },
    activeTabText: {
        color: "#fff",
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
        marginTop: hp("2%"),
    },
    button: {
        flex: 1,
        paddingVertical: hp("1.5%"),
        borderRadius: wp("6%"),
        alignItems: "center",
        marginHorizontal: wp("1%"),
    },
    registerBtn: { backgroundColor: "#006A72" },
    registerText: { color: "#ffffff", fontWeight: "bold", fontSize: wp('3.5%') },
    clearBtn: { backgroundColor: "#D9F5F7" },
    clearText: { color: "#006A72", fontWeight: "bold", fontSize: wp('3.5%') },
    errorText: {
        color: "red",
        fontSize: wp("3%"),
        marginTop: hp("0.2%"),
        marginLeft: wp("1%"),
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        marginHorizontal: wp('5%'),
        borderRadius: wp('2%'),
        maxHeight: hp('50%'),
    },
    dropdownItem: {
        padding: wp('4%'),
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    closeButton: {
        padding: wp('4%'),
        backgroundColor: '#006A72',
        borderBottomLeftRadius: wp('2%'),
        borderBottomRightRadius: wp('2%'),
        alignItems: 'center',
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});