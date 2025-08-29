import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  BackHandler,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const { width: screenWidth } = Dimensions.get('window');
const CARD_MIN_WIDTH = 160; // minimum width for each card
const numColumns = Math.floor(screenWidth / CARD_MIN_WIDTH); // auto adjust

const ReportScreen = () => {
  const navigation = useNavigation();

  // Show exit confirmation only when this screen is focused (Android hardware back)
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
        // prevent default behavior (do not pop navigation)
      
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => subscription.remove();
    }, []),
  );

  const reportOptions = [
    {
      id: 1,
      title: 'Total Customers',
      image: require('../assets/total-customer1.png'),
      screen: 'TotalCustomers',
    },
    {
      id: 2,
      title: 'Individual Customer',
      image: require('../assets/individual.png'),
      screen: 'IndividualCustomer',
    },
    {
      id: 3,
      title: 'Birthday Report',
      image: require('../assets/birthday.png'),
      screen: 'BirthdayReport',
    },
    {
      id: 4,
      title: 'Anniversary Report',
      image: require('../assets/anniversary.png'),
      screen: 'AnniversaryReport',
    },
    {
      id: 5,
      title: 'Overall Report',
      image: require('../assets/overall.png'),
      screen: 'OverallReport',
    },
    {
      id: 6,
      title: 'Company Report',
      image: require('../assets/company1.png'),
      screen: 'PerCompReport',
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
        keyExtractor={item => item.id.toString()}
        renderItem={renderCard}
        numColumns={numColumns}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f5f8' },

  header: {
    backgroundColor: '#006A72',
    paddingVertical: hp('4%'),
    alignItems: 'center',
    borderBottomLeftRadius: wp('7%'),
    borderBottomRightRadius: wp('7%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  headerText: {
    fontSize: hp('3%'),
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  grid: { padding: wp('4%') },
  row: { justifyContent: 'start' },

  card: {
    flex: 1,
    margin: wp('2%'),
    backgroundColor: '#fff',
    borderRadius: wp('4%'),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    alignItems: 'center',
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('2%'),
    minHeight: hp('16%'), // reduced card height
    maxWidth: wp('40%'), // makes grid tighter
  },

  cardImage: {
    width: wp('18%'),
    height: wp('18%'),
    resizeMode: 'contain',
    borderRadius: wp('3%'),
    marginBottom: hp('0.8%'),
  },

  cardTitle: {
    marginTop: hp('0.5%'),
    fontSize: hp('1.7%'),
    fontWeight: '600',
    color: '#004d50',
    textAlign: 'center',
  },
});

export default ReportScreen;
