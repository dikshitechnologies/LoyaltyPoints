import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Linking,
  Alert,
} from 'react-native';
import { BASE_URL } from './components/Services';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRoute } from '@react-navigation/native';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { getGroupCode } from './store';
import { handleStatusCodeError } from './components/ErrorHandler';
import axios from 'axios';
import { TouchableWithoutFeedback, Modal } from 'react-native';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH > 768;

const LoyaltyReportScreen = ({ navigation }) => {

      const route = useRoute();
       const { companyName, companyPhone ,loyaltyNumber} = route.params ?? {};
        const groupCode = getGroupCode();
  const [userData, setUserData] = useState({});
  const [transactionData, setTransactionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null); // Track open row
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

useFocusEffect(
  useCallback(() => {
    const onBackPress = () => {
      setTimeout(() => {
        Alert.alert('Exit', 'Do you want to logout?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Logout', onPress: () => navigation.navigate('UserAuth') },
        ]);
      }, 100);
      return true; // prevent default back action
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => subscription.remove();
  }, [])
);

  const fetchUserData = async () => {
  if (!loyaltyNumber || !groupCode) {
    console.error('Missing loyaltyNumber or groupCode');
    Alert.alert('Invalid Access', 'Missing loyaltyNumber or groupCode. Please login again.', [
      {
        text: 'OK',
        onPress: () => navigation.reset({ index: 0, routes: [{ name: 'UserAuth' }] }),
      },
    ]);
    return;
  }

  try {
    const response = await axios.get(`${BASE_URL}Register/points-summary/${loyaltyNumber}/${groupCode}`);

    if (response.status === 200) {
        console.log("User Data:", response.data);
      setUserData(response.data);

    } else {
            handleStatusCodeError(response.status, "Error deleting data");
          }
  } catch (error) {
    if (error.response) {
      handleStatusCodeError(
        error.response.status,
        error.response.data?.message || "An unexpected server error occurred.",
        handleClear()
      );
    } else if (error.request) {
      alert("No response received from the server. Please check your network connection.");
    } else {
      alert(`Error: ${error.message}. This might be due to an invalid URL or network issue.`);
    }
  }
};

