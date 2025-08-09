import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Loyalty Points</Text>
        <Text style={styles.pointsText}>2,500 points</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Activity</Text>
          <View style={styles.activityItem}>
            <Text>Coffee Shop Purchase</Text>
            <Text style={styles.pointsEarned}>+150 points</Text>
          </View>
          <View style={styles.activityItem}>
            <Text>Gas Station</Text>
            <Text style={styles.pointsEarned}>+300 points</Text>
          </View>
          <View style={styles.activityItem}>
            <Text>Grocery Store</Text>
            <Text style={styles.pointsEarned}>+500 points</Text>
          </View>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Rewards</Text>
          <TouchableOpacity style={styles.rewardItem}>
            <Text>$10 Gift Card</Text>
            <Text style={styles.redeemText}>2,000 points</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rewardItem}>
            <Text>$25 Gift Card</Text>
            <Text style={styles.redeemText}>5,000 points</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rewardItem}>
            <Text>$50 Gift Card</Text>
            <Text style={styles.redeemText}>10,000 points</Text>
          </TouchableOpacity>
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
  activityItem: {
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
  rewardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  redeemText: {
    color: '#1E88E5',
    fontWeight: 'bold',
  },
});

export default HomeScreen;