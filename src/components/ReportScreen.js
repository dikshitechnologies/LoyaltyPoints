import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  FlatList
} from 'react-native';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import bgcard from '../assets/bgcard.png';
import { BASE_URL } from './Services';
import { handleStatusCodeError } from './ErrorHandler';
import {getCompanyCode } from "../store";

import axios from 'axios';
const COLUMN_WIDTHS = {
  date: '13%',
  amount: '20%',
  type: '20%',
  points: '20%',
  desc: '20%',
};

const ReportScreen = () => {
  const [loyaltyNumber, setLoyaltyNumber] = useState('');
  const [customerData, setCustomerData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
const [pageNumber, setPageNumber] = useState(1);
const [hasMore, setHasMore] = useState(true);
const fcomCode = getCompanyCode();

const fetchUser = async (val)=>{

  try {
console.log("Fetching user with loyalty number:", fcomCode);
    const response = await axios.get(`${BASE_URL}Register/points-summary/${val}/${fcomCode}`)
    if(response.status == 200){
      console.log(response)
      const customerInfo = {
        name: response.data[0].customerName,
        loyaltyNumber: val,
        balancePoints: response.data[0].balance
      };
       setCustomerData(customerInfo);
       fetchCustomerData(loyaltyNumber);
    }
     else {
        handleStatusCodeError(response.status, "Error deleting data");
        setTransactions([]);
        setCustomerData(null)
      }
  }
  catch (error) {
      if (error.response) {
        handleStatusCodeError(
          error.response.status,
          error.response.data?.message || "An unexpected server error occurred.",
          setTransactions([]),
          setCustomerData(null)
          
        );
      } else if (error.request) {
        alert("No response received from the server. Please check your network connection.");
      } 
      else {
        alert(`Error: ${error.message}. This might be due to an invalid URL or network issue.`);
      }
    }
  };




const fetchCustomerData = async (number, page = 1) => {
  if (!number.trim()) return;

  if (page === 1) {
    setTransactions([]); // reset on first page
  }
  
  setLoading(true);
  setError(null);

  try {
    const pageSize = 10; // load 10 per request
    const response = await axios.get(
      `${BASE_URL}Report/History/${number}/${fcomCode}?pageNumber=${page}&pageSize=${pageSize}`
    );

    if (response.status === 200) {
      const newTransactions = response.data.data.map((item, index) => ({
        id: `${page}-${index}`,
        date: item.lDate.split(" ")[0],
        amount: item.lAmt,
        points: item.points,
        type: item.sourceTable === "Y" ? "CR" : "DR",
        description: item.sourceTable === "Y" ? "Points Added" : "Points Redeemed"
      }));

      setTransactions(prev => [...prev, ...newTransactions]);
      setHasMore(response.data.data.length === pageSize); // stop if no more
    } else {
      handleStatusCodeError(response.status, "Error fetching data");
      setHasMore(false);
    }
  } catch (error) {
    setHasMore(false);
    if (error.response) {
      handleStatusCodeError(error.response.status, error.response.data?.message || "An unexpected server error occurred.");
    } else if (error.request) {
      alert("No response received from the server. Please check your network connection.");
    } else {
      alert(`Error: ${error.message}`);
    }
  } finally {
    setLoading(false);
  }
};

  const handleSearch = async () => {
    if(loyaltyNumber == null || loyaltyNumber== ""){
      alert("Please Enter the Loyalty Number!")
      return;
    }
      await fetchUser(loyaltyNumber);
      
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Loyalty Points Report</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter Loyalty Number"
            value={loyaltyNumber}
            onChangeText={setLoyaltyNumber}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <MaterialIcons name="search" size={24} color="#006A72ff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Loading */}
      {/* {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#006A72ff" />
          <Text style={styles.loadingText}>Loading customer data...</Text>
        </View>
      )}

      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )} */}

      {/* Customer Card */}
      {customerData && (
        <View style={styles.customerInfoContainer}>
          <View style={styles.customerCard}>
            <ImageBackground
              source={bgcard}
              style={styles.cardBackground}
              imageStyle={{ borderRadius: 16 }}
              resizeMode="cover"
            >
              <View style={styles.loyaltyNumberContainer}>
                <Text style={styles.infoLabel}>LOYALTY NUMBER</Text>
                <Text style={styles.loyaltyNumberValue}>{customerData.loyaltyNumber}</Text>
              </View>

              <View style={styles.centerNameContainer}>
                <Text style={styles.customerName}>{customerData.name}</Text>
              </View>

              {/* <View style={styles.validTillContainer}>
                <Text style={styles.infoLabel}>VALID TILL</Text>
                <Text style={styles.validTillValue}>08/09/2026</Text>
              </View> */}

              <View style={styles.balanceContainer}>
                <Text style={styles.infoLabel}>BALANCE</Text>
                <Text style={styles.balanceValue}>{customerData.balancePoints}</Text>
              </View>
            </ImageBackground>
          </View>
        </View>
      )}

      {/* Transactions */}
            <FlatList
          data={transactions}
          style={{padding:20}}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
           <View style={styles.transactionItem}>
  <Text style={styles.transactionDate}>{item.date}</Text>
  <Text style={styles.transactionAmount}>{item.amount.toFixed(2)}</Text>
  <View style={styles.typeContainer}>
    {item.type === 'CR'
      ? <MaterialIcons name="arrow-upward" size={20} color="#4CAF50" />
      : <MaterialIcons name="arrow-downward" size={20} color="#F44336" />}
    <Text style={[
      styles.transactionType,
      item.type === 'CR' ? styles.creditType : styles.debitType
    ]}>{item.type}</Text>
  </View>
  <Text style={styles.transactionPoints}>{item.points}</Text>
  <Text style={styles.transactionDesc}>{item.description}</Text>
</View>

          )}
          ListHeaderComponent={() => (
            <View style={styles.transactionHeader}>
              <Text style={styles.headerDate}>Date</Text>
              <Text style={styles.headerAmount}>Amount</Text>
              <Text style={styles.headerType}>Type</Text>
              <Text style={styles.headerType}>Point</Text>
              <Text style={styles.headerDesc}>Description</Text>
            </View>
          )}
          ListFooterComponent={() => (
            loading ? <ActivityIndicator size="small" color="#006A72ff" style={{ margin: 10 }} /> : null
          )}
          onEndReached={() => {
            if (!loading && hasMore) {
              setPageNumber(prev => {
                const nextPage = prev + 1;
                fetchCustomerData(loyaltyNumber, nextPage);
                return nextPage;
              });
            }
          }}
          onEndReachedThreshold={0.5}
        />

      {/* Empty State */}
      {!customerData && !loading && !error && (
        <View style={styles.emptyStateContainer}>
          <MaterialIcons name="search" size={80} color="#CCCCCC" />
          <Text style={styles.emptyStateText}>Enter a loyalty number to view transaction details</Text>
        </View>
      )}
    </View>
  );
};

// Styles (same as before)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#006A72ff',
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerText: { fontSize: 24, color: 'white', fontWeight: 'bold' },
  searchContainer: { padding: 15, paddingBottom: 5 },
  searchInputContainer: {
    flexDirection: 'row', backgroundColor: 'white', borderRadius: 25, alignItems: 'center',
    paddingLeft: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 3, elevation: 3,
  },
  searchInput: { flex: 1, height: 50, fontSize: 16 },
  searchButton: {
    padding: 10, borderTopRightRadius: 25, borderBottomRightRadius: 25,
    backgroundColor: '#F5F5F5', width: 50, height: 50, justifyContent: 'center', alignItems: 'center',
  },
  customerInfoContainer: { padding: 15, paddingTop: 5, paddingBottom: 5, justifyContent: 'center', alignItems: 'center' },
  customerCard: {
    borderRadius: 16, marginVertical: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 6, overflow: 'hidden', width: '90%', height: 160, alignSelf: 'center',
  },
  cardBackground: { flex: 1, padding: 20, justifyContent: 'space-between', borderRadius: 16, overflow: 'hidden' },
  centerNameContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  customerName: {
    fontSize: 28, color: '#FFFFFF', fontWeight: 'bold', textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3,
  },
  loyaltyNumberContainer: { position: 'absolute', top: 20, left: 20, alignItems: 'flex-start' },
  balanceContainer: { position: 'absolute', bottom: 20, right: 20, alignItems: 'flex-end' },
  validTillContainer: { position: 'absolute', bottom: 20, left: 20, alignItems: 'flex-start' },
  validTillValue: { fontSize: 16, color: '#FFFFFF', fontWeight: 'bold', textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 0.5, height: 0.5 }, textShadowRadius: 1 },
  infoLabel: { fontSize: 12, color: '#FFFFFF', opacity: 0.9, marginBottom: 5, textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 0.5, height: 0.5 }, textShadowRadius: 1 },
  loyaltyNumberValue: { fontSize: 16, color: '#FFFFFF', fontWeight: 'bold', textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 0.5, height: 0.5 }, textShadowRadius: 1 },
  balanceValue: { fontSize: 20, color: '#FFFFFF', fontWeight: 'bold', textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 0.5, height: 0.5 }, textShadowRadius: 1 },
  content: { flex: 1, padding: 15, paddingTop: 5 },
  card: { backgroundColor: 'white', borderRadius: 10, padding: 15, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 10 },
transactionHeader: {
  flexDirection: 'row',
  paddingVertical: 8,
  borderBottomWidth: 1,
  borderBottomColor: '#F0F0F0',
},
headerDate: { width: COLUMN_WIDTHS.date, fontWeight: 'bold', color: '#666', fontSize: 13 },
headerAmount: { width: COLUMN_WIDTHS.amount, fontWeight: 'bold', color: '#666', fontSize: 13, textAlign: 'right' },
headerType: { width: COLUMN_WIDTHS.type, fontWeight: 'bold', color: '#666', fontSize: 13, textAlign: 'center' },
headerPoints: { width: COLUMN_WIDTHS.points, fontWeight: 'bold', color: '#666', fontSize: 13, textAlign: 'center' },
headerDesc: { width: COLUMN_WIDTHS.desc, fontWeight: 'bold', color: '#666', fontSize: 13 },

// Row
transactionItem: {
  flexDirection: 'row',
  paddingVertical: 10,
  borderBottomWidth: 1,
  borderBottomColor: '#F0F0F0',
  alignItems: 'center',
},
transactionDate: { width: COLUMN_WIDTHS.date, color: '#333' },
transactionAmount: { width: COLUMN_WIDTHS.amount, color: '#333', textAlign: 'right' },
typeContainer: { width: COLUMN_WIDTHS.type, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
transactionPoints: { width: COLUMN_WIDTHS.points, color: '#333', textAlign: 'center' },
transactionDesc: { width: COLUMN_WIDTHS.desc, color: '#333' },
  transactionType: { fontWeight: 'bold'},
  creditType: { color: '#4CAF50' },
  debitType: { color: '#F44336' },
  transactionDesc: { width: '40%', color: '#333' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#666' },
  errorContainer: { padding: 15, backgroundColor: '#FFEBEE', margin: 15, borderRadius: 10, alignItems: 'center' },
  errorText: { color: '#D32F2F' },
  emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyStateText: { marginTop: 20, color: '#666', fontSize: 16, textAlign: 'center', maxWidth: '80%' },
});

export default ReportScreen;
