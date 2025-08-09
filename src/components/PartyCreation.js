import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';

const PartyCreation = () => {
    const [loyaltyNumber, setLoyaltyNumber] = useState('');
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [currentDate, setCurrentDate] = useState('');

    useEffect(() => {
        // Set today's date when component mounts
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const formattedDate = `${day}/${month}/${today.getFullYear()}`;
        setCurrentDate(formattedDate);
    }, []);

    const handleSave = () => {
        // Save functionality will be implemented here
        console.log('Save button pressed');
    };

    const handleClear = () => {
        // Clear all form inputs
        setLoyaltyNumber('');
        setName('');
        setPhoneNumber('');
        setAddress('');
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Dikshi Loyalty</Text>
                <Text style={styles.subHeaderText}>User Create</Text>
            </View>
            
            <ScrollView style={styles.content}>
                <View style={styles.formContainerFullWidth}>
                    <View style={styles.dateContainer}>
                        <Text style={styles.dateLabel}>Date:</Text>
                        <Text style={styles.dateValue}>{currentDate}</Text>
                    </View>
                    
                    <View style={styles.inputRow}>
                        <Text style={styles.labelInRow}>Loyalty Number</Text>
                        <TextInput 
                            style={styles.inputInRow}
                            value={loyaltyNumber}
                            onChangeText={setLoyaltyNumber}
                            placeholder="Enter loyalty number"
                            keyboardType="numeric"
                        />
                    </View>
                    
                    <View style={styles.inputRow}>
                        <Text style={styles.labelInRow}>Name</Text>
                        <TextInput 
                            style={styles.inputInRow}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter name"
                        />
                    </View>
                    
                    <View style={styles.inputRow}>
                        <Text style={styles.labelInRow}>Phone Number</Text>
                        <TextInput 
                            style={styles.inputInRow}
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            placeholder="Enter phone number"
                            keyboardType="phone-pad"
                        />
                    </View>
                    
                    <View style={styles.inputRow}>
                        <Text style={styles.labelInRow}>Address</Text>
                        <TextInput 
                            style={[styles.inputInRow, styles.textArea]}
                            value={address}
                            onChangeText={setAddress}
                            placeholder="Enter address"
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>
                    
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={styles.buttonText}>Save</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                            <Text style={styles.buttonText}>Clear</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        backgroundColor: '#1E88E5',
        padding: 20,
        paddingTop: 50,
        alignItems: 'center',
        borderBottomLeftRadius: 38,
        borderBottomRightRadius: 38,
    },
    headerText: {
        fontSize: 24,
        color: 'white',
        fontWeight: 'bold',
    },
    subHeaderText: {
        fontSize: 16,
        color: 'white',
        marginTop: 5,
    },
    content: {
        flex: 1,
    },
    formContainerFullWidth: {
        padding: 20,
        paddingTop: 25,
        width: '100%',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginBottom: 15,
    },
    dateLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginRight: 8,
    },
    dateValue: {
        fontSize: 16,
        color: '#333',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    labelInRow: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        width: '30%',
        alignSelf: 'center',
    },
    input: {
        backgroundColor: '#F9F9F9',
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#DDDDDD',
    },
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    inputInRow: {
        backgroundColor: '#F9F9F9',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#DDDDDD',
        width: '68%',
    },
    halfInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '48%',
    },
    inputInHalfRow: {
        backgroundColor: '#F9F9F9',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#DDDDDD',
        flex: 1,
    },
    textArea: {
        height: 80,
        paddingTop: 12,
        textAlignVertical: 'top',
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    halfInput: {
        width: '48%',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 25,
        paddingHorizontal: 10,
    },
    saveButton: {
        backgroundColor: '#1E88E5',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        width: '48%',
    },
    clearButton: {
        backgroundColor: '#FF5722',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        width: '48%',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default PartyCreation;