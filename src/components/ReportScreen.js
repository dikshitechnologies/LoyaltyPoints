import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

const { width: screenWidth } = Dimensions.get("window");
const CARD_MIN_WIDTH = 160; // minimum width for each card
const numColumns = Math.floor(screenWidth / CARD_MIN_WIDTH); // auto adjust

const ReportScreen = () => {
  const navigation = useNavigation();

  const reportOptions = [
    {
      id: 1,
      title: "Total Customers",
      image: require("../assets/total_customers.png"),
      screen: "TotalCustomers"
    },
    {
      id: 2,
      title: "Individual Customer",
      image: require("../assets/individual.png"),
      screen: "IndividualCustomer"
    },
    {
      id: 3,
      title: "Birthday Report",
      image: require("../assets/birthday.png"),
      screen: "BirthdayReport"
    },
    {
      id: 4,
      title: "Anniversary Report",
      image: require("../assets/anniversary.png"),
      screen: "AnniversaryReport"
    },
    
  ];

  const renderCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { flex: 1 / numColumns }]}
      onPress={() => navigation.navigate(item.screen)}
    >
      <Image source={item.image} style={styles.cardImage} />
      <Text style={styles.cardTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Loyalty Reports</Text>
      </View>

      <FlatList
        data={reportOptions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCard}
        numColumns={numColumns}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#006A72ff",
    padding: wp("5%"),
    paddingTop: hp("5%"),
    alignItems: "center",
    borderBottomLeftRadius: wp("5%"),
    borderBottomRightRadius: wp("5%")
  },
  headerText: { fontSize: hp("2.6%"), color: "#fff", fontWeight: "bold" },

  grid: { padding: wp("3%") },
  row: { justifyContent: "space-between" },

  card: {
    margin: wp("2%"),
    backgroundColor: "#f8f8f8",
    borderRadius: wp("3%"),
    elevation: 3,
    alignItems: "center",
    padding: wp("3%"),
    minHeight: hp("18%")
  },
  cardImage: {
    width: "70%",
    height: hp("10%"),
    resizeMode: "contain"
  },
  cardTitle: {
    marginTop: hp("1%"),
    fontSize: hp("1.8%"),
    fontWeight: "600",
    color: "#333",
    textAlign: "center"
  }
});

export default ReportScreen;
