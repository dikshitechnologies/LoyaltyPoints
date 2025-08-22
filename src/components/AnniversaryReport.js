import React from "react";
import { View, Text, StyleSheet, FlatList, ScrollView } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

const COLUMN_WIDTHS = {
  sno: wp("10%"),
  loyalty: wp("20%"),
  name: wp("25%"),
  phone: wp("25%"),
  address: wp("35%"),
  anniversary: wp("25%"),
};

const sampleData = [
  { sno: 1, loyalty: "L4001", name: "Ramesh", phone: "9876598765", address: "Hyderabad", anniversary: "2010-02-15" },
  { sno: 2, loyalty: "L4002", name: "Sita", phone: "9123009988", address: "Delhi", anniversary: "2015-11-09" },
];

const AnniversaryReport = () => {
  const renderHeader = () => (
    <View style={styles.headerRow}>
      <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.sno }]}>S.No</Text>
      <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.loyalty }]}>Loyalty No</Text>
      <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.name }]}>Name</Text>
      <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.phone }]}>Ph.No</Text>
      <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.address }]}>Address</Text>
      <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.anniversary }]}>Anniversary Date</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wedding Anniversary Report</Text>
      <ScrollView horizontal>
        <FlatList
          data={sampleData}
          keyExtractor={(item) => item.sno.toString()}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={[styles.cell, { width: COLUMN_WIDTHS.sno }]}>{item.sno}</Text>
              <Text style={[styles.cell, { width: COLUMN_WIDTHS.loyalty }]}>{item.loyalty}</Text>
              <Text style={[styles.cell, { width: COLUMN_WIDTHS.name }]}>{item.name}</Text>
              <Text style={[styles.cell, { width: COLUMN_WIDTHS.phone }]}>{item.phone}</Text>
              <Text style={[styles.cell, { width: COLUMN_WIDTHS.address }]}>{item.address}</Text>
              <Text style={[styles.cell, { width: COLUMN_WIDTHS.anniversary }]}>{item.anniversary}</Text>
            </View>
          )}
          ListHeaderComponent={renderHeader}
          stickyHeaderIndices={[0]}
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

export default AnniversaryReport;
