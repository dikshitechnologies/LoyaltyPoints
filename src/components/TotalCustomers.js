import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { BASE_URL } from './Services';
import { handleStatusCodeError } from './ErrorHandler';
import { getCompanyCode, getGroupCode } from "../store";

const COLUMN_WIDTHS = {
  sno: wp("10%"),
  loyalty: wp("20%"),
  name: wp("25%"),
  phone: wp("22%"),
  sales: wp("25%"),
  points: wp("25%"),
  redeemAmt: wp("25%"),
  redeemPts: wp("25%"),
  balance: wp("25%"),
};

const TotalCustomers = () => {
  const [customerData, setCustomerData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const pageSize = 10; // Change if needed
  const companyCode = getCompanyCode(); // replace with dynamic if needed
  const groupCode = getGroupCode();

  const fetchCustomers = async (page = 1) => {
    if (!hasMore && page !== 1) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}TotalLoyaltyReport/CustomerReport/${groupCode}?pageNumber=${page}&pageSize=${pageSize}`
      );

      if (response.status === 200) {
        const newData = response.data.data.map((item, index) => ({
          sno: (page - 1) * pageSize + index + 1,
          loyalty: item.loyaltyNumber,
          name: item.customerName,
          phone: item.phonenumber,
          sales: item.salesAmount || 0,
          points: item.earnPoints || 0,
          redeemAmt: item.redeemAmount || 0,
          redeemPts: item.redeemPoints || 0,
          balance: item.balance || 0,
        }));

        setCustomerData(prev => (page === 1 ? newData : [...prev, ...newData]));
        setHasMore(page < response.data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(1);
  }, []);

  const renderHeader = () => (
    <View style={styles.headerRow}>
      <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.sno }]}>S.No</Text>
      <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.loyalty }]}>Loyalty No</Text>
      <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.name }]}>Name</Text>
      <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.phone }]}>Ph.No</Text>
      <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.sales }]}>SalesAmount</Text>
      <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.points }]}>Points Earned</Text>
      <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.redeemAmt }]}>Redeem Amt</Text>
      <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.redeemPts }]}>RedeemPts</Text>
      <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.balance }]}>Balance</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Total Customers Report</Text>

      <ScrollView horizontal={true}>
        <FlatList
          data={customerData}
          keyExtractor={(item) => item.sno.toString()}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={[styles.cell, { width: COLUMN_WIDTHS.sno }]}>{item.sno}</Text>
              <Text style={[styles.cell, { width: COLUMN_WIDTHS.loyalty }]}>{item.loyalty}</Text>
              <Text style={[styles.cell, { width: COLUMN_WIDTHS.name }]}>{item.name}</Text>
              <Text style={[styles.cell, { width: COLUMN_WIDTHS.phone }]}>{item.phone}</Text>
              <Text style={[styles.cell, { width: COLUMN_WIDTHS.sales }]}>{item.sales}</Text>
              <Text style={[styles.cell, { width: COLUMN_WIDTHS.points }]}>{item.points}</Text>
              <Text style={[styles.cell, { width: COLUMN_WIDTHS.redeemAmt }]}>{item.redeemAmt}</Text>
              <Text style={[styles.cell, { width: COLUMN_WIDTHS.redeemPts }]}>{item.redeemPts}</Text>
              <Text style={[styles.cell, { width: COLUMN_WIDTHS.balance }]}>{item.balance}</Text>
            </View>
          )}
          ListHeaderComponent={renderHeader}
          stickyHeaderIndices={[0]}
          onEndReached={() => {
            if (!loading && hasMore) {
              const nextPage = pageNumber + 1;
              setPageNumber(nextPage);
              fetchCustomers(nextPage);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() =>
            loading ? <ActivityIndicator size="small" color="#006A72" style={{ margin: hp("1%") }} /> : null
          }
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: wp("4%") },
  title: { fontSize: hp("2.5%"), fontWeight: "bold", color: "#006A72", marginBottom: hp("2%") },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#f2f2f2",
    paddingVertical: hp("1%"),
  },
  headerCell: { fontWeight: "bold", fontSize: hp("1.6%"), color: "#333" },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f0f0f0", paddingVertical: hp("1%") },
  cell: { fontSize: hp("1.8%"), color: "#333" },
});

export default TotalCustomers;





