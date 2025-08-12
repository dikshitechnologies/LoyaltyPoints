import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  FlatList
} from 'react-native';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import bgcard from '../assets/bgcard.png';
import { BASE_URL } from './Services';
import { handleStatusCodeError } from './ErrorHandler';
import { getCompanyCode } from "../store";
import axios from 'axios';

const COLUMN_WIDTHS = {
  date: wp('13%'),
  amount: wp('20%'),
  type: wp('20%'),
  points: wp('20%'),
  desc: wp('20%'),
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
        name: response.data.customerName,
        loyaltyNumber: val,
        balancePoints: response.data.balance
      };
       setCustomerData(customerInfo);
       fetchCustomerData(loyaltyNumber);
    }
     else {
        handleStatusCodeError(response.status, "Error deleting data");
        setTransactions([]);
        setCustomerData(null);
      }
    } catch (error) {
      if (error.response) {
        handleStatusCodeError(
          error.response.status,
          error.response.data?.message || "An unexpected server error occurred.",
          setTransactions([]),
          setCustomerData(null)
        );
      } else if (error.request) {
        alert("No response received from the server. Please check your network connection.");
      } else {
        alert(`Error: ${error.message}`);
      }
    }
  };

  const fetchCustomerData = async (number, page = 1) => {
    if (!number.trim()) return;
    if (page === 1) setTransactions([]);
    setLoading(true);
    setError(null);

    try {
      const pageSize = 10;
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
        setHasMore(response.data.data.length === pageSize);
      } else {
        handleStatusCodeError(response.status, "Error fetching data");
        setHasMore(false);
      }
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!loyaltyNumber) {
      alert("Please Enter the Loyalty Number!");
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
            <MaterialIcons name="search" size={hp('3%')} color="#006A72ff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Customer Card */}
      {customerData && (
        <View style={styles.customerInfoContainer}>
          <View style={styles.customerCard}>
            <ImageBackground
              source={bgcard}
              style={styles.cardBackground}
              imageStyle={{ borderRadius: wp('4%') }}
              resizeMode="cover"
            >
              <View style={styles.loyaltyNumberContainer}>
                <Text style={styles.infoLabel}>LOYALTY NUMBER</Text>
                <Text style={styles.loyaltyNumberValue}>{customerData.loyaltyNumber}</Text>
              </View>
              <View style={styles.centerNameContainer}>
                <Text style={styles.customerName}>{customerData.name}</Text>
              </View>
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
        style={{ padding: wp('5%') }}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.transactionItem}>
            <Text style={styles.transactionDate}>{item.date}</Text>
            <Text style={styles.transactionAmount}>{item.amount.toFixed(2)}</Text>
            <View style={styles.typeContainer}>
              {item.type === 'CR'
                ? <MaterialIcons name="arrow-upward" size={hp('2.5%')} color="#4CAF50" />
                : <MaterialIcons name="arrow-downward" size={hp('2.5%')} color="#F44336" />}
              <Text style={[styles.transactionType, item.type === 'CR' ? styles.creditType : styles.debitType]}>
                {item.type}
              </Text>
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
            <Text style={styles.headerPoints}>Point</Text>
            <Text style={styles.headerDesc}>Description</Text>
          </View>
        )}
        ListFooterComponent={() =>
          loading ? <ActivityIndicator size="small" color="#006A72ff" style={{ margin: hp('1%') }} /> : null
        }
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

      {!customerData && !loading && !error && (
        <View style={styles.emptyStateContainer}>
          <MaterialIcons name="search" size={hp('10%')} color="#CCCCCC" />
          <Text style={styles.emptyStateText}>Enter a loyalty number to view transaction details</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#006A72ff',
    padding: wp('5%'),
    paddingTop: hp('6%'),
    alignItems: 'center',
    borderBottomLeftRadius: wp('5%'),
    borderBottomRightRadius: wp('5%'),
  },
  headerText: { fontSize: hp('3%'), color: 'white', fontWeight: 'bold' },
  searchContainer: { padding: wp('4%'), paddingBottom: hp('1%') },
  searchInputContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: wp('8%'),
    alignItems: 'center',
    paddingLeft: wp('4%'),
    elevation: 3
  },
  searchInput: { flex: 1, height: hp('6%'), fontSize: hp('2%') },
  searchButton: {
    padding: wp('2%'),
    backgroundColor: '#F5F5F5',
    width: wp('12%'),
    height: hp('6%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: wp('8%'),
    borderBottomRightRadius: wp('8%'),
  },
  customerInfoContainer: { padding: wp('4%'), alignItems: 'center' },
  customerCard: {
    borderRadius: wp('4%'),
    marginVertical: hp('2%'),
    width: '90%',
    height: hp('20%'),
    elevation: 6,
    overflow: 'hidden',
  },
  cardBackground: { flex: 1, padding: wp('5%'), justifyContent: 'space-between' },
  centerNameContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  customerName: { fontSize: hp('3.5%'), color: '#FFF', fontWeight: 'bold', textAlign: 'center' },
  loyaltyNumberContainer: { position: 'absolute', top: hp('2.5%'), left: wp('5%') },
  balanceContainer: { position: 'absolute', bottom: hp('2.5%'), right: wp('5%') },
  infoLabel: { fontSize: hp('1.5%'), color: '#FFF', opacity: 0.9 },
  loyaltyNumberValue: { fontSize: hp('2%'), color: '#FFF', fontWeight: 'bold' },
  balanceValue: { fontSize: hp('2.5%'), color: '#FFF', fontWeight: 'bold' },
  transactionHeader: { flexDirection: 'row', paddingVertical: hp('1%'), borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  headerDate: { width: COLUMN_WIDTHS.date, fontWeight: 'bold', fontSize: hp('1.6%'), color: '#666' },
  headerAmount: { width: COLUMN_WIDTHS.amount, fontWeight: 'bold', fontSize: hp('1.6%'), color: '#666', textAlign: 'right' },
  headerType: { width: COLUMN_WIDTHS.type, fontWeight: 'bold', fontSize: hp('1.6%'), color: '#666', textAlign: 'center' },
  headerPoints: { width: COLUMN_WIDTHS.points, fontWeight: 'bold', fontSize: hp('1.6%'), color: '#666', textAlign: 'center' },
  headerDesc: { width: COLUMN_WIDTHS.desc, fontWeight: 'bold', fontSize: hp('1.6%'), color: '#666' },
  transactionItem: { flexDirection: 'row', paddingVertical: hp('1.2%'), borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  transactionDate: { width: COLUMN_WIDTHS.date, color: '#333' },
  transactionAmount: { width: COLUMN_WIDTHS.amount, color: '#333', textAlign: 'right' },
  typeContainer: { width: COLUMN_WIDTHS.type, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  transactionPoints: { width: COLUMN_WIDTHS.points, color: '#333', textAlign: 'center' },
  transactionDesc: { width: COLUMN_WIDTHS.desc, color: '#333' },
  transactionType: { fontWeight: 'bold' },
  creditType: { color: '#4CAF50' },
  debitType: { color: '#F44336' },
  emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: wp('5%') },
  emptyStateText: { marginTop: hp('2%'), color: '#666', fontSize: hp('2%'), textAlign: 'center', maxWidth: '80%' },
});

export default ReportScreen;
