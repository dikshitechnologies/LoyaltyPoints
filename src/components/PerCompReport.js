import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { BASE_URL } from './Services';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getGroupCode, getCompanyCode } from '../store';

const { width, height } = Dimensions.get('window');

export default function PerCompReport() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 20;
  const [hasMore, setHasMore] = useState(true);

  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const groupCode = getGroupCode();
  const companyCode = getCompanyCode();

  const [totals, setTotals] = useState({
    totalAdded: 0,
    totalRedeemed: 0,
    totalBalance: 0
  });

  const fetchReport = async (page = 1, replace = false) => {
    if (!hasMore && !replace) return;

    try {
      if (page === 1) setLoading(true);

      const response = await axios.get(
        `${BASE_URL}OverAllReport/GetBalanceReport`,
        {
          params: {
            groupCode: groupCode,
            compCode: companyCode,
            fromDate: fromDate.toISOString(),
            toDate: toDate.toISOString(),
            pageNumber: page,
            pageSize: pageSize
          }
        }
      );

      const newData = response.data;

      if (replace) setData(newData);
      else setData(prev => [...prev, ...newData]);

      setHasMore(newData.length === pageSize);
      setPageNumber(page);

      // Calculate totals
      const combinedData = replace ? newData : [...data, ...newData];
      const totalAdded = combinedData.reduce((sum, item) => sum + item.totalAddedPoints, 0);
      const totalRedeemed = combinedData.reduce((sum, item) => sum + item.totalRedeemedPoints, 0);
      // const totalBalance = combinedData.reduce((sum, item) => sum + item.balancePoints, 0);

      setTotals({ totalAdded, totalRedeemed, totalBalance });

    } catch (error) {
      console.error('Error fetching report:', error.message);
    } finally {
      setLoading(false);
      if (refreshing) setRefreshing(false);
      
    }
  };

  useEffect(() => { fetchReport(); }, []);
