import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, ImageBackground, Image } from 'react-native';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useMemo } from 'react';
import bgcard from '../assets/bgcard.png';
// Default fallback fonts in case PlayfairDisplay-Bold isn't available yet



const ReportScreen = () => {
    const [loyaltyNumber, setLoyaltyNumber] = useState('');
    const [customerData, setCustomerData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Function to fetch customer data by loyalty number
    const fetchCustomerData = async (number) => {
        if (!number.trim()) return;
        
        setLoading(true);
        setError(null);
        
        try {
            // This would be an actual API call in production
            // For demonstration, simulating API response with mock data
            setTimeout(() => {
                const mockCustomerData = {
                    name: 'John Smith',
                    loyaltyNumber: number,
                    balancePoints: 3450,
                    transactions: [
                        { id: 1, date: '08/08/2025', amount: 5000, type: 'CR', description: 'Purchase at Store A' },
                        { id: 2, date: '07/28/2025', amount: 2500, type: 'CR', description: 'Purchase at Store B' },
                        { id: 3, date: '07/15/2025', amount: 1000, type: 'DR', description: 'Redemption - Gift Card' },
                        { id: 4, date: '07/05/2025', amount: 3500, type: 'CR', description: 'Purchase at Store C' },
                        { id: 5, date: '06/28/2025', amount: 2000, type: 'DR', description: 'Redemption - Discount' },
                        { id: 6, date: '06/15/2025', amount: 4500, type: 'CR', description: 'Purchase at Store D' }
                    ]
                };
                
                setCustomerData(mockCustomerData);
                setTransactions(mockCustomerData.transactions);
                setLoading(false);
            }, 1000);
        } catch (err) {
            setError('Failed to fetch customer data');
            setLoading(false);
            console.error('Error fetching customer data:', err);
        }
    };

    const handleSearch = () => {
        fetchCustomerData(loyaltyNumber);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Transaction Reports</Text>
            </View>
            
            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Enter Loyalty Number"
                        value={loyaltyNumber}
                        onChangeText={setLoyaltyNumber}
                        keyboardType="numeric"
                        returnKeyType="search"
                        onSubmitEditing={handleSearch}
                    />
                    <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                        <MaterialIcons name="search" size={24} color="#006A72ff" />
                    </TouchableOpacity>
                </View>
            </View>

            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#006A72ff" />
                    <Text style={styles.loadingText}>Loading customer data...</Text>
                </View>
            )}
            
            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {customerData && (
                <View style={styles.customerInfoContainer}>
                    <View style={styles.customerCard}>
                        <ImageBackground 
                            source={bgcard} 
                            style={styles.cardBackground}
                            imageStyle={{borderRadius: 16}}
                            resizeMode="cover"
                        >
                            {/* Loyalty number on top left */}
                            <View style={styles.loyaltyNumberContainer}>
                                <Text style={styles.infoLabel}>LOYALTY NUMBER</Text>
                                <Text style={styles.loyaltyNumberValue}>{customerData.loyaltyNumber}</Text>
                            </View>
                            
                            {/* Customer name in center */}
                            <View style={styles.centerNameContainer}>
                                <Text style={styles.customerName}>{customerData.name}</Text>
                            </View>
                            
                            {/* Valid till date on bottom left */}
                            <View style={styles.validTillContainer}>
                                <Text style={styles.infoLabel}>VALID TILL</Text>
                                <Text style={styles.validTillValue}>08/09/2026</Text>
                            </View>
                            
                            {/* Balance on bottom right */}
                            <View style={styles.balanceContainer}>
                                <Text style={styles.infoLabel}>BALANCE</Text>
                                <Text style={styles.balanceValue}>{customerData.balancePoints}</Text>
                            </View>
                        </ImageBackground>
                    </View>
                </View>
            )}
            
            {customerData && (
                <ScrollView style={styles.content}>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Transaction History</Text>
                        
                        <View style={styles.transactionHeader}>
                            <Text style={styles.headerDate}>Date</Text>
                            <Text style={styles.headerAmount}>Amount</Text>
                            <Text style={styles.headerType}>Type</Text>
                            <Text style={styles.headerDesc}>Description</Text>
                        </View>
                        
                        {transactions.map((transaction) => (
                            <View key={transaction.id} style={styles.transactionItem}>
                                <Text style={styles.transactionDate}>{transaction.date}</Text>
                                <Text style={styles.transactionAmount}>{transaction.amount}</Text>
                                <View style={styles.typeContainer}>
                                    {transaction.type === 'CR' ? (
                                        <MaterialIcons name="arrow-downward" size={20} color="#4CAF50" />
                                    ) : (
                                        <MaterialIcons name="arrow-upward" size={20} color="#F44336" />
                                    )}
                                    <Text style={[
                                        styles.transactionType,
                                        transaction.type === 'CR' ? styles.creditType : styles.debitType
                                    ]}>{transaction.type}</Text>
                                </View>
                                <Text style={styles.transactionDesc}>{transaction.description}</Text>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            )}

            {!customerData && !loading && !error && (
                <View style={styles.emptyStateContainer}>
                    <MaterialIcons name="search" size={80} color="#CCCCCC" />
                    <Text style={styles.emptyStateText}>Enter a loyalty number to view transaction details</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffffff',
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
    searchContainer: {
        padding: 15,
        paddingBottom: 5,
    },
    searchInputContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 25,
        alignItems: 'center',
        paddingLeft: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    searchInput: {
        flex: 1,
        height: 50,
        fontSize: 16,
    },
    searchButton: {
        padding: 10,
        borderTopRightRadius: 25,
        borderBottomRightRadius: 25,
        backgroundColor: '#F5F5F5',
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    customerInfoContainer: {
        padding: 15,
        paddingTop: 5,
        paddingBottom: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    customerCard: {
        borderRadius: 16,
        marginVertical: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
        overflow: 'hidden',
        width: '90%',
        height: 160, // Reduced height for simpler card
        position: 'relative',
        alignSelf: 'center',
    },
    cardBackground: {
        flex: 1,
        padding: 20,
        justifyContent: 'space-between',
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    centerNameContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    customerName: {
        fontSize: 28,
        color: '#FFFFFF',
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'System',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: {width: 1, height: 1},
        textShadowRadius: 3,
    },
    loyaltyNumberContainer: {
        position: 'absolute',
        top: 20,
        left: 20,
        alignItems: 'flex-start',
        zIndex: 2,
    },
    balanceContainer: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        alignItems: 'flex-end',
        zIndex: 2,
    },
    validTillContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        alignItems: 'flex-start',
        zIndex: 2,
    },
    validTillValue: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontFamily: 'System',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: {width: 0.5, height: 0.5},
        textShadowRadius: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#FFFFFF',
        opacity: 0.9,
        marginBottom: 5,
        fontFamily: 'System',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: {width: 0.5, height: 0.5},
        textShadowRadius: 1,
    },
    loyaltyNumberValue: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontFamily: 'System',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: {width: 0.5, height: 0.5},
        textShadowRadius: 1,
    },
    balanceValue: {
        fontSize: 20,
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontFamily: 'System',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: {width: 0.5, height: 0.5},
        textShadowRadius: 1,
    },
    content: {
        flex: 1,
        padding: 15,
        paddingTop: 5,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        paddingBottom: 10,
    },
    transactionHeader: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        marginBottom: 5,
    },
    headerDate: {
        width: '20%',
        fontWeight: 'bold',
        color: '#666',
        fontSize: 13,
    },
    headerAmount: {
        width: '20%',
        fontWeight: 'bold',
        color: '#666',
        fontSize: 13,
        textAlign: 'center',
    },
    headerType: {
        width: '20%',
        fontWeight: 'bold',
        color: '#666',
        fontSize: 13,
        textAlign: 'center',
    },
    headerDesc: {
        width: '40%',
        fontWeight: 'bold',
        color: '#666',
        fontSize: 13,
    },
    transactionItem: {
        flexDirection: 'row',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    transactionDate: {
        width: '20%',
        color: '#333',
    },
    transactionAmount: {
        width: '20%',
        color: '#333',
        textAlign: 'center',
    },
    typeContainer: {
        width: '20%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    transactionType: {
        marginLeft: 3,
        fontWeight: 'bold',
    },
    creditType: {
        color: '#4CAF50',
    },
    debitType: {
        color: '#F44336',
    },
    transactionDesc: {
        width: '40%',
        color: '#333',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
    },
    errorContainer: {
        padding: 15,
        backgroundColor: '#FFEBEE',
        margin: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    errorText: {
        color: '#D32F2F',
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyStateText: {
        marginTop: 20,
        color: '#666',
        fontSize: 16,
        textAlign: 'center',
        maxWidth: '80%',
    },
});

export default ReportScreen;
