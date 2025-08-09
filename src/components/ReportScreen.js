import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useMemo } from 'react';

// Custom component to create stitched border effect
const StitchedBorder = ({ style }) => {
    return (
        <View style={style}>
            {/* Top border dots */}
            <View style={styles.stitchLineHorizontal}>
                {Array.from({ length: 25 }).map((_, index) => (
                    <View key={`top-${index}`} style={styles.stitchDot} />
                ))}
            </View>
            
            {/* Bottom border dots */}
            <View style={[styles.stitchLineHorizontal, { bottom: 0 }]}>
                {Array.from({ length: 25 }).map((_, index) => (
                    <View key={`bottom-${index}`} style={styles.stitchDot} />
                ))}
            </View>
            
            {/* Left border dots */}
            <View style={styles.stitchLineVertical}>
                {Array.from({ length: 20 }).map((_, index) => (
                    <View key={`left-${index}`} style={styles.stitchDot} />
                ))}
            </View>
            
            {/* Right border dots */}
            <View style={[styles.stitchLineVertical, { right: 0 }]}>
                {Array.from({ length: 20 }).map((_, index) => (
                    <View key={`right-${index}`} style={styles.stitchDot} />
                ))}
            </View>
        </View>
    );
};

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
                        <MaterialIcons name="search" size={24} color="#1E88E5" />
                    </TouchableOpacity>
                </View>
            </View>

            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1E88E5" />
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
                    <View style={styles.walletOuter}>
                        <View style={styles.walletPapers}>
                            {/* Papers inside wallet effect */}
                            <View style={styles.walletPaper1} />
                            <View style={styles.walletPaper2} />
                        </View>
                        <View style={styles.walletCard}>
                            <StitchedBorder style={styles.stitchContainer} />
                            <View style={styles.walletHeader}>
                                <Text style={styles.walletTitle}>Loyalty Wallet</Text>
                                <MaterialIcons name="account-balance-wallet" size={24} color="white" />
                            </View>
                            <View style={styles.walletDivider} />
                            <View style={styles.customerDetails}>
                                <View style={styles.customerNameSection}>
                                    <Text style={styles.detailLabel}>Customer</Text>
                                    <Text style={styles.customerName}>{customerData.name}</Text>
                                </View>
                                <View style={styles.pointsSection}>
                                    <Text style={styles.detailLabel}>Points</Text>
                                    <Text style={styles.pointsBalance}>{customerData.balancePoints}</Text>
                                </View>
                            </View>
                            <View style={styles.cardFooter}>
                                <Text style={styles.cardNumber}>Card #{customerData.loyaltyNumber}</Text>
                                <Text style={styles.expiryDate}>Valid thru: 12/2028</Text>
                            </View>
                            <View style={styles.walletButton}>
                                <View style={styles.buttonCircle} />
                            </View>
                        </View>
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
    // Stitched border styles
    stitchContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2,
    },
    stitchLineHorizontal: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
    },
    stitchLineVertical: {
        position: 'absolute',
        top: 8,
        left: 0,
        bottom: 8,
        width: 2,
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    stitchDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: 'white',
        opacity: 0.7,
    },
    
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        backgroundColor: '#1E88E5',
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
    },
    walletOuter: {
        position: 'relative',
        marginVertical: 10,
    },
    walletPapers: {
        position: 'absolute',
        top: -5,
        left: 10,
        right: 10,
        zIndex: 1,
    },
    walletPaper1: {
        height: 20,
        backgroundColor: '#FFA726', // Orange paper
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    walletPaper2: {
        height: 10,
        backgroundColor: '#FFCC80', // Light orange paper
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        marginTop: -5,
    },
    walletCard: {
        backgroundColor: '#004D6E', // Deep blue wallet color
        borderRadius: 20,
        padding: 20,
        paddingVertical: 25,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
        position: 'relative',
        overflow: 'hidden',
    },
    walletHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        zIndex: 3,
    },
    walletTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    walletDivider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        marginVertical: 10,
    },
    customerDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 15,
    },
    customerNameSection: {
        flex: 2,
    },
    pointsSection: {
        flex: 1,
        alignItems: 'flex-end',
    },
    detailLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: 5,
    },
    customerName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E88E5',
        marginTop: 3,
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