// Fetch transaction data
const fetchTransactionData = async (pageNumber = 1) => {
  if (!hasMore && pageNumber !== 1) return;
  setLoading(true); 

  try {
    const response = await axios.get(`${BASE_URL}Report/History/${loyaltyNumber}/${groupCode}?pageNumber=${pageNumber}&pageSize=10`);

    if (response.status === 200) {
      const data = response.data;
        console.log("User Data:", response.data);
      if (pageNumber === 1) {
        setTransactionData(data?.data ?? []);
      } else {
        setTransactionData(prev => [...prev, ...(data?.data ?? [])]);
      }
      setHasMore(data?.data?.length === 10);
      setPage(pageNumber);
    } else {
            handleStatusCodeError(response.status, "Error deleting data");
          }
  } catch (error) {
    if (error.response) {
      handleStatusCodeError(
        error.response.status,
        error.response.data?.message || "An unexpected server error occurred.",
        handleClear()
      );
    } else if (error.request) {
      alert("No response received from the server. Please check your network connection.");
    } else {
      alert(`Error: ${error.message}. This might be due to an invalid URL or network issue.`);
    }
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};


  const loadData = async () => {
    await Promise.all([fetchUserData(), fetchTransactionData()]);
  };
const handleRefresh = async () => {
  setRefreshing(true);
  setExpandedRow(null);        
  setTransactionData([]);        
  setPage(1);                   
  setHasMore(true);             

  try {
    await Promise.all([fetchUserData(), fetchTransactionData(1)]); 
  } finally {
    setRefreshing(false);
  }
};

  const handleLogout = () => {
    Alert.alert('Logout', 'Do you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: () => { 
        navigation.navigate('UserAuth');
    } },
    ]);
    setMenuVisible(false);
  };

 const handleWhatsApp = () => {
    if (!companyPhone) {
      Alert.alert("Company phone not available.");
      return;
    }
    const url = `https://wa.me/${companyPhone.replace(/\D/g, '')}`;
    Linking.openURL(url);
    setMenuVisible(false);
  };

  const toggleRow = index => {
    setExpandedRow(prev => (prev === index ? null : index));
  };

  const formatDate = dateString =>
    dateString
      ? new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : '';
  const formatTime = dateString =>
    dateString
      ? new Date(dateString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      : '';
  const formatAmount = amount =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount ?? 0);


        const renderTransactionItem = ({ item, index }) => {
  const isExpanded = expandedRow === index;

  return (
    <View
      style={[
        styles.transactionCard,
        
        isTablet && { padding: 24 },
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 5,
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.transactionHeader,
          {
            backgroundColor: '#f5f4f4ff',
            paddingHorizontal: 16,
            paddingBottom: 16,
            borderBottomLeftRadius: 8,
              borderBottomRightRadius: 8,

          },
        ]}
        onPress={() => toggleRow(index)}
      >
        <View style={styles.dateArrowContainer}>
          <Text style={[styles.date, { color: '#030303ff' }]}>
            {formatDate(item.lDate)} • {formatTime(item.lDate)}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {item.sourceTable === 'Y' ? (
            <Ionicons name="arrow-up" size={16} color="#03c443ff" />
          ) : (
            <Ionicons name="arrow-down" size={16} color="#ff0000ff" />
          )}
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color="#9b9898ff"
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View
          style={[
            styles.transactionDetails,
            {
              backgroundColor: '#fff',
              padding: 12,
              borderBottomLeftRadius: 8,
              borderBottomRightRadius: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            },
          ]}
        >
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: '#6c757d' }]}>Amount:</Text>
            <Text style={styles.detailValue}>{formatAmount(item.lAmt)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: '#6c757d' }]}>Points:</Text>
            <Text
              style={[
                styles.pointsValue,
                item.sourceTable === 'Y' ? styles.positivePoints : styles.negativePoints,
              ]}
            >
              {item.sourceTable === 'Y' ? '+' : '-'}
              {item.points ?? 0}
            </Text>
          </View>

          {item.bankHistory && (
            <View style={styles.bankHistoryRow}>
              <Ionicons name="arrow-down" size={14} color="#dc3545" />
              <Text style={styles.bankHistoryText}>Bank History</Text>
            </View>
          )}
          <View style={styles.companyNameContainer}>
            <Text style={styles.companyName}>{item.companyName ?? ''}</Text>
          </View>
        </View>
      )}
    </View>
  );
};


  useEffect(() => {
    loadData();
  }, []);

  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#006A72" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>{companyName}</Text>
        <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(prev => !prev)}>
          <Text style={styles.dotIcon}>⋮</Text>
        </TouchableOpacity>

       


{menuVisible && (
  <Modal transparent animationType="fade">
    <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' }} />
    </TouchableWithoutFeedback>

    <View style={styles.dropdownMenu}>
      {/* Optional Close Button */}

      <TouchableOpacity style={styles.menuItem} onPress={ ()=>{handleWhatsApp(); setMenuVisible(false)}}>
        <FontAwesome name="whatsapp" size={20} color="#25D366" />
        <Text style={styles.menuText}>WhatsApp Chat</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={ ()=>{handleRefresh(); setMenuVisible(false) ;}}>
        <MaterialIcons name="refresh" size={20} color="#006A72" />
        <Text style={styles.menuText}>Refresh</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={ ()=>{handleLogout(); setMenuVisible(false)}}>
        <MaterialIcons name="logout" size={20} color="#dc3545" />
        <Text style={styles.menuText}>Logout</Text>
      </TouchableOpacity>
    </View>
  </Modal>
)}

      </View>

      {/* User Summary */}
      {userData && (
        <View style={styles.summaryCard}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userData.customerName ?? 'Customer Name'}</Text>
            <Text style={styles.loyaltyNumber}>Loyalty : {loyaltyNumber ?? 'N/A'}</Text>
          </View>
          <View style={styles.pointsSummary}>
            <View style={styles.pointsItem}>
              <Text style={styles.pointsLabel}>Balance Points</Text>
              <Text style={styles.totalPoints}>{userData.balance ?? 0}</Text>
            </View>
            <View style={styles.pointsDivider} />
            <View style={styles.pointsItem}>
              <Text style={styles.pointsLabel}>Earned</Text>
              <Text style={styles.earnedPoints}>+{userData.addPoint ?? 0}</Text>
            </View>
            <View style={styles.pointsDivider} />
            <View style={styles.pointsItem}>
              <Text style={styles.pointsLabel}>Redeemed</Text>
              <Text style={styles.redeemedPoints}>-{userData.redeemed ?? 0}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Transaction List */}
    <FlatList
  data={transactionData}
  renderItem={renderTransactionItem}
  keyExtractor={(item, index) => `${item.lDate ?? index}-${index}`}
  contentContainerStyle={styles.listContent}
  onRefresh={handleRefresh}
  refreshing={refreshing}
  onEndReached={() => fetchTransactionData(page + 1)}
  onEndReachedThreshold={0.5}
  ListEmptyComponent={
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No transactions found</Text>
    </View>
  }
  maintainVisibleContentPosition={{
    minIndexForVisible: 0,
  }}
/>


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffffff' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#6c757d' },

  // Top bar
  topBar: {
    backgroundColor: '#006A72',
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  menuButton: { paddingHorizontal: 8 },
  dotIcon: { fontSize: 22, color: '#fff' },

  // Dropdown menu
  dropdownMenu: {
    position: 'absolute',
    right: 16,
    top: 52,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 100,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, gap: 8 },
  menuText: { fontSize: 16, color: '#006A72', marginLeft: 8 },

  // Summary card
  summaryCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  userInfo: { marginBottom: 20 },
  userName: { fontSize: 20, fontWeight: '600', color: '#2c3e50', marginBottom: 4 },
  loyaltyNumber: { fontSize: 14, color: '#6c757d' },
  pointsSummary: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  pointsItem: { alignItems: 'center', flex: 1 },
  pointsLabel: { fontSize: 12, color: '#6c757d', marginBottom: 4, fontWeight: '500' },
  totalPoints: { fontSize: 20, fontWeight: 'bold', color: '#007AFF' },
  earnedPoints: { fontSize: 16, fontWeight: '600', color: '#28a745' },
  redeemedPoints: { fontSize: 16, fontWeight: '600', color: '#dc3545' },
  pointsDivider: { width: 1, height: 40, backgroundColor: '#e9ecef' },

  // Transactions
  listContent: { padding: 16, paddingTop: 0 },
  transactionCard: {
    backgroundColor: '#f5f4f4ff',
    borderRadius: 8,
    paddingTop: 16,
    marginBottom: 12,
    position: 'relative',
  },
  transactionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', },
  dateArrowContainer: { flexDirection: 'row', alignItems: 'center' },
  arrowIcon: { marginLeft: 6 },
  date: { fontSize: 12, color: '#6c757d' },
  transactionDetails: { marginTop: 0},
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' },
  detailLabel: { fontSize: 14, color: '#6c757d' },
  detailValue: { fontSize: 14, fontWeight: '500', color: '#2c3e50' },
  pointsValue: { fontSize: 14, fontWeight: '600' },
  positivePoints: { color: '#28a745' },
  negativePoints: { color: '#dc3545' },
  bankHistoryRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  bankHistoryText: { fontSize: 12, color: '#dc3545', marginLeft: 4 },
  companyNameContainer: { marginTop: 8 },
  companyName: { fontSize: 14, color: '#006A72', fontWeight: '700', fontStyle: 'italic' },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: '#006A72', textAlign: 'center' },
});

export default LoyaltyReportScreen;
