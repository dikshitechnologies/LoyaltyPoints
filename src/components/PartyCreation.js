import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    Keyboard,
    TouchableWithoutFeedback,
    Alert,
    Modal,
    FlatList
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useDebounce } from 'use-debounce';

import { BASE_URL } from './Services';
import { showConfirmation } from './AlertUtils';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { handleStatusCodeError } from './ErrorHandler';
import { getGroupCode, getCompanyCode } from '../store';

const PartyCreation = ({ navigation }) => {
    // Existing States
    const [loyaltyNumber, setLoyaltyNumber] = useState('');
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [weddingDate, setWeddingDate] = useState('');
    const [focusedField, setFocusedField] = useState(null);

    // States for Edit/Delete
    const [customerCode, setCustomerCode] = useState(null); // ✅ FIXED: store customerCode instead of id
    const [isEditing, setIsEditing] = useState(false);

    // Modal states
    const [modalVisible, setModalVisible] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

//---------------PAGINATION SEARCH STATE  ------------------
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500); 
    const [pageNumber, setPageNumber] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);


    const groupCode = getGroupCode();
    const fcomCode = getCompanyCode();

    // Refs for focus navigation
    const loyaltyNumberRef = useRef();
    const nameRef = useRef();
    const phoneNumberRef = useRef();
    const addressRef = useRef();
    const birthDateRef = useRef();
    const weddingDateRef = useRef();


    useEffect(() => {
        // Set today's date when component mounts
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const formattedDate = `${day}/${month}/${today.getFullYear()}`;
        setCurrentDate(formattedDate);
    }, []);

    const handleValidation = () => {
        if (!name.trim()) {
            Alert.alert("Validation Error", "Name is required");
            return false;
        }
        if (!/^[A-Za-z\s]+$/.test(name.trim())) {
            Alert.alert("Validation Error", "Name must contain only letters");
            return false;
        }
        if (!phoneNumber.trim()) {
            Alert.alert("Validation Error", "Phone number is required");
            return false;
        }
        if (!/^\d{10}$/.test(phoneNumber)) {
            Alert.alert("Validation Error", "Phone number must be 10 digits");
            return false;
        }
        return true;
    };

    const handleSave = () => {
        if (!handleValidation()) return;
        if (isEditing) {
            showConfirmation('Do You Want to Update This Customer?', handleUpdate);
        } else {
            showConfirmation('Do You Want to Create a New Customer?', newCustomer);
        }
    };

    const handleClear = () => {
        setLoyaltyNumber('');
        setName('');
        setPhoneNumber('');
        setAddress('');
        setBirthDate('');
        setWeddingDate('');
        setCustomerCode(null);
        setIsEditing(false);
    };

    const handleApiError = (error) => {
        if (error.response) {
            handleStatusCodeError(
                error.response.status,
                error.response.data?.message || "An unexpected server error occurred."
            );
        } else if (error.request) {
            Alert.alert("Network Error", "No response received from the server. Please check your network connection.");
        } else {
            Alert.alert("Request Error", `Error: ${error.message}. This might be due to an invalid URL or network issue.`);
        }
    };

    const newCustomer = async () => {
        const payload = {
            loyaltyNumber,
            customerName: name,
            phonenumber: phoneNumber,
            address,
            fcomCode,
            groupCode,
            fBirth: birthDate,
            fWedding: weddingDate
        };
        try {
            const response = await axios.post(`${BASE_URL}Register/newCustomer`, payload);
            if (response.status === 200) {
                Alert.alert('Success', 'Customer registered successfully');
                handleClear();
            } else {
                handleStatusCodeError(response.status, "Error saving data");
            }
        } catch (error) {
            handleApiError(error);
        }
    };

    const handleUpdate = async () => {
        if (!customerCode) {
            Alert.alert("Error", "No customer selected for update.");
            return;
        }

        const payload = {
            customerCode, // ✅ using customerCode
            loyaltyNumber,
            customerName: name,
            phonenumber: phoneNumber,
            address,
            fcomCode,
            groupCode,
            fBirth: birthDate,
            fWedding: weddingDate
        };
        try {
            const response = await axios.put(`${BASE_URL}Register/updateCustomer/${customerCode}`, payload);
            if (response.status === 200) {
                Alert.alert('Success', 'Customer updated successfully');
                handleClear();
            } else {
                handleStatusCodeError(response.status, "Error updating data");
            }
        } catch (error) {
            handleApiError(error);
        }
    };