const onRefresh = () => {
  setRefreshing(true);
  setHasMore(true);

  // Reset both dates to current date
  const today = new Date();
  setFromDate(today);
  setToDate(today);

  // Clear data
  setData([]);

  // Fetch new data
  fetchReport(1, true);
};



  const loadMore = () => { if (!loading && hasMore) fetchReport(pageNumber + 1); };

  const renderHeader = () => (
    <View style={styles.headerRow}>
      <Text style={[styles.cell, styles.headerCell, {flex: 1.2}]}>Loyalty No</Text>
      <Text style={[styles.cell, styles.headerCell, {flex: 1}]}>Added Points</Text>
      <Text style={[styles.cell, styles.headerCell, {flex: 1.5}]}>Company</Text>
      <Text style={[styles.cell, styles.headerCell, {flex: 1}]}>Redeemed</Text>
      {/* <Text style={[styles.cell, styles.headerCell, {flex: 1}]}>Balance</Text> */}
    </View>
  );

  const renderItem = ({ item, index }) => (
    <View style={[styles.row, { backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F8F9FA' }]}>
      <Text style={[styles.cell, {flex: 1.2, fontWeight: '600', color: '#2c3e50'}]}>{item.loyaltyNumber}</Text>
      <Text style={[styles.cell, {flex: 1, color: '#27ae60', fontWeight: '600'}]}>{item.totalAddedPoints}</Text>
      <Text style={[styles.cell, {flex: 1.5}]} numberOfLines={1} ellipsizeMode="tail">{item.fCompName}</Text>
      <Text style={[styles.cell, {flex: 1, color: '#e74c3c', fontWeight: '600'}]}>{item.totalRedeemedPoints}</Text>
      {/* <Text style={[styles.cell, {flex: 1, fontWeight: 'bold'}]}>{item.balancePoints}</Text> */}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#006A72" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Balance Report</Text>
        <Text style={styles.screenSubtitle}>Company-wise points summary</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <Icon name="refresh" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Date pickers + Search */}
      <View style={styles.dateContainer}>
        <TouchableOpacity 
          onPress={() => setShowFromPicker(true)} 
          style={styles.dateBtn}
        >
          <Icon name="event" size={18} color="#006A72" style={styles.dateIcon} />
          <Text style={styles.dateText}>From: {fromDate.toLocaleDateString()}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setShowToPicker(true)} 
          style={styles.dateBtn}
        >
          <Icon name="event" size={18} color="#006A72" style={styles.dateIcon} />
          <Text style={styles.dateText}>To: {toDate.toLocaleDateString()}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.searchBtn}
          onPress={() => fetchReport(1, true)}
        >
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      {showFromPicker && (
        <DateTimePicker
          value={fromDate}
          mode="date"
          display="default"
          onChange={(e, date) => { 
            setShowFromPicker(false); 
            if (date) setFromDate(date); 
          }}
        />
      )}
      
      {showToPicker && (
        <DateTimePicker
          value={toDate}
          mode="date"
          display="default"
          onChange={(e, date) => { 
            setShowToPicker(false); 
            if (date) setToDate(date); 
          }}
        />
      )}

      {/* FlatList */}
      <FlatList
        data={data}
        keyExtractor={(item, index) => `${item.loyaltyNumber}-${index}`}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        stickyHeaderIndices={[0]}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyState}>
              <Icon name="assignment" size={60} color="#ddd" />
              <Text style={styles.noData}>No data available</Text>
              <Text style={styles.noDataSubtitle}>Pull down to refresh</Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#006A72']}
            tintColor={'#006A72'}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading && pageNumber > 1 ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color="#006A72" />
              <Text style={styles.loadingMoreText}>Loading more data...</Text>
            </View>
          ) : null
        }
      />

      {/* Totals */}
      <View style={styles.totalsContainer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Added:</Text>
          <Text style={[styles.totalValue, {color: '#27ae60'}]}>{totals.totalAdded}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Redeemed:</Text>
          <Text style={[styles.totalValue, {color: '#e74c3c'}]}>{totals.totalRedeemed}</Text>
        </View>
        {/* <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Balance:</Text>
          <Text style={[styles.totalValue, {color: '#006A72', fontWeight: 'bold'}]}>{totals.totalBalance}</Text>
        </View> */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    backgroundColor: '#006A72',
    padding: 16,
    paddingTop: 24,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    position: 'relative',
  },
  screenTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  screenSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  refreshBtn: { position: 'absolute', right: 16, top: 28 },
  dateContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, paddingHorizontal: 10 },
  dateBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, backgroundColor: '#f8f9fa', flex: 0.48 },
  dateIcon: { marginRight: 8 },
  dateText: { color: '#2c3e50', fontSize: 14 },
  searchBtn: { backgroundColor: '#006A72', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginLeft: 5 },
  searchBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  headerRow: { flexDirection: 'row', backgroundColor: '#006A72', paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  row: { flexDirection: 'row', paddingVertical: 14, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  cell: { fontSize: 13, textAlign: 'center', paddingHorizontal: 4 },
  headerCell: { fontWeight: 'bold', color: '#FFFFFF', fontSize: 13 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 10, color: '#7f8c8d' },
  footerLoader: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 15 },
  loadingMoreText: { marginLeft: 10, color: '#7f8c8d', fontSize: 14 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  noData: { textAlign: 'center', marginTop: 15, color: '#95a5a6', fontSize: 16, fontWeight: '500' },
  noDataSubtitle: { textAlign: 'center', marginTop: 5, color: '#bdc3c7', fontSize: 14 },
  totalsContainer: { marginTop: 10, padding: 15, borderTopWidth: 1, borderColor: '#ddd', backgroundColor: '#f8f9fa' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  totalLabel: { fontWeight: '600', fontSize: 14, color: '#2c3e50' },
  totalValue: { fontWeight: '600', fontSize: 14 },
});
