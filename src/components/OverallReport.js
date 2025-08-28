import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import axios from 'axios';
import { BASE_URL } from './Services';

export default function OverallReportScreen() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
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
      map[key].redeemDetails.push({
        redeemPoints: item.redeemedHere,
        redeemCompName: item.redeemCompName || '-',
        redeemDate: item.redeemDate ? new Date(item.redeemDate).toLocaleDateString() : '-'
      });
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

  const renderHeader = () => (
    <View style={styles.headerRow}>
      <Text style={[styles.cell, styles.headerCell]}>Loyalty No</Text>
      <Text style={[styles.cell, styles.headerCell]}>Added Points</Text>
      <Text style={[styles.cell, styles.headerCell]}>Added Company</Text>
      <Text style={[styles.cell, styles.headerCell]}>Redeem Points</Text>
      <Text style={[styles.cell, styles.headerCell]}>Redeem Company</Text>
      <Text style={[styles.cell, styles.headerCell]}>Redeem Date</Text>
    </View>
  );

  const renderItem = ({ item, index }) => (
    <View style={[styles.row, { backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F5F5F5' }]}>
      <Text style={styles.cell}>{item.loyaltyNumber}</Text>
      <Text style={styles.cell}>{item.addPoints}</Text>
      <Text style={styles.cell}>{item.addCompName}</Text>
      <View style={styles.redeemCell}>
        {item.redeemDetails.map((r, i) => (
          <Text key={i} style={styles.redeemText}>
            {r.redeemPoints} pts | {r.redeemCompName} | {r.redeemDate}
          </Text>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading && pageNumber === 1 && <ActivityIndicator size="large" color="#007AFF" />}
      {!loading && data.length === 0 && <Text style={styles.noData}>No report available</Text>}

      <FlatList
        data={data}
        keyExtractor={(item, index) => `${item.loyaltyNumber}-${item.addCompName}-${index}`}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        stickyHeaderIndices={[0]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading && pageNumber > 1 ? <ActivityIndicator size="small" color="#007AFF" /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', paddingHorizontal: 5, paddingTop: 10 },
  headerRow: { flexDirection: 'row', backgroundColor: '#006A72', paddingVertical: 10 },
  row: { flexDirection: 'row', paddingVertical: 12, flexWrap: 'wrap' },
  cell: { flex: 1, fontSize: 12, paddingHorizontal: 4, textAlign: 'center' },
  headerCell: { fontWeight: 'bold', color: '#FFFFFF', fontSize: 12 },
  noData: { textAlign: 'center', marginTop: 20, color: '#999', fontSize: 14 },
  redeemCell: { flex: 3, flexDirection: 'column', paddingHorizontal: 2 },
  redeemText: { fontSize: 11, color: '#333', marginBottom: 2 }
});
