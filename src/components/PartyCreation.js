import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TextInput, 
    TouchableOpacity, 
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ImageBackground,
    Keyboard,
    TouchableWithoutFeedback,
    Alert
} from 'react-native';
import { BASE_URL , fcomCode } from './Services';
import { showConfirmation } from './AlertUtils';

const PartyCreation = () => {
    const [loyaltyNumber, setLoyaltyNumber] = useState('');
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    
    // Refs for focus navigation
    const loyaltyNumberRef = useRef();
    const nameRef = useRef();
    const phoneNumberRef = useRef();
    const addressRef = useRef();

    useEffect(() => {
        // Set today's date when component mounts
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const formattedDate = `${day}/${month}/${today.getFullYear()}`;
        setCurrentDate(formattedDate);
    }, []);

    const handleSave = () => {
    newCustomer();
    };

    const handleClear = () => {
        // Clear all form inputs
        setLoyaltyNumber('');
        setName('');
        setPhoneNumber('');
        setAddress('');
    };

    const newCustomer = async () => {
        const payload = {
            loyaltyNumber: loyaltyNumber,
            customerName: name,
            phonenumber: phoneNumber,
            address: address,
            joindate: currentDate,
            fcompcode: fcomCode
        };
        console.log('Payload:', payload);
        try{
            const response = await axios.post(`${BASE_URL}Register/newCustomer`, payload)
            
                if(response.status === 200) {
                   Alert.alert('Success', 'Customer created successfully');
                   console.log('New customer created:', response.data);
                   handleClear();
                }
                else {
                    Alert.alert('Error', 'Failed to create new customer');
                }
        }
        catch(error) {
            console.error('Error creating new customer:', error);
        }
    }
    
    // Reusable input component similar to CompanyCreation
    const renderInput = (
        label,
        value,
        setValue,
        keyboard = "default",
        refProp = null,
        onSubmitEditing = null,
        returnKeyType = "next",
        multiline = false,
        numberOfLines = 1,
        autoCapitalize = "characters"
    ) => (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputWrapper}>
                <TextInput
                    style={[styles.input, multiline && styles.textArea]}
                    value={value}
                    onChangeText={setValue}
                    keyboardType={keyboard}
                    ref={refProp}
                    returnKeyType={returnKeyType}
                    onSubmitEditing={onSubmitEditing}
                    blurOnSubmit={false}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    autoCapitalize={autoCapitalize}
                />
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
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }} // Extra padding at bottom
                    keyboardShouldPersistTaps="handled"
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                        <View style={{flex: 1}}>
                            {/* Header */}
                            <View style={styles.header}>
                                <Text style={styles.headerText}>Add User</Text>
                            </View>
                            
                            {/* Form Card */}
                            <View style={styles.card}>
                                <Text style={styles.subtitle}>
                                    Fill in the details below to add a new user.
                                </Text>
                            
                                {/* Date Display */}
                                <View style={styles.dateContainer}>
                                    <Text style={styles.dateLabel}>DATE:</Text>
                                    <Text style={styles.dateValue}>{currentDate}</Text>
                                </View>
                                
                                {/* Form Fields */}
                                {renderInput(
                                    "LOYALTY NUMBER",
                                    loyaltyNumber,
                                    setLoyaltyNumber,
                                    "numeric",
                                    loyaltyNumberRef,
                                    () => nameRef.current.focus()
                                )}
                                
                                {renderInput(
                                    "NAME",
                                    name,
                                    setName,
                                    "default",
                                    nameRef,
                                    () => phoneNumberRef.current.focus()
                                )}
                                
                                {renderInput(
                                    "PHONE NUMBER",
                                    phoneNumber,
                                    setPhoneNumber,
                                    "phone-pad",
                                    phoneNumberRef,
                                    () => addressRef.current.focus()
                                )}
                                
                                {renderInput(
                                    "ADDRESS",
                                    address,
                                    setAddress,
                                    "default",
                                    addressRef,
                                    () => handleSave(),
                                    "done",
                                    true,
                                    3,
                                    "sentences"
                                )}
                                
                                {/* Buttons */}
                                <View style={styles.buttonRow}>
                                    <TouchableOpacity
                                        style={[styles.button, styles.saveBtn]}
                                        onPress={handleSave}
                                    >
                                        <Text style={styles.saveText}>SAVE</Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity
                                        style={[styles.button, styles.clearBtn]}
                                        onPress={handleClear}
                                    >
                                        <Text style={styles.clearText}>CLEAR</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#ffffff'
    },
    header: {
        backgroundColor: '#006A72ff',
        padding: 20,
        paddingTop: 50,
        alignItems: 'center',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerText: {
        fontSize: 24,
        color: 'white',
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        margin: 15,
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    subtitle: {
        fontSize: 14,
        color: "#006A72",
        marginBottom: 20,
        textAlign: "center",
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginBottom: 15,
    },
    dateLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#006A72",
        marginRight: 8,
    },
    dateValue: {
        fontSize: 14,
        color: "#00363A",
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
        flex: 1,
    },
    textArea: {
        height: 80,
        textAlignVertical: "top",
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: "center",
        marginHorizontal: 5,
    },
    saveBtn: { 
        backgroundColor: "#006A72" 
    },
    saveText: { 
        color: "#ffffff", 
        fontWeight: "bold" 
    },
    clearBtn: { 
        backgroundColor: "#D9F5F7" 
    },
    clearText: { 
        color: "#006A72", 
        fontWeight: "bold" 
    },
});

export default PartyCreation;