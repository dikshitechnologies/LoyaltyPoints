// import React, { useEffect, useState, useRef ,useCallback  } from 'react';
// import {
//   FlatList,
//   Platform,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   View,
//   Dimensions,
//   ActivityIndicator,
//   TextInput, // Import TextInput
// } from 'react-native';
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from 'react-native-responsive-screen';
// import { BarChart, PieChart } from 'react-native-chart-kit';
// import { BASE_URL } from './Services'; // Assuming these are correctly set up
// import { getCompanyCode, getGroupCode } from '../store'; // Assuming these are correctly set up
// import axios from 'axios';

// // --- MOCK DATA for UI development without API access ---
// // (Can be removed when using the actual API)


// const screenWidth = Dimensions.get('window').width;

// const TotalCustomers = () => {
//   const [customerData, setCustomerData] = React.useState([]);
//   const [loading, setLoading] = React.useState(true);
//   const [pageNumber, setPageNumber] = React.useState(1);
//   const [hasMore, setHasMore] = React.useState(true);
//   const [searchQuery, setSearchQuery] = React.useState(''); // State for search query

//   const pageSize = 10;
//   // const companyCode = getCompanyCode();
//   const groupCode = getGroupCode();

//   const fetchCustomers = async (page = 1) => {
//     if (loading && page > 1) return; // Prevent multiple fetches while loading
//     if (!hasMore && page !== 1) return;

//     setLoading(true);
//     try {
//       const response = await axios.get(
//         `${BASE_URL}TotalLoyaltyReport/CustomerReport/${groupCode}?pageNumber=${page}&pageSize=${pageSize}`
//       );

//       if (response.status === 200) {
//         const newData = response.data.data.map((item, index) => ({
//           sno: (page - 1) * pageSize + index + 1,
//           loyalty: item.loyaltyNumber,
//           name: item.customerName,
//           phone: item.phonenumber,
//           sales: item.salesAmount || 0,
//           points: item.earnPoints || 0,
//           redeemAmt: item.redeemAmount || 0,
//           redeemPts: item.redeemPoints || 0,
//           balance: item.balance || 0,
//         }));

//         setCustomerData(prev => (page === 1 ? newData : [...prev, ...newData]));
//         setPageNumber(page);
//         setHasMore(page < response.data.totalPages);
//       }
//     } catch (error) {
//       console.error('Error fetching customers:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   React.useEffect(() => {
//     fetchCustomers(1);
//   }, []);

//   const handleLoadMore = () => {
//     if (!loading && hasMore) {
//       fetchCustomers(pageNumber + 1);
//     }
//   };

//   // Filtered customer data based on search query
//   const filteredCustomers = customerData.filter(customer =>
//     customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     customer.phone.includes(searchQuery)
//   );

//   const topCustomers = [...customerData]
//     .sort((a, b) => b.sales - a.sales)
//     .slice(0, 5);

//   const barData = {
//     labels: topCustomers.map(c => c.name.split(' ')[0]),
//     datasets: [{ data: topCustomers.map(c => c.sales) }],
//   };

//   const pieData = [
//     {
//       name: 'Earned',
//       population: customerData.reduce((sum, c) => sum + c.points, 0),
//       color: '#4CAF50',
//       legendFontColor: '#333',
//       legendFontSize: 14,
//     },
//     {
//       name: 'Redeemed',
//       population: customerData.reduce((sum, c) => sum + c.redeemPts, 0),
//       color: '#FF9800',
//       legendFontColor: '#333',
//       legendFontSize: 14,
//     },
//     {
//       name: 'Balance',
//       population: customerData.reduce((sum, c) => sum + c.balance, 0),
//       color: '#2196F3',
//       legendFontColor: '#333',
//       legendFontSize: 14,
//     },
//   ];

//   const renderFooter = () => {
//     if (!loading && !hasMore && customerData.length > 0) {
//       return <Text style={styles.endOfListText}>No more customers</Text>;
//     }
//     if (loading && pageNumber > 1) {
//       return (
//         <ActivityIndicator
//           size="small"
//           color="#006A72"
//           style={{ marginVertical: hp('2%') }}
//         />
//       );
//     }
//     return null;
//   };

//   const ChartCard = ({ title, children }) => (
//     <View style={styles.card}>
//       <Text style={styles.chartTitle}>{title}</Text>
//       {children}
//     </View>
//   );

//   const CustomerCard = ({ item }) => (
//     <View style={styles.customerCard}>
//       <View style={styles.customerHeader}>
//         <Text style={styles.customerName}>{item.name}</Text>
//         <Text style={styles.customerLoyalty}>Loyalty: {item.loyalty}</Text>
//       </View>
//       <View style={styles.customerDetails}>
//         <Text style={styles.detailText}>📞 {item.phone}</Text>
//         <Text style={styles.detailTextSales}>💰 Sales: ₹{item.sales}</Text>
//       </View>
//       <View style={styles.pointsContainer}>
//         <View style={styles.pointBox}>
//           <Text style={styles.pointLabel}>Earned</Text>
//           <Text style={[styles.pointValue, { color: '#4CAF50' }]}>{item.points}</Text>
//         </View>
//         <View style={styles.pointBox}>
//           <Text style={styles.pointLabel}>Redeemed</Text>
//           <Text style={[styles.pointValue, { color: '#FF9800' }]}>{item.redeemPts}</Text>
//         </View>
//         <View style={styles.pointBox}>
//           <Text style={styles.pointLabel}>Balance</Text>
//           <Text style={[styles.pointValue, { color: '#2196F3' }]}>{item.balance}</Text>
//         </View>
//       </View>
//     </View>
//   );

//   if (loading && pageNumber === 1) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.title}>Total Customers Report</Text>
//         <View style={styles.card}><View style={styles.skeletonChart} /></View>
//         <View style={styles.card}><View style={styles.skeletonChart} /></View>
//         <View style={styles.customerCard}><View style={styles.skeletonText} /></View>
//         <View style={styles.customerCard}><View style={styles.skeletonText} /></View>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#F4F7F9" />
//       <Text style={styles.title}>Total Customers Report</Text>
//       <View style={styles.searchContainer}>
//         <TextInput
//           style={styles.searchInput}
//           placeholder="Search by name or phone number"
//           value={searchQuery}
//           onChangeText={setSearchQuery}
//         />
//       </View>
//       <FlatList
//         data={filteredCustomers} // Use filtered data
//         keyExtractor={item => item.sno.toString()}
//         renderItem={({ item }) => <CustomerCard item={item} />}
//         onEndReached={handleLoadMore}
//         onEndReachedThreshold={0.5}
//         ListHeaderComponent={
//           <>
//             {/* <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: wp('4%') }}> */}
//               <ChartCard title="Top 5 Customers (by Sales)">
//                 <BarChart
//                   data={barData}
//                   width={screenWidth * 0.9}
//                   height={220}
//                   yAxisLabel="₹"
//                   chartConfig={chartConfig}
//                   style={styles.chartStyle}
//                   fromZero
//                 />
//               </ChartCard>
//               {/* <ChartCard title="Points Summary">
//                 <PieChart
//                   data={pieData}
//                   width={screenWidth * 0.9}
//                   height={220}
//                   accessor="population"
//                   backgroundColor="transparent"
//                   paddingLeft="15"
//                   chartConfig={chartConfig}
//                   absolute
//                 />
//               </ChartCard> */}
//             {/* </ScrollView> */}
//             <Text style={styles.listTitle}>All Customers</Text>
//           </>
//         }
//         ListFooterComponent={renderFooter}
//       />
//     </View>
//   );
// };

// const chartConfig = {
//   backgroundColor: '#FFFFFF',
//   backgroundGradientFrom: '#FFFFFF',
//   backgroundGradientTo: '#FFFFFF',
//   decimalPlaces: 0,
//   color: (opacity = 1) => `rgba(0, 106, 114, ${opacity})`,
//   labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
//   propsForDots: {
//     r: '6',
//     strokeWidth: '2',
//     stroke: '#006A72',
//   },
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F4F7F9',
//     paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
//   },
//   title: {
//     fontSize: hp('3%'),
//     fontWeight: 'bold',
//     color: '#1A2E35',
//     marginHorizontal: wp('4%'),
//     marginVertical: hp('2%'),
//   },
//   searchContainer: {
//     marginHorizontal: wp('4%'),
//     marginBottom: hp('2%'),
//   },
//   searchInput: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 10,
//     padding: wp('3%'),
//     fontSize: hp('2%'),
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//   },
//   card: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     padding: wp('4%'),
//     marginHorizontal: wp('4%'),
//     marginBottom: hp('2%'),
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//       },
//       android: {
//         elevation: 3,
//       },
//     }),
//   },
//   chartTitle: {
//     fontSize: hp('2.2%'),
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: hp('1%'),
//   },
//   chartStyle: {
//     borderRadius: 10,
//   },
//   listTitle: {
//     fontSize: hp('2.5%'),
//     fontWeight: 'bold',
//     color: '#1A2E35',
//     marginHorizontal: wp('4%'),
//     marginBottom: hp('1.5%'),
//     marginTop: hp('1%'),
//   },
//   customerCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 10,
//     padding: wp('4%'),
//     marginHorizontal: wp('4%'),
//     marginBottom: hp('1.5%'),
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.05,
//         shadowRadius: 2,
//       },
//       android: {
//         elevation: 2,
//       },
//     }),
//   },
//   customerHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: hp('1%'),
//   },
//   customerName: {
//     fontSize: hp('2.2%'),
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   customerLoyalty: {
//     fontSize: hp('1.6%'),
//     color: '#666',
//   },
//   customerDetails: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: hp('1.5%'),
//   },
//   detailText: {
//     fontSize: hp('1.8%'),
//     color: '#555',
//   },
//   detailTextSales: {
//     fontSize: hp('1.8%'),
//     color: '#006A72',
//     fontWeight: '600',
//   },
//   pointsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     borderTopWidth: 1,
//     borderTopColor: '#F0F0F0',
//     paddingTop: hp('1.5%'),
//   },
//   pointBox: {
//     alignItems: 'center',
//   },
//   pointLabel: {
//     fontSize: hp('1.6%'),
//     color: '#888',
//     marginBottom: 4,
//   },
//   pointValue: {
//     fontSize: hp('2%'),
//     fontWeight: 'bold',
//   },
//   endOfListText: {
//     textAlign: 'center',
//     color: '#999',
//     marginVertical: hp('2%'),
//   },
//   skeletonChart: {
//     height: 220,
//     backgroundColor: '#E0E0E0',
//     borderRadius: 10,
//   },
//   skeletonText: {
//     height: 100,
//     backgroundColor: '#E0E0E0',
//     borderRadius: 10,
//   },
// });

// export default TotalCustomers;







import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Dimensions,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Image,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { BarChart } from 'react-native-chart-kit';
import { BASE_URL } from './Services';
import { getGroupCode } from '../store';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

const TotalCustomers = () => {
  const navigation = useNavigation();
  const [customerData, setCustomerData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [pageNumber, setPageNumber] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');

  const pageSize = 10;
  const groupCode = getGroupCode();

  const fetchCustomers = async (page = 1) => {
    if (loading && page > 1) return;
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
        setPageNumber(page);
        setHasMore(page < response.data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCustomers(1);
  }, []);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchCustomers(pageNumber + 1);
    }
  };

  const filteredCustomers = customerData.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

  const topCustomers = [...customerData]
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  const barData = {
    labels: topCustomers.map(c => c.name.split(' ')[0]),
    datasets: [{ data: topCustomers.map(c => c.sales) }],
  };

  const renderFooter = () => {
    if (!loading && !hasMore && customerData.length > 0) {
      return <Text style={styles.endOfListText}>No more customers</Text>;
    }
    if (loading && pageNumber > 1) {
      return (
        <ActivityIndicator
          size="small"
          color="#006A72"
          style={{ marginVertical: hp('2%') }}
        />
      );
    }
    return null;
  };

  const ChartCard = ({ title, children }) => (
    <View style={styles.card}>
      <Text style={styles.chartTitle}>{title}</Text>
      {children}
    </View>
  );

  const CustomerCard = ({ item }) => (
    <View style={styles.customerCard}>
      <View style={styles.customerHeader}>
        <Text style={styles.customerName}>{item.name}</Text>
        <Text style={styles.customerLoyalty}>Loyalty: {item.loyalty}</Text>
      </View>
      <View style={styles.customerDetails}>
        <Text style={styles.detailText}>📞 {item.phone}</Text>
        <Text style={styles.detailTextSales}>💰 Sales: ₹{item.sales}</Text>
      </View>
      <View style={styles.pointsContainer}>
        <View style={styles.pointBox}>
          <Text style={styles.pointLabel}>Earned</Text>
          <Text style={[styles.pointValue, { color: '#4CAF50' }]}>{item.points}</Text>
        </View>
        <View style={styles.pointBox}>
          <Text style={styles.pointLabel}>Redeemed</Text>
          <Text style={[styles.pointValue, { color: '#FF9800' }]}>{item.redeemPts}</Text>
        </View>
        <View style={styles.pointBox}>
          <Text style={styles.pointLabel}>Balance</Text>
          <Text style={[styles.pointValue, { color: '#2196F3' }]}>{item.balance}</Text>
        </View>
      </View>
    </View>
  );

  // if (loading && pageNumber === 1) {
  //   return (
  //     <View style={styles.container}>
  //       <ImageBackground
  //         source={require('../assets/birthday-header.png')}
  //         style={styles.titleBackground}
  //         resizeMode="cover"
  //       >
  //         <View style={styles.headerRowInside}>
  //           <TouchableOpacity
  //             style={styles.backButton}
  //             onPress={() => navigation.goBack()}
  //           >
  //             <Image
  //               source={require('../assets/backicon.png')}
  //               style={styles.backIcon}
  //               resizeMode="contain"
  //             />
  //           </TouchableOpacity>
  //           <Text style={styles.title}>  Total Customers Report</Text>
  //         </View>
  //       </ImageBackground>
  //       <View style={styles.card}><View style={styles.skeletonChart} /></View>
  //       <View style={styles.card}><View style={styles.skeletonChart} /></View>
  //       <View style={styles.customerCard}><View style={styles.skeletonText} /></View>
  //       <View style={styles.customerCard}><View style={styles.skeletonText} /></View>
  //     </View>
  //   );
  // }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7F9" />

      {/* 🌟 Heading Background */}
      <ImageBackground
        source={require('../assets/customer-header.jpg')}
        style={styles.titleBackground}
        resizeMode="cover"
      >
        <View style={styles.headerRowInside}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Image
              source={require('../assets/backicon.png')}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.title}>  Total Customers Report</Text>
        </View>
      </ImageBackground>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or phone number"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={filteredCustomers}
        keyExtractor={item => item.sno.toString()}
        renderItem={({ item }) => <CustomerCard item={item} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <>
            {/* <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: wp('4%') }}> */}
              <ChartCard title="Top 5 Customers (by Sales)">
                <BarChart
                  data={barData}
                  width={screenWidth * 0.9}
                  height={220}
                  yAxisLabel="₹"
                  chartConfig={chartConfig}
                  style={styles.chartStyle}
                  fromZero
                />
              </ChartCard>
               <ChartCard title="Points Summary">
                <PieChart
                  data={pieData}
                  width={screenWidth * 0.9}
                  height={220}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  chartConfig={chartConfig}
                  absolute
                />
              </ChartCard> 
            {/* </ScrollView> */}
            <Text style={styles.listTitle}>All Customers</Text>
          </>
        }
        ListFooterComponent={renderFooter}
      />
    </View>
  );
};

