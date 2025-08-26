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
  ImageBackground,
  Image,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "./Services";
import { handleStatusCodeError } from "./ErrorHandler";

const COLUMN_WIDTHS = {
  sno: wp("10%"),
  loyalty: wp("20%"),
  name: wp("25%"),
  phone: wp("22%"),
  birth: wp("25%"),
  address: wp("35%"),
};

const BirthdayReport = () => {
  const navigation = useNavigation();

  const [customerData, setCustomerData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(new Date()); // ✅ Default current date
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
    const startdate = formatDate(fromDate);
    const enddate = formatDate(toDate);
    setLoading(true);
    console.log(page)
    try {
      const response = await axios.get(
        `${BASE_URL}BirthWedding/ByBirthDate?fromDate=${startdate}&toDate=${enddate}&pageNumber=${page}&pageSize=${pageSize}`
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

        setCustomerData((prev) =>
          page === 1 ? newData : [...prev, ...newData]
        );
        setHasMore(page < response.data.totalPages);
      } else {
        handleStatusCodeError(response.status, "Error fetching data");
        setCustomerData([]);
        setHasMore(false);
        setPageNumber(1);
      }
    } catch (error) {
      if (error.response) {
        handleStatusCodeError(
          error.response.status,
          error.response.data?.message ||
            "An unexpected server error occurred.",
          setCustomerData([]),
          setHasMore(false),
          setPageNumber(1)
        );
      } else if (error.request) {
        alert(
          "No response received from the server. Please check your network connection."
        );
      } else {
        alert(
          `Error: ${error.message}. This might be due to an invalid URL or network issue.`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.headerRow}>
      <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.sno }]}>S.No</Text>
      <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.loyalty }]}>
        Loyalty No
      </Text>
      <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.name }]}>
        Name
      </Text>
      <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.phone }]}>
        Ph.No
      </Text>
      <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.birth }]}>
        Birth Date
      </Text>
      <Text style={[styles.headerCell, { width: COLUMN_WIDTHS.address }]}>
        Address
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 🎂 Heading Background with Back Button */}
      <ImageBackground
  source={require("../assets/birthday-header.png")}
  style={styles.titleBackground}
  resizeMode="cover"
>
  {/* Overlay for opacity */}
  <View style={styles.imageOverlay} />

  {/* Header content */}
  <View style={styles.headerRowInside}>
    <TouchableOpacity
      style={styles.backButton}
      onPress={() => navigation.goBack()}
    >
      <Image
        source={require("../assets/backicon.png")}
        style={styles.backIcon}
        resizeMode="contain"
      />
    </TouchableOpacity>
    <Text style={styles.title}>🎂 Birthday Report</Text>
  </View>
</ImageBackground>


      {/* Date Pickers */}
      <View style={styles.inputRow}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowFromPicker(true)}
        >
          <Text style={styles.dateText}>
            {fromDate ? formatDate(fromDate) : "From Date"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowToPicker(true)}
        >
          <Text style={styles.dateText}>
            {toDate ? formatDate(toDate) : "To Date"} {/* ✅ Shows today's date by default */}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => {
            setPageNumber(1);
            fetchCustomers(1);
          }}
        >
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
              <Text style={[styles.cell, { width: COLUMN_WIDTHS.sno }]}>
                {item.sno}
              </Text>
              <Text style={[styles.cell, { width: COLUMN_WIDTHS.loyalty }]}>
                {item.loyalty}
              </Text>
              <Text style={[styles.cell, { width: COLUMN_WIDTHS.name }]}>
                {item.name}
              </Text>
              <Text style={[styles.cell, { width: COLUMN_WIDTHS.phone }]}>
                {item.phone}
              </Text>
              <Text style={[styles.cell, { width: COLUMN_WIDTHS.birth }]}>
                {item.birth}
              </Text>
              <Text style={[styles.cell, { width: COLUMN_WIDTHS.address }]}>
                {item.address}
              </Text>
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
            loading ? (
              <ActivityIndicator
                size="small"
                color="#006A72"
                style={{ margin: hp("1%") }}
              />
            ) : null
          }
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    // padding: wp("4%"),
  },

  // Header inside Image
  headerRowInside: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("4%"),
    flex: 1,
    paddingTop: hp("5%"),
  },

  backButton: {
  width: hp("5%"),
  height: hp("5%"),
  borderRadius: hp("2.5%"),
  backgroundColor: "#006A72",
  justifyContent: "center",
  alignItems: "center",
  marginRight: wp("2%"),
  marginBottom: hp("14%"),
  marginLeft: wp("-3%"),
  },

  backIcon: {
    width: hp("2.5%"),
    height: hp("2.5%"),
    tintColor: "#fff",
  },

  // 🎂 Title Background
  titleBackground: {
  width: '100%',
  height: hp('14%'),
  justifyContent: 'flex-end',
  borderRadius: 12 ,
  overflow: 'hidden',
  marginBottom: hp('2%'),
  position: 'relative', // needed for overlay
  marginTop: hp('0%'),
  },

  title: {
    fontSize: hp('3%'),
  fontWeight: '800',
  color: '#006A72',
  textAlign: 'left',
  flex: 1,
  marginLeft: wp("8%"),
  marginBottom: hp("3%"),
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("2%"),
    justifyContent: "space-between",
  },

  dateButton: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingVertical: hp("1.2%"),
    paddingHorizontal: wp("3%"),
    marginRight: wp("2%"),
    flex: 1,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    alignItems: "center",
  },

  dateText: {
    color: "#374151",
    fontSize: hp("1.9%"),
    fontWeight: "500",
  },

  searchButton: {
    backgroundColor: "#006A72",
    paddingVertical: hp("1.2%"),
    paddingHorizontal: wp("5%"),
    borderRadius: 10,
    shadowColor: "#006A72",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  searchText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: hp("1.9%"),
    letterSpacing: 0.5,
  },

  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1.5,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#E0F7F6",
    paddingVertical: hp("1%"),
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },

  headerCell: {
    fontWeight: "700",
    fontSize: hp("1.8%"),
    color: "#004D61",
    textAlign: "center",
  },

  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingVertical: hp("1.2%"),
    backgroundColor: "#fff",
  },

  cell: {
    fontSize: hp("1.8%"),
    color: "#374151",
    textAlign: "center",
  },
  imageOverlay: {
  ...StyleSheet.absoluteFillObject, // fills the entire ImageBackground
  backgroundColor: 'rgba(255, 255, 255, 0.43)', // adjust opacity here
},
});

export default BirthdayReport;

