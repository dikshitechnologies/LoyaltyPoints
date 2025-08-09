import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Switch } from 'react-native';

const PartyCreation = () => {
    const [partyName, setPartyName] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [description, setDescription] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Create Party</Text>
                <Text style={styles.subHeaderText}>Earn points with social events</Text>
            </View>
            
            <ScrollView style={styles.content}>
                <View style={styles.formContainer}>
                    <Text style={styles.label}>Party Name</Text>
                    <TextInput 
                        style={styles.input}
                        value={partyName}
                        onChangeText={setPartyName}
                        placeholder="Enter party name"
                    />
                    
                    <Text style={styles.label}>Location</Text>
                    <TextInput 
                        style={styles.input}
                        value={location}
                        onChangeText={setLocation}
                        placeholder="Enter location"
                    />
                    
                    <View style={styles.rowContainer}>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Date</Text>
                            <TextInput 
                                style={styles.input}
                                value={date}
                                onChangeText={setDate}
                                placeholder="MM/DD/YYYY"
                            />
                        </View>
                        
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Time</Text>
                            <TextInput 
                                style={styles.input}
                                value={time}
                                onChangeText={setTime}
                                placeholder="HH:MM AM/PM"
                            />
                        </View>
                    </View>
                    
                    <Text style={styles.label}>Description</Text>
                    <TextInput 
                        style={[styles.input, styles.textArea]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Enter party description"
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                    
                    <View style={styles.switchContainer}>
                        <Text style={styles.label}>Private Event</Text>
                        <Switch
                            value={isPrivate}
                            onValueChange={setIsPrivate}
                            trackColor={{ false: '#DDDDDD', true: '#1E88E5' }}
                            thumbColor={isPrivate ? '#FFFFFF' : '#f4f3f4'}
                        />
                    </View>
                    
                    <TouchableOpacity style={styles.createButton}>
                        <Text style={styles.createButtonText}>Create Party</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.pointsInfoContainer}>
                        <Text style={styles.pointsInfoText}>
                            You will earn <Text style={styles.pointsHighlight}>500 points</Text> for hosting this party!
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        backgroundColor: '#1E88E5',
        padding: 20,
        paddingTop: 50,
        alignItems: 'center',
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
        padding: 15,
    },
    formContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    input: {
        backgroundColor: '#F9F9F9',
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#DDDDDD',
    },
    textArea: {
        height: 100,
        paddingTop: 12,
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfInput: {
        width: '48%',
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    createButton: {
        backgroundColor: '#1E88E5',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginTop: 10,
    },
    createButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    pointsInfoContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#E3F2FD',
        borderRadius: 8,
        alignItems: 'center',
    },
    pointsInfoText: {
        textAlign: 'center',
        color: '#333',
    },
    pointsHighlight: {
        fontWeight: 'bold',
        color: '#1E88E5',
    },
});

export default PartyCreation;