import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { BASE_URL } from "./Services";

const COLUMN_WIDTHS = {
  sno: wp("10%"),
  loyalty: wp("20%"),
  name: wp("25%"),
  phone: wp("22%"),
  birth: wp("25%"),
  address: wp("35%"),
};

const BirthdayReport = () => {
  const [customerData, setCustomerData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const pageSize = 10;

  const formatDate = (date) => {
    if (!date) return "";
    let d = new Date(date);
    return d.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  const fetchCustomers = async (page = 1) => {
    if (!hasMore && page !== 1) return;
    if (!fromDate || !toDate) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}BirthWedding/ByBirthDate?fromDate=${formatDate(fromDate)}&toDate=${formatDate(toDate)}&pageNumber=${page}&pageSize=${pageSize}`
      );

      if (response.status === 200) {
        const newData = response.data.data.map((item, index) => ({
          sno: (page - 1) * pageSize + index + 1,
          loyalty: item.loyaltyNumber,
          name: item.customerName,
          phone: item.phonenumber,
          birth: item.fBirth,
          address: item.address,
        }));

        setCustomerData(prev => (page === 1 ? newData : [...prev, ...newData]));
        setHasMore(page < response.data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching birthday data:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.headerRow}>
      <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.sno }]}>S.No</Text>
      <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.loyalty }]}>Loyalty No</Text>
      <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.name }]}>Name</Text>
      <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.phone }]}>Ph.No</Text>
      <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.birth }]}>Birth Date</Text>
      <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.address }]}>Address</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎂 Birthday Report</Text>

      {/* Date Pickers */}
      <View style={styles.inputRow}>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowFromPicker(true)}>
          <Text style={styles.dateText}>{fromDate ? formatDate(fromDate) : "From Date"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowToPicker(true)}>
          <Text style={styles.dateText}>{toDate ? formatDate(toDate) : "To Date"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.searchButton} onPress={() => { setPageNumber(1); fetchCustomers(1); }}>
          <Text style={styles.searchText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* From Date Picker */}
      {showFromPicker && (
        <DateTimePicker
          value={fromDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) => {
            setShowFromPicker(false);
            if (selectedDate) setFromDate(selectedDate);
          }}
        />
      )}

      {/* To Date Picker */}
      {showToPicker && (
        <DateTimePicker
          value={toDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) => {
            setShowToPicker(false);
            if (selectedDate) setToDate(selectedDate);
          }}
        />
      )}

      {/* Table */}
      <ScrollView horizontal>
        <FlatList
          data={customerData}
          keyExtractor={(item) => item.sno.toString()}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={[styles.cell, { width: COLUMN_WIDTHS.sno }]}>{item.sno}</Text>
              <Text style={[styles.cell, { width: COLUMN_WIDTHS.loyalty }]}>{item.loyalty}</Text>
              <Text style={[styles.cell, { width: COLUMN_WIDTHS.name }]}>{item.name}</Text>
              <Text style={[styles.cell, { width: COLUMN_WIDTHS.phone }]}>{item.phone}</Text>
              <Text style={[styles.cell, { width: COLUMN_WIDTHS.birth }]}>{item.birth}</Text>
              <Text style={[styles.cell, { width: COLUMN_WIDTHS.address }]}>{item.address}</Text>
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
  inputRow: { flexDirection: "row", alignItems: "center", marginBottom: hp("2%") },
  dateButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: wp("3%"),
    marginRight: wp("2%"),
    flex: 1,
    alignItems: "center",
  },
  dateText: { color: "#333", fontSize: hp("1.8%") },
  searchButton: { backgroundColor: "#006A72", paddingVertical: hp("1%"), paddingHorizontal: wp("4%"), borderRadius: 8 },
  searchText: { color: "#fff", fontWeight: "bold" },
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

export default BirthdayReport;