const handleDelete = async () => {
    if (!customerCode) {
        Alert.alert("Error", "No customer is loaded to delete.");
        return;
    }


        try {
            const response = await axios.delete(`${BASE_URL}Register/RemoveCustomer${customerCode}`);
            
            if (response.status === 200) {
                Alert.alert('Success', 'Customer deleted successfully');
                handleClear();
            } else {
                handleStatusCodeError(response.status, "Error deleting data");
            }
        } catch (error) {
            handleApiError(error);
        }
  
};

//-----------------------------------------------Search Field Value  Track ------------------------------
            useEffect(() => {
                let isCancelled = false;

                const fetchCustomers = async () => {
                    const term = debouncedSearchTerm.trim();
                    if (!term) {
                        setSearchResults([]);
                        setHasMore(false);
                        return;
                    }

                    setPageNumber(1);
                    setHasMore(true);

                    try {
                        await searchCustomers({ reset: true, page: 1, term, isCancelled });
                    } catch (err) {
                        if (!isCancelled) console.error(err);
                    }
                };

                fetchCustomers();

                return () => {
                    // Cancel any ongoing fetch
                    isCancelled = true;
                };
            }, [debouncedSearchTerm]);


            const handleEdit = () => {
                setModalVisible(true);
                setSearchTerm('');
                setSearchResults([]);
            };
            //-------------------------------------Filter Values Api  -------------------------------------
const searchCustomers = async ({ reset = false, page = 1, term, isCancelled = false }) => {
      if (!term || isCancelled) return;
    if (!term) {
        setSearchResults([]);
        setHasMore(false);
        return;
    }

    if (loading || (!hasMore && !reset)) return;

    try {
        setLoading(true);
        const pageSize = 30;
        const currentPage = reset ? 1 : page;
        const url = `${BASE_URL}Register/CustomerFilterData/${groupCode}?search=${encodeURIComponent(term)}&pageNumber=${currentPage}&pageSize=${pageSize}`;

        const response = await axios.get(url);

        if (response.status === 200 && response.data) {
            const customers = response.data.data || [];

            if (reset) {
                setSearchResults(customers); 
                setPageNumber(2);             
            } else {
                setSearchResults(prev => [...prev, ...customers]);
                setPageNumber(prev => prev + 1);
            }

            setHasMore(customers.length === pageSize);
        } else {
            handleStatusCodeError(response.status, "Error fetching data");
            setSearchResults([]);
            setHasMore(false);
        }
    }  catch (error) {
          if (error.response) {
            handleStatusCodeError(
              error.response.status,
              error.response.data?.message || "An unexpected server error occurred.",
               setSearchResults([]),
            setHasMore(false),
            );
          } else if (error.request) {
            alert("No response received from the server. Please check your network connection.");
          } 
          else {
            alert(`Error: ${error.message}. This might be due to an invalid URL or network issue.`);
          }
        }
    finally {
        setLoading(false);
    }
};

        const customerSelect = async (customerCode) => {
            const customerCodeString = customerCode.toString();
            try {
                const response = await axios.get(`${BASE_URL}Register/CustomerSelect/${customerCodeString}`);

                    if (response.status === 200 && response.data) {
                        const customers = response.data;
                        selectCustomer(customers);

                    } else {
                         handleStatusCodeError(response.status, "Error deleting data");
                    }
                }  catch (error) {
            if (error.response) {
                handleStatusCodeError(
                error.response.status,
                error.response.data?.message || "An unexpected server error occurred.",
                handleClear()
                );
            } else if (error.request) {
                alert("No response received from the server. Please check your network connection.");
            } 
            else {
                alert(`Error: ${error.message}. This might be due to an invalid URL or network issue.`);
            }
            }
        };


const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date)) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};



    const selectCustomer = (customer) => {
        setLoyaltyNumber(customer.loyaltyNumber || '');
        setName(customer.customerName || '');
        setPhoneNumber(customer.phonenumber || '');
        setAddress(customer.address || '');
        setBirthDate(formatDate(customer.fBirth));
        setWeddingDate(formatDate(customer.fWed));
        setIsEditing(true);
        setModalVisible(false);

    };

    const renderCustomerItem = ({ item }) => (
        <TouchableOpacity
            style={styles.customerItem}
            onPress={() => {setCustomerCode(item.customerCode); customerSelect(item.customerCode)}}
        >
            <Text style={styles.customerName}>{item.customerName}</Text>
            <Text style={styles.customerDetail}>Loyalty: {item.loyaltyNumber || 'N/A'}</Text>
            <Text style={styles.customerDetail}>Phone: {item.phonenumber || 'N/A'}</Text>
        </TouchableOpacity>
    );

    // Reusable input component
    const renderInput = (
        label,
        value,
        setValue,
        keyboard = "default",
        refProp = null,
        onSubmitEditing = null,
        returnKeyType = "next",
        multiline = false,
        numberOfLines = 1,
        autoCapitalize = "characters",
        fieldKey
    ) => (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputWrapper}>
                <TextInput
                    style={[
                        styles.input,
                        multiline && styles.textArea,
                        focusedField === fieldKey && styles.inputFocused
                    ]}
                    value={value}
                    onChangeText={setValue}
                    keyboardType={keyboard}
                    ref={refProp}
                    returnKeyType={returnKeyType}
                    onSubmitEditing={onSubmitEditing}
                    blurOnSubmit={false}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    autoCapitalize={autoCapitalize}
                    onFocus={() => setFocusedField(fieldKey)}
                    onBlur={() => setFocusedField(null)}
                />
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                        <View style={{ flex: 1 }}>
                            <View style={[styles.header, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('RateFixing')}
                                    style={{ position: 'absolute', left: 20, alignItems: 'center' }}
                                >
                                    <View style={{ backgroundColor: '#FFf', padding: 10, borderRadius: 50 }}>
                                        <MaterialIcons name="price-change" size={28} color="#006A72" />
                                    </View>
                                </TouchableOpacity>
                                <Text style={[styles.headerText, { marginBottom: 10 }]}>Customer Registration</Text>
                            </View>

                            <View style={styles.card}>
                                <Text style={styles.subtitle}>
                                    {isEditing ? 'Update or Delete Customer Details' : 'Fill in the details to add a new Customer.'}
                                </Text>
                                <View style={styles.headerRow}>
                                    <View style={styles.dateContainer}>
                                        <Text style={styles.dateLabel}>Date:</Text>
                                        <Text style={styles.dateValue}>{currentDate}</Text>
                                    </View>

                                    <View style={styles.editContainer}>
                                        <TouchableOpacity onPress={handleEdit}>
                                            <MaterialIcons name="edit" size={28} color="#ffff" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Form Fields */}
                                {renderInput("Loyalty Number", loyaltyNumber, setLoyaltyNumber, "default", loyaltyNumberRef, () => nameRef.current.focus(), "next", false, 1, "characters", "loyaltyNumber")}
                                {renderInput("Name", name, setName, "default", nameRef, () => phoneNumberRef.current.focus(), "next", false, 1, "characters", "name")}
                                {renderInput("Phone Number", phoneNumber, setPhoneNumber, "phone-pad", phoneNumberRef, () => birthDateRef.current.focus(), "next", false, 1, "characters", "phoneNumber")}
                                {renderInput("Birth Date", birthDate, setBirthDate, "default", birthDateRef, () => weddingDateRef.current.focus(), "next", false, 1, "characters", "birthDate")}
                                {renderInput("Wedding Date", weddingDate, setWeddingDate, "default", weddingDateRef, () => addressRef.current.focus(), "next", false, 1, "characters", "weddingDate")}
                                {renderInput("Address", address, setAddress, "default", addressRef, () => handleSave(), "done", true, 3, "sentences", "address")}

                                {/* Action Buttons */}
                                <View style={styles.buttonRow}>
                                    <TouchableOpacity style={[styles.button, styles.saveBtn]} onPress={handleSave}>
                                        <Text style={styles.saveText}>{isEditing ? 'UPDATE' : 'SAVE'}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.button, styles.clearBtn]} onPress={handleClear}>
                                        <Text style={styles.clearText}>CLEAR</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Delete Button */}
                                <View style={styles.buttonRow}>
                                    {isEditing && (
                                        <TouchableOpacity style={[styles.button, styles.deleteBtn]} onPress={()=>{showConfirmation('Do You Want to Delete This Customer?', handleDelete)}}>
                                            <Text style={styles.saveText}>DELETE</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </ScrollView>

                {/* Customer Search Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Search Customer</Text>

                            <View style={styles.searchContainer}>
                               <TextInput
                                    style={styles.searchInput}
                                    placeholder="Enter Loyalty Number, Name, or Phone"
                                    value={searchTerm}
                                    onChangeText={setSearchTerm} 
                                />


                               <TouchableOpacity
                                    style={styles.searchButton}
                                    onPress={() => searchCustomers(true,1)} // reset search
                                >
                                    <Text style={styles.searchButtonText}>Search</Text>
                                </TouchableOpacity>

                            </View>

                         <FlatList
                            data={searchResults}
                            renderItem={renderCustomerItem}
                            keyExtractor={(item, index) => (index + 1).toString()}
                            style={styles.customerList}
                            keyboardShouldPersistTaps="handled"
                            onEndReached={() => {
                                if (!loading && hasMore) {
                                    searchCustomers(false, pageNumber);
                                }
                            }}
                            onEndReachedThreshold={0.5}
                            ListEmptyComponent={
                                !loading ? (
                                    <Text style={{ textAlign: 'center', padding: 10, color: '#666' }}>
                                        No customers found
                                    </Text>
                                ) : null
                            }
                            ListFooterComponent={
                                loading ? (
                                    <Text style={{ textAlign: 'center', padding: 10 }}>Loading...</Text>
                                ) : null
                            }
                        />


                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff'
    },
    header: {
        backgroundColor: '#006A72ff',
        paddingRight: wp('2.5%'),
        paddingBottom: hp('2.5%'),
        paddingTop: hp('3.5%'),
        alignItems: 'center',
        borderBottomLeftRadius: wp('5%'),
        borderBottomRightRadius: wp('5%'),
    },
    headerText: {
        fontSize: wp('6%'),
        color: 'white',
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: wp('2.5%'),
        padding: wp('4%'),
        margin: wp('4%'),
        marginTop: hp('2.5%'),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: hp('0.25%') },
        shadowOpacity: 0.1,
        shadowRadius: wp('1%'),
        elevation: 3,
    },
    subtitle: {
        fontSize: wp('4.5%'),
        color: "#006A72",
        marginBottom: hp('2%'),
        textAlign: "center",
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginBottom: hp('1.5%'),
    },
    dateLabel: {
        fontSize: wp('4%'),
        fontWeight: "600",
        color: "#006A72",
        marginRight: wp('2%'),
    },
    dateValue: {
        fontSize: wp('4%'),
        color: "#00363A",
    },
    inputContainer: {
        marginBottom: hp('1.5%'),
    },
    label: {
        fontSize: wp('4%'),
        fontWeight: "600",
        color: "#006A72",
        marginBottom: hp('0.5%'),
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
    },
    input: {
        borderWidth: 1,
        borderColor: "#8FD6DA",
        borderRadius: wp('2%'),
        paddingHorizontal: wp('3%'),
        paddingVertical: hp('1.2%'),
        fontSize: wp('4%'),
        backgroundColor: "#ffffff",
        color: "#00363A",
        flex: 1,
    },
    textArea: {
        height: hp('10%'),
        textAlignVertical: "top",
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: hp('2.5%'),
    },
    button: {
        flex: 1,
        paddingVertical: hp('1.5%'),
        borderRadius: wp('6%'),
        alignItems: "center",
        marginHorizontal: wp('1%'),
    },
    saveBtn: {
        backgroundColor: "#006A72"
    },
    saveText: {
        color: "#ffffff",
        fontWeight: "bold",
        fontSize: wp('4%')
    },
    clearBtn: {
        backgroundColor: "#D9F5F7"
    },
    

    clearText: {
        color: "#006A72",
        fontWeight: "bold",
        fontSize: wp('4%')
    },
    inputFocused: {
        borderColor: "#FF9800",
        backgroundColor: "#FFF8E1"
    },
    searchBtn: {
        backgroundColor: '#FFA500',
    },
    deleteBtn: {
        backgroundColor: '#FF4136',
    },
    // Modal styles
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: wp('90%'),
        backgroundColor: 'white',
        borderRadius: wp('4%'),
        padding: wp('5%'),
        maxHeight: hp('80%'),
    },
    modalTitle: {
        fontSize: wp('5%'),
        fontWeight: 'bold',
        color: '#006A72',
        textAlign: 'center',
        marginBottom: hp('2%'),
    },
    searchContainer: {
        flexDirection: 'row',
        marginBottom: hp('2%'),
    },
    searchInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#8FD6DA',
        borderRadius: wp('2%'),
        paddingHorizontal: wp('3%'),
        paddingVertical: hp('1%'),
        marginRight: wp('2%'),
    },
    searchButton: {
        backgroundColor: '#006A72',
        paddingHorizontal: wp('4%'),
        paddingVertical: hp('1%'),
        borderRadius: wp('2%'),
        justifyContent: 'center',
    },
    searchButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    customerList: {
        maxHeight: hp('40%'),
        marginBottom: hp('2%'),
    },
    customerItem: {
        padding: wp('3%'),
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    customerName: {
        fontSize: wp('4%'),
        fontWeight: 'bold',
        color: '#00363A',
    },
    customerDetail: {
        fontSize: wp('3.5%'),
        color: '#666',
    },
    closeButton: {
        backgroundColor: '#D9F5F7',
        padding: wp('3%'),
        borderRadius: wp('2%'),
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#006A72',
        fontWeight: 'bold',
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 8,
    },
    editContainer: {
        paddingHorizontal: 8,
        backgroundColor: '#006A72',
        borderRadius: wp('6%'),
        padding:wp('2%')
        
    },

});

export default PartyCreation;