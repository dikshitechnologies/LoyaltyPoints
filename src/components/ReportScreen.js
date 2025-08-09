import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const ReportScreen = () => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Reports</Text>
                <Text style={styles.subHeaderText}>Activity Summary</Text>
            </View>
            
            <ScrollView style={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Monthly Summary</Text>
                    <View style={styles.summaryItem}>
                        <Text>Points Earned</Text>
                        <Text style={styles.positiveValue}>1,250 points</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text>Points Redeemed</Text>
                        <Text style={styles.negativeValue}>1,000 points</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text>Net Change</Text>
                        <Text style={styles.positiveValue}>+250 points</Text>
                    </View>
                </View>
                
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Category Breakdown</Text>
                    <View style={styles.categoryItem}>
                        <Text>Dining</Text>
                        <Text>450 points</Text>
                        <View style={styles.progressBar}>
                            <View style={[styles.progress, { width: '45%', backgroundColor: '#4CAF50' }]} />
                        </View>
                    </View>
                    <View style={styles.categoryItem}>
                        <Text>Shopping</Text>
                        <Text>300 points</Text>
                        <View style={styles.progressBar}>
                            <View style={[styles.progress, { width: '30%', backgroundColor: '#2196F3' }]} />
                        </View>
                    </View>
                    <View style={styles.categoryItem}>
                        <Text>Travel</Text>
                        <Text>250 points</Text>
                        <View style={styles.progressBar}>
                            <View style={[styles.progress, { width: '25%', backgroundColor: '#FF9800' }]} />
                        </View>
                    </View>
                    <View style={styles.categoryItem}>
                        <Text>Entertainment</Text>
                        <Text>200 points</Text>
                        <View style={styles.progressBar}>
                            <View style={[styles.progress, { width: '20%', backgroundColor: '#9C27B0' }]} />
                        </View>
                    </View>
                </View>
                
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Year to Date</Text>
                    <View style={styles.yearItem}>
                        <Text>Total Points Earned</Text>
                        <Text style={styles.yearValue}>5,500</Text>
                    </View>
                    <View style={styles.yearItem}>
                        <Text>Total Points Redeemed</Text>
                        <Text style={styles.yearValue}>3,000</Text>
                    </View>
                    <View style={styles.yearItem}>
                        <Text>Current Balance</Text>
                        <Text style={[styles.yearValue, styles.balanceValue]}>2,500</Text>
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
    },
    summaryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    positiveValue: {
        color: 'green',
        fontWeight: 'bold',
    },
    negativeValue: {
        color: 'red',
        fontWeight: 'bold',
    },
    categoryItem: {
        marginBottom: 15,
    },
    progressBar: {
        height: 10,
        backgroundColor: '#E0E0E0',
        borderRadius: 5,
        marginTop: 5,
    },
    progress: {
        height: '100%',
        borderRadius: 5,
    },
    yearItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    yearValue: {
        fontWeight: 'bold',
    },
    balanceValue: {
        color: '#1E88E5',
        fontSize: 18,
    },
});

export default ReportScreen;
