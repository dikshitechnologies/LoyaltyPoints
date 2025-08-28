import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  RefreshControl, 
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  SafeAreaView,
  StatusBar
} from 'react-native';
import axios from 'axios';
import { BASE_URL } from './Services';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

export default function OverallReportScreen() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const pageSize = 20;
  const [hasMore, setHasMore] = useState(true);

  // Group data by loyalty + add company
  const groupData = (rows) => {
    const grouped = [];
    const map = {};

    rows.forEach(item => {
      const key = item.loyaltyNumber + '-' + item.addCompName;
      if (!map[key]) {
        map[key] = {
          loyaltyNumber: item.loyaltyNumber,
          addCompName: item.addCompName,
          addPoints: 0,
          redeemDetails: []
        };
        grouped.push(map[key]);
      }

      map[key].addPoints += item.addPoints;
      if (item.redeemedHere > 0) {
        map[key].redeemDetails.push({
          redeemPoints: item.redeemedHere,
          redeemCompName: item.redeemCompName || '-',
          redeemDate: item.redeemDate ? new Date(item.redeemDate).toLocaleDateString() : '-'
        });
      }
    });

    return grouped;
  };

  const fetchReport = async (page = 1, replace = false) => {
    if (!hasMore && !replace) return;

    try {
      if (page === 1) setLoading(true);

      const response = await axios.get(
        `${BASE_URL}OverAllReport/GetLoyaltyReport`,
        {
          params: {
            loyaltyNumber: '1001',
            groupCode: '0002',
            pageNumber: page,
            pageSize: pageSize
          },
        }
      );

      const newData = response.data;
      const grouped = groupData(replace ? newData : [...data, ...newData]);

      setData(grouped);
      setHasMore(newData.length === pageSize);
      setPageNumber(page);
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
    fetchReport(1, true);
  };

  const loadMore = () => { if (!loading && hasMore) fetchReport(pageNumber + 1); };

  const openDetailsModal = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const renderHeader = () => (
    <View style={styles.headerRow}>
      <Text style={[styles.cell, styles.headerCell, {flex: 1.2}]}>Loyalty No</Text>
      <Text style={[styles.cell, styles.headerCell, {flex: 1.2}]}>Points</Text>
      <Text style={[styles.cell, styles.headerCell, {flex: 1.5}]}>Company</Text>
      <Text style={[styles.cell, styles.headerCell, {flex: 0.8}]}>Actions</Text>
    </View>
  );

  const renderItem = ({ item, index }) => (
    <TouchableOpacity 
      style={[styles.row, { backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F8F9FA' }]}
      onPress={() => openDetailsModal(item)}
    >
      <Text style={[styles.cell, {flex: 1.2, fontWeight: '600', color: '#2c3e50'}]}>{item.loyaltyNumber}</Text>
      <View style={[styles.cell, {flex: 1.2}]}>
        <Text style={styles.pointsText}>{item.addPoints}</Text>
      </View>
      <Text style={[styles.cell, {flex: 1.5}]} numberOfLines={1} ellipsizeMode="tail">{item.addCompName}</Text>
      <View style={[styles.cell, {flex: 0.8, alignItems: 'center'}]}>
        <Icon name="info-outline" size={20} color="#006A72" />
      </View>
    </TouchableOpacity>
  );

  const RedeemDetailsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Loyalty Details</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {selectedItem && (
            <ScrollView style={styles.modalBody}>
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Loyalty Number</Text>
                <Text style={styles.detailValue}>{selectedItem.loyaltyNumber}</Text>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Company</Text>
                <Text style={styles.detailValue}>{selectedItem.addCompName}</Text>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Total Points Added</Text>
                <Text style={[styles.detailValue, {color: '#27ae60', fontSize: 18, fontWeight: 'bold'}]}>
                  {selectedItem.addPoints}
                </Text>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={[styles.detailLabel, {marginBottom: 10}]}>Redeem History</Text>
                
                {selectedItem.redeemDetails.length > 0 ? (
                  selectedItem.redeemDetails.map((redeem, index) => (
                    <View key={index} style={styles.redeemItem}>
                      <View style={styles.redeemRow}>
                        <Text style={styles.redeemLabel}>Points Redeemed:</Text>
                        <Text style={[styles.redeemValue, {color: '#e74c3c'}]}>{redeem.redeemPoints}</Text>
                      </View>
                      <View style={styles.redeemRow}>
                        <Text style={styles.redeemLabel}>Company:</Text>
                        <Text style={styles.redeemValue}>{redeem.redeemCompName}</Text>
                      </View>
                      <View style={styles.redeemRow}>
                        <Text style={styles.redeemLabel}>Date:</Text>
                        <Text style={styles.redeemValue}>{redeem.redeemDate}</Text>
                      </View>
                      {index < selectedItem.redeemDetails.length - 1 && (
                        <View style={styles.separator} />
                      )}
                    </View>
                  ))
                ) : (
                  <Text style={styles.noRedeemText}>No redemption history</Text>
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#006A72" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Loyalty Program Report</Text>
        <Text style={styles.screenSubtitle}>Summary of points and redemptions</Text>
      </View>

      {loading && pageNumber === 1 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#006A72" />
          <Text style={styles.loadingText}>Loading report data...</Text>
        </View>
      )}
      
      {!loading && data.length === 0 && (
        <View style={styles.emptyState}>
          <Icon name="assignment" size={60} color="#ddd" />
          <Text style={styles.noData}>No report available</Text>
          <Text style={styles.noDataSubtitle}>Pull down to refresh</Text>
        </View>
      )}

      <FlatList
        data={data}
        keyExtractor={(item, index) => `${item.loyaltyNumber}-${item.addCompName}-${index}`}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        stickyHeaderIndices={[0]}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#006A72']}
            tintColor={'#006A72'}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loading && pageNumber > 1 ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color="#006A72" />
              <Text style={styles.loadingMoreText}>Loading more...</Text>
            </View>
          ) : null
        }
      />
      
      <RedeemDetailsModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFF'
  },
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
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  headerRow: { 
    flexDirection: 'row', 
    backgroundColor: '#006A72', 
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  row: { 
    flexDirection: 'row', 
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cell: { 
    fontSize: 13, 
    textAlign: 'center',
    color: '#34495e',
  },
  headerCell: { 
    fontWeight: 'bold', 
    color: '#FFFFFF', 
    fontSize: 13,
  },
  pointsText: {
    fontWeight: '600',
    color: '#27ae60',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#7f8c8d',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  loadingMoreText: {
    marginLeft: 10,
    color: '#7f8c8d',
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noData: {
    textAlign: 'center',
    marginTop: 15,
    color: '#95a5a6',
    fontSize: 16,
    fontWeight: '500',
  },
  noDataSubtitle: {
    textAlign: 'center',
    marginTop: 5,
    color: '#bdc3c7',
    fontSize: 14,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: height * 0.85,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#006A72',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 25,
  },
  detailLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
  },
  redeemItem: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
  },
  redeemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  redeemLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  redeemValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 10,
  },
  noRedeemText: {
    textAlign: 'center',
    color: '#95a5a6',
    fontStyle: 'italic',
    padding: 10,
  },
});