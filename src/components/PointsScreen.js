import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const PointsScreen = () => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Your Points</Text>
                <Text style={styles.pointsText}>2,500 points</Text>
            </View>
            
            <ScrollView style={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Points History</Text>
                    <View style={styles.pointsItem}>
                        <Text>Coffee Shop Purchase</Text>
                        <Text style={styles.pointsEarned}>+150 points</Text>
                        <Text style={styles.dateText}>Aug 5, 2025</Text>
                    </View>
                    <View style={styles.pointsItem}>
                        <Text>Gas Station</Text>
                        <Text style={styles.pointsEarned}>+300 points</Text>
                        <Text style={styles.dateText}>Aug 3, 2025</Text>
                    </View>
                    <View style={styles.pointsItem}>
                        <Text>Grocery Store</Text>
                        <Text style={styles.pointsEarned}>+500 points</Text>
                        <Text style={styles.dateText}>July 30, 2025</Text>
                    </View>
                    <View style={styles.pointsItem}>
                        <Text>Movie Theater</Text>
                        <Text style={styles.pointsEarned}>+200 points</Text>
                        <Text style={styles.dateText}>July 25, 2025</Text>
                    </View>
                    <View style={styles.pointsItem}>
                        <Text>Gift Card Redemption</Text>
                        <Text style={styles.pointsRedeemed}>-1000 points</Text>
                        <Text style={styles.dateText}>July 20, 2025</Text>
                    </View>
                </View>
                
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Earning Opportunities</Text>
                    <View style={styles.opportunityItem}>
                        <Text>Complete Profile</Text>
                        <Text style={styles.opportunityPoints}>+100 points</Text>
                    </View>
                    <View style={styles.opportunityItem}>
                        <Text>Refer a Friend</Text>
                        <Text style={styles.opportunityPoints}>+500 points</Text>
                    </View>
                    <View style={styles.opportunityItem}>
                        <Text>Follow on Social Media</Text>
                        <Text style={styles.opportunityPoints}>+50 points</Text>
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
    pointsText: {
        fontSize: 32,
        color: 'white',
        fontWeight: 'bold',
        marginTop: 10,
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
    pointsItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    pointsEarned: {
        color: 'green',
        fontWeight: 'bold',
    },
    pointsRedeemed: {
        color: 'red',
        fontWeight: 'bold',
    },
    dateText: {
        color: '#888',
        fontSize: 12,
    },
    opportunityItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    opportunityPoints: {
        color: '#1E88E5',
        fontWeight: 'bold',
    },
});

export default PointsScreen;