const chartConfig = {
  backgroundColor: '#FFFFFF',
  backgroundGradientFrom: '#FFFFFF',
  backgroundGradientTo: '#FFFFFF',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 106, 114, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7F9',
  },
  // 🔹 Title Background
  titleBackground: {
    width: '100%',
    height: hp('18%'),
    justifyContent: 'flex-end',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: hp('2%'),
  },
  headerRowInside: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    flex: 1,
    paddingTop: hp('5%'),
  },
  backButton: {
    width: hp('5%'),
    height: hp('5%'),
    borderRadius: hp('2.5%'),
    backgroundColor: '#006A72',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('9%'),
    marginTop: hp('3.5%'),
    marginLeft: wp('-3%'),
  },
  backIcon: {
    width: hp('2.5%'),
    height: hp('2.5%'),
    tintColor: '#fff',
  },
  title: {
    fontSize: hp('3%'),
    fontWeight: '700',
    color: '#006A72',
    textAlign: 'left',
    flex: 1,
    marginTop: hp('3.5%'),
  },
  searchContainer: {
    marginHorizontal: wp('4%'),
    marginBottom: hp('2%'),
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: wp('3%'),
    fontSize: hp('2%'),
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: wp('4%'),
    marginHorizontal: wp('4%'),
    marginBottom: hp('2%'),
  },
  chartTitle: {
    fontSize: hp('2.2%'),
    fontWeight: '600',
    color: '#333',
    marginBottom: hp('1%'),
  },
  chartStyle: {
    borderRadius: 10,
  },
  listTitle: {
    fontSize: hp('2.5%'),
    fontWeight: 'bold',
    color: '#1A2E35',
    marginHorizontal: wp('4%'),
    marginBottom: hp('1.5%'),
    marginTop: hp('1%'),
  },
  customerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: wp('4%'),
    marginHorizontal: wp('4%'),
    marginBottom: hp('1.5%'),
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  customerName: {
    fontSize: hp('2.2%'),
    fontWeight: 'bold',
    color: '#333',
  },
  customerLoyalty: {
    fontSize: hp('1.6%'),
    color: '#666',
  },
  customerDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('1.5%'),
  },
  detailText: {
    fontSize: hp('1.8%'),
    color: '#555',
  },
  detailTextSales: {
    fontSize: hp('1.8%'),
    color: '#006A72',
    fontWeight: '600',
  },
  pointsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: hp('1.5%'),
  },
  pointBox: {
    alignItems: 'center',
  },
  pointLabel: {
    fontSize: hp('1.6%'),
    color: '#888',
    marginBottom: 4,
  },
  pointValue: {
    fontSize: hp('2%'),
    fontWeight: 'bold',
  },
  endOfListText: {
    textAlign: 'center',
    color: '#999',
    marginVertical: hp('2%'),
  },
  skeletonChart: {
    height: 220,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
  },
  skeletonText: {
    height: 100,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
  },
});

export default TotalCustomers;
