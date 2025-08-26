import axios from "axios";
import { BASE_URL } from "./Services";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Modal,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  Alert,
  Animated,
  Easing,
  ScrollView,
  KeyboardAvoidingView,
  FlatList,
  SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { useFocusEffect } from "@react-navigation/native";
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import DeviceInfo from 'react-native-device-info';
import { showConfirmation } from "./AlertUtils";
import { getCompanyCode, getGroupCode } from "../store";
import { handleStatusCodeError } from "./ErrorHandler";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDebounce } from 'use-debounce';
import { parse } from "react-native-svg";

const isTablet = DeviceInfo.isTablet();

export default function PointsScreen({ navigation }) {
  const fcomCode = getCompanyCode();
  const groupCode = getGroupCode();
  
  // Points calculation values
  const [currentValPoint, setCurrentValPoint] = useState(null);
  const [currentValAmount, setCurrentValAmount] = useState(null);
  const [currentRedeemPoint, setCurrentRedeemPoint] = useState(null);
  const [currentRedeemAmount, setCurrentRedeemAmount] = useState(null);

  // Add Points State
  const [addLoyaltyNumber, setAddLoyaltyNumber] = useState("");
  const [addName, setAddName] = useState("");
  const [addBalance, setAddBalance] = useState("");
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [pointsEarned, setPointsEarned] = useState("");
  const [addNarration, setAddNarration] = useState("");

  // Redeem Points State
  const [redeemLoyaltyNumber, setRedeemLoyaltyNumber] = useState("");
  const [redeemName, setRedeemName] = useState("");
  const [redeemBalance, setRedeemBalance] = useState("");
  const [redeemPoints, setRedeemPoints] = useState("");
  const [redeemAmount, setRedeemAmount] = useState("");
  const [redeemNarration, setRedeemNarration] = useState("");

  // Mode and UI State
  const [mode, setMode] = useState("add");
  const [modalAddVisible, setModalAddVisible] = useState(false);
  const [modalRedeemVisible, setModalRedeemVisible] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  
  // Search and Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [searchResults, setSearchResults] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Refs
  const loyaltyNumberRef = useRef(null);
  const purchaseAmountRef = useRef(null);
  const redeemPointsRef = useRef(null);
  const animation = useRef(new Animated.Value(0)).current;
  const [isEditing, setIsEditing] = useState(false);
  const [Id, setId] = useState(null);
  
  // Validation errors
  const [validationErrors, setValidationErrors] = useState({});

  // Animation for mode switching
  const switchMode = (newMode) => {
    setMode(newMode);
    setValidationErrors({}); // Clear validation errors when switching modes

    if (newMode === "add") {
      setAddLoyaltyNumber("");
      setAddName("");
      setAddBalance("");
      setPurchaseAmount("");
      setPointsEarned("");
      setAddNarration("");
      setSearchResults([]);
      setLoading(false);
      setHasMore(true);
      setPageNumber(1);
      setSearchTerm("");
      setIsEditing(false);
    } else {
      setRedeemLoyaltyNumber("");
      setRedeemName("");
      setRedeemBalance("");
      setRedeemPoints("");
      setRedeemAmount("");
      setRedeemNarration("");
      setSearchResults([]);
      setLoading(false);
      setHasMore(true);
      setPageNumber(1);
      setSearchTerm("");
      setIsEditing(false);
    }
    Animated.timing(animation, {
      toValue: newMode === "add" ? 0 : 1,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  };

  const sliderLeft = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["2%", "50%"],
  });

  // Focus effect to load point values
  useFocusEffect(
    useCallback(() => {
      handleClear();
      AddPointsget();
      RedeemAmount(); 
    }, [])
  );

  // Camera permission request
  useEffect(() => {
    requestPermission();
  }, []);

  const requestPermission = async () => {
    let status;
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      status = granted === PermissionsAndroid.RESULTS.GRANTED ? 'authorized' : 'denied';
    } else {
      status = await Camera.requestCameraPermission();
    }
    setHasPermission(status === 'authorized');
  };


  

  // QR Code Scanner
  const device = useCameraDevice('back');
  const codeScanner = useCodeScanner({
  codeTypes: [
     'codabar', 
    'qr', 
    'code-128', 
    'code-39', 
    'ean-13', 
    'ean-8', 
    'upc-a',  
    'upc-e', 

    'code-93', 
    'itf'
  ],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && codes[0].value) {
          const code = codes[0];
           console.log(code);
        const scannedValue = code.value;
        const format = code.type; // important!
        
        const extractedNumber = extractLoyaltyNumber(scannedValue, format);
        if (mode === "add") {
          setAddLoyaltyNumber(extractedNumber);
        } else {
          setRedeemLoyaltyNumber(extractedNumber);
        }
        setShowScanner(false);
        loyaltyNumberRef.current.focus();
      }
    }
  });
  const extractLoyaltyNumber = (value, format) => {
  if (!value) return null;
  let cleaned = value.trim();

  switch (format.toLowerCase()) {
    case 'code-39':
      // Remove everything except digits
      cleaned = cleaned.replace(/[^0-9]/g, '');
      // Remove potential start/stop *
      if (cleaned.startsWith('*') && cleaned.endsWith('*')) {
        cleaned = cleaned.slice(1, -1);
      }
      break;

    case 'codabar':
      if (/^[A-D].*[A-D]$/i.test(cleaned)) {
        cleaned = cleaned.slice(1, -1);
      }
      break;

    case 'upc-a':
    case 'ean-13':
    case 'ean-8':
    case 'upc-e':
    case 'itf':
      cleaned = cleaned.replace(/\D/g, '');
      break;

    case 'code-128':
    case 'code-93':
    case 'qr':
      break;

    default:
      break;
  }

  return cleaned;
};

  // Calculate points based on purchase amount
  const calculatePoints = (amount) => {
    if (!amount || isNaN(amount)) {
      setPointsEarned("");
      return;
    }
    
    const valAMT = parseFloat(currentValAmount) || 0;
    const valPOINT = parseFloat(currentValPoint) || 0;
    const onePointValue = valAMT / valPOINT || 0;
    let points = parseFloat(amount) / onePointValue;
    
    setPointsEarned(points.toString());
  };

  // Convert points to amount for redemption
  const convertPointsToAmount = (points) => {
    const RedeemvalPOINT = parseFloat(currentRedeemPoint) || 0;
    const onePointAMT = (parseFloat(currentRedeemAmount) || 0) / RedeemvalPOINT || 0;
    const amount = parseFloat(points) * onePointAMT;
    setRedeemAmount(amount ? amount.toFixed(2) : "");
  };

  // Validation functions
  const validateLoyaltyNumber = (number) => {
    if (!number || number.trim() === '') {
      return 'Loyalty number is required';
    }
    if (!/^[a-zA-Z0-9]+$/.test(number)) {
      return 'Loyalty number can only contain letters and numbers';
    }
    if (number.length < 3 || number.length > 20) {
      return 'Loyalty number must be between 3 and 20 characters';
    }
    return null;
  };

  const validateAmount = (amount, fieldName) => {
    if (!amount || amount.trim() === '') {
      return `${fieldName} is required`;
    }
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return `${fieldName} must be a valid positive number`;
    }
    if (parseFloat(amount) > 1000000) {
      return `${fieldName} cannot exceed 1,000,000`;
    }
    return null;
  };

  const validatePoints = (points, fieldName) => {
    if (!points || points.trim() === '') {
      return `${fieldName} is required`;
    }
    if (isNaN(points) || parseFloat(points) <= 0) {
      return `${fieldName} must be a valid positive number`;
    }
    if (!Number.isInteger(parseFloat(points))) {
      return `${fieldName} must be a whole number`;
    }
    if (parseFloat(points) > 1000000) {
      return `${fieldName} cannot exceed 1,000,000`;
    }
    return null;
  };

  const validateNarration = (narration) => {
    if (narration && narration.length > 200) {
      return 'Narration cannot exceed 200 characters';
    }
    if (narration && !/^[a-zA-Z0-9\s.,!?-]*$/.test(narration)) {
      return 'Narration contains invalid characters';
    }
    return null;
  };

  const validateAddMode = () => {
    const errors = {};
    
    // Validate loyalty number
    const loyaltyError = validateLoyaltyNumber(addLoyaltyNumber);
    if (loyaltyError) errors.addLoyaltyNumber = loyaltyError;
    
    // Validate purchase amount
    const amountError = validateAmount(purchaseAmount, 'Purchase amount');
    if (amountError) errors.purchaseAmount = amountError;
    
    // Validate narration
    const narrationError = validateNarration(addNarration);
    if (narrationError) errors.addNarration = narrationError;
    
    // Validate points earned (calculated field)
    if (!pointsEarned || isNaN(pointsEarned) || parseFloat(pointsEarned) <= 0) {
      errors.pointsEarned = 'Valid points must be calculated from purchase amount';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRedeemMode = () => {
    const errors = {};
    
    // Validate loyalty number
    const loyaltyError = validateLoyaltyNumber(redeemLoyaltyNumber);
    if (loyaltyError) errors.redeemLoyaltyNumber = loyaltyError;
    
    // Validate redeem points
    const pointsError = validatePoints(redeemPoints, 'Redeem points');
    if (pointsError) errors.redeemPoints = pointsError;
    
    // Validate narration
    const narrationError = validateNarration(redeemNarration);
    if (narrationError) errors.redeemNarration = narrationError;
    
    
    // Validate redeem amount (calculated field)
    if (!redeemAmount || isNaN(redeemAmount) || parseFloat(redeemAmount) <= 0) {
      errors.redeemAmount = 'Valid amount must be calculated from redeem points';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle save action
  const handleSave = () => {
    // let isValid = false;
    
    // if (mode === "add") {
    //   isValid = validateAddMode();
    // } else {
    //   isValid = validateRedeemMode();
    // }
    
    // if (!isValid) {
    //   Alert.alert("Validation Error", "Please fix the errors before saving");
    //   return;
    // }
    
    if (isEditing) {
      showConfirmation('Do You Want to Update?', handleUpdate);
    } else {
      if (mode === "add") {
        showConfirmation('Are you sure you want to add points?', addPoints);
      } else {
        showConfirmation('Are you sure you want to redeem points?', RedeemPoints);
      }
    }
  };



const handleDelete = async () => {
    if (!Id) {
        Alert.alert("Error", "No Bill selected for deletion.");
        return;
    }

        let response;
        try {
          if(mode == "add"){
             response = await axios.delete(`${BASE_URL}AddPoints/deletePoints/${Id}`);
          }
            else{
               response = await axios.delete(`${BASE_URL}RedeemPoints/DeleteRedeem/${Id}`);
            }

            if (response.status === 200) {
                Alert.alert('Success', 'Your Bill has been deleted successfully');
                handleClear();
            } else {
                handleStatusCodeError(response.status, "Error deleting data");
            }
        } catch (error) {
            handleApiError(error);
        }
  
};




  const handleUpdate = async () => {
    if (!Id) {
      Alert.alert("Error", "No customer selected for update.");
      return;
    }
    
    let isValid = false;
    if (mode === "add") {
      isValid = validateAddMode();
    } else {
      isValid = validateRedeemMode();
    }
        
    // Check if redeem points exceed balance
    if (redeemBalance && redeemPoints) {
      const balance = parseFloat(redeemBalance);
      const points = parseFloat(redeemPoints);
      if (points > balance) {
        Alert.alert('Check Points', 'Insufficient Points');
        return;
      }
    }
    if (!isValid) {
      Alert.alert("Validation Error", "Please fix the errors before updating");
      return;
    }


    
    let payload;
    if (mode === "add") {
      payload = {
        loyaltyNumber: addLoyaltyNumber,
        lAmt: Number(purchaseAmount) || 0,
        lDate: new Date().toISOString().split("T")[0],
        points: Number(pointsEarned) || 0,
        fcomCode: fcomCode,
        narration: addNarration,
        fGroupCode: groupCode
      };
    } else {
      payload = {
        LoyaltyNum: redeemLoyaltyNumber,
        RedeemDate: new Date().toISOString().split("T")[0],
        RedeemAmt: Number(redeemAmount) || 0,
        RedeemPoint: Number(redeemPoints) || 0,
        compCode: fcomCode,
        narration: redeemNarration,
        fGroupCode: groupCode
      };
    }
    
    console.log(JSON.stringify(payload));
    console.log(Id) 

    let response;
    try {
      if (mode === "add") {
        response = await axios.put(`${BASE_URL}AddPoints/updatePoints/${Id}`, payload);
      } else {
        response = await axios.put(`${BASE_URL}RedeemPoints/UpdateRedeem/${Id}`, payload);
      }
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

  // Clear form fields
  const handleClear = () => {
    setMode("add");
    setValidationErrors({});
    if (mode === "add") { 
      setAddLoyaltyNumber("");
      setAddName("");
      setAddBalance("");
      setPurchaseAmount("");
      setPointsEarned("");
      setAddNarration("");
      setIsEditing(false);
    } else {
      setRedeemLoyaltyNumber("");
      setRedeemName("");
      setRedeemBalance("");
      setRedeemPoints("");
      setRedeemAmount("");
      setRedeemNarration("");
      setIsEditing(false);
    }
  };

  // Get customer points
  const getPoints = async () => {
    let loyaltyNumber = mode === "add" ? addLoyaltyNumber : redeemLoyaltyNumber;
    
    if (!loyaltyNumber) {
      Alert.alert("Error", "Please enter a loyalty number");
      return;
    }
    
    // Validate loyalty number before API call
    const loyaltyError = validateLoyaltyNumber(loyaltyNumber);
    if (loyaltyError) {
      setValidationErrors({
        ...validationErrors,
        [mode === "add" ? "addLoyaltyNumber" : "redeemLoyaltyNumber"]: loyaltyError
      });
      return;
    }
    
    try {
      const response = await axios.get(`${BASE_URL}Register/points-summary/${loyaltyNumber}/${groupCode}`);
      
      if (response.status == 200) {
        if (response.data.length === 0) {
          Alert.alert("Error", "No points found for this loyalty number");
          return;
        }
        
        const data = response.data;
        if (mode === "add") {
          setAddName(data.customerName);
          setAddBalance(data.balance.toString());
        } else if (mode === "redeem") {
          setRedeemName(data.customerName);
          setRedeemBalance(data.balance.toString());
        }
      } else {
        handleStatusCodeError(response.status, "Error fetching points data");
        handleClear();
      }
    } catch (error) {
      handleApiError(error);
       handleClear();
    }
  };

  // Add points API call
  const addPoints = async () => {
    if (purchaseAmount == Infinity) {
      Alert.alert("Error", "Invalid purchase amount");
      return;
    }

        
   
    
    try {
      const todayDate = new Date().toISOString().split("T")[0];
      const payload = {
        loyaltyNumber: addLoyaltyNumber,
        lAmt: Number(purchaseAmount) || 0,
        lDate: todayDate,
        points: Number(pointsEarned) || 0,
        fcomCode: fcomCode,
        narration: addNarration,
        fGroupCode: groupCode
      };
      
      const response = await axios.post(`${BASE_URL}AddPoints/newPoints`, payload);
      
      if (response.status == 200) {
        Alert.alert("Success", "Points added successfully");
        handleClear();
      } else {
        handleStatusCodeError(response.status, "Error adding points");
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  // Redeem points API call
  const RedeemPoints = async () => {
    try {
      const todayDate = new Date();
      const formattedDate = `${String(todayDate.getDate()).padStart(2, "0")}/${String(todayDate.getMonth() + 1).padStart(2, "0")}/${todayDate.getFullYear()}`;

      const payload = {
        LoyaltyNum: redeemLoyaltyNumber,
        RedeemDate: formattedDate,
        RedeemAmt: Number(redeemAmount) || 0,
        RedeemPoint: Number(redeemPoints) || 0,
        compCode: fcomCode,
        narration: redeemNarration,
        fGroupCode: groupCode
      };

      const response = await axios.post(`${BASE_URL}RedeemPoints/RedeemPoints`, payload);
      
      if (response.status == 200) {
        Alert.alert("Success", "Points redeemed successfully");
        handleClear();
      } else {
        handleStatusCodeError(response.status, "Error redeeming points");
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  // Get add points configuration
  const AddPointsget = async () => {
    try {
      const response = await axios.get(`${BASE_URL}Ratefixing/Addpointfix/${groupCode}`);
      
      if (response.status == 200) {
        setCurrentValAmount(response.data.amount);
        setCurrentValPoint(response.data.point);
      } else {
        handleStatusCodeError(response.status, "Error fetching points configuration");
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  // Get redeem points configuration
  const RedeemAmount = async () => {
    try {
      const response = await axios.get(`${BASE_URL}Ratefixing/Redeempoints/${groupCode}`);
      
      if (response.status == 200) {
        setCurrentRedeemAmount(response.data.fpointVal);
        setCurrentRedeemPoint(response.data.point);
      } else {
        handleStatusCodeError(response.status, "Error fetching redeem configuration");
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  // Handle API errors
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

  // Search functionality
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
      isCancelled = true;
    };
  }, [debouncedSearchTerm]);

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
      let url;
      if (mode === "add") {
        url = `${BASE_URL}AddPoints/SearchCustomersWithPoints/${groupCode}?searchTerm=${encodeURIComponent(term)}&page=${currentPage}&pageSize=${pageSize}`;
      } else {
        url = `${BASE_URL}RedeemPoints/SearchRedeemPoints/${groupCode}?searchTerm=${encodeURIComponent(term)}&page=${currentPage}&pageSize=${pageSize}`;
      }

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
    } catch (error) {
      if (error.response) {
        handleStatusCodeError(
          error.response.status,
          error.response.data?.message || "An unexpected server error occurred.",
          setSearchResults([]),
          setHasMore(false),
        );
      } else if (error.request) {
        alert("No response received from the server. Please check your network connection.");
      } else {
        alert(`Error: ${error.message}. This might be due to an invalid URL or network issue.`);
      }
    } finally {
      setLoading(false);
    }
  };
 const modifyPoints = async (loyaltyNumber) => {
    if (!loyaltyNumber) {
      Alert.alert("Error", "Please enter a loyalty number");
      return;
    }
    console.log(loyaltyNumber)
    // Validate loyalty number before API call
    const loyaltyError = validateLoyaltyNumber(loyaltyNumber);
    if (loyaltyError) {
      setValidationErrors({
        ...validationErrors,
        [mode === "add" ? "addLoyaltyNumber" : "redeemLoyaltyNumber"]: loyaltyError
      });
      return;
    }
    
    try {
      const response = await axios.get(`${BASE_URL}Register/points-summary/${loyaltyNumber}/${groupCode}`);
      
      if (response.status == 200) {
        if (response.data.length === 0) {
          Alert.alert("Error", "No points found for this loyalty number");
          return;
        }
        const data = response.data;
          console.log(data);
          return(data.balance);
      } else {
        handleStatusCodeError(response.status, "Error fetching points data");
        handleClear();
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  // Select customer from search results
const selectCustomer = async (customer) => {
  if (mode === "add") {
    const balAmt = await modifyPoints(customer.loyaltyNumber);  // await here
    const balAdded = parseFloat(balAmt || 0) - parseFloat(customer.points || 0);

    setAddLoyaltyNumber(customer.loyaltyNumber || '');
    setAddName(customer.customerName || '');
    setPointsEarned(customer.points?.toString() || '');
    setPurchaseAmount(customer.lAmt?.toString() || '');
    setAddNarration(customer.fnarration || '');
    setAddBalance(balAdded.toString());
    setId(Number(customer.fID) || null);
    setIsEditing(true);

  } else {
    const balAmt = await modifyPoints(customer.loyaltyNumber);  // await here
    const balRedeem = parseFloat(balAmt || 0) + parseFloat(customer.points || 0);

    setRedeemLoyaltyNumber(customer.loyaltyNumber || '');
    setRedeemName(customer.customerName || '');
    setRedeemAmount(customer.lAmt?.toString() || '');
    setRedeemPoints(customer.points?.toString() || '');
    setRedeemBalance(balRedeem.toString());
    setId(Number(customer.id) || null);
  }

  setModalAddVisible(false);
  setModalRedeemVisible(false);
  setIsEditing(true);
};


  // Render customer item in search results 
  const renderCustomerItem = ({ item }) => (
    <TouchableOpacity
      style={styles.customerItem}
      onPress={() => selectCustomer(item)}
    >
      <Text style={styles.customerName}>{item.customerName}</Text>
      <Text style={styles.customerDetail}>Loyalty: {item.loyaltyNumber || 'N/A'}</Text>
     <Text style={styles.customerDetail}>
  Date: {item.lDate ? 
    new Date(item.lDate).toLocaleDateString("en-GB") + 
    " (" + new Date(item.lDate).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) + ")" 
    : "N/A"}
</Text>

      <Text style={styles.customerDetail}>Amount: {item.lAmt || '0'}</Text>
      <Text style={styles.customerDetail}>Points: {item.points || '0'}</Text>
    </TouchableOpacity>
  );

  // Open search modal
  const handleEdit = () => {
    if (mode === "add") {
      setModalAddVisible(true);
    } else {
      setModalRedeemVisible(true);
    }
    setSearchTerm('');
    setSearchResults([]);
  };

  // Helper function to render error messages
  const renderError = (fieldName) => {
    if (validationErrors[fieldName]) {
      return <Text style={{color:"red"}}>{validationErrors[fieldName]}</Text>;
    }
    return null;
  };

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
              {/* Header */}
              <View style={[styles.header, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('PartyCreation')}
                  style={{ position: 'absolute', left: 20, alignItems: 'center' }}
                >
                  <View style={{ backgroundColor: '#FFf', padding: 10, borderRadius: 50 }}>
                    <MaterialIcons name="person-add" size={28} color="#006A72" />
                  </View>
                </TouchableOpacity>
                <Text style={[styles.headerText, { marginBottom: 10 }]}>Loyalty Hub</Text>
              </View>

              {/* Segmented Control */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tabButton, mode === "add" && styles.activeTab]}
                  onPress={() => switchMode("add")}
                >
                  <Text style={[styles.tabText, mode === "add" && styles.activeTabText]}>
                    Add Points
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabButton, mode === "redeem" && styles.activeTab]}
                  onPress={() => switchMode("redeem")}
                >
                  <Text style={[styles.tabText, mode === "redeem" && styles.activeTabText]}>
                    Redeem Points
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Points Value Display */}
              <View style={{ marginVertical: 10, paddingHorizontal: 20 }}>
                {mode === "add" ? (
                  <Text style={{ fontSize: 16, fontWeight: "bold", color: "#006A72", textAlign: 'right' }}>
                    Per Point value:{" "}
                    {currentValAmount && currentValPoint
                      ? (parseFloat(currentValAmount) / parseFloat(currentValPoint)).toFixed(2)
                      : "Loading..."}
                  </Text>
                ) : (
                  <Text style={{ fontSize: 16, fontWeight: "bold", color: "#006A72", textAlign: 'right' }}>
                    Per Redeem value:{" "}
                    {currentRedeemAmount && currentRedeemPoint
                      ? (parseFloat(currentRedeemAmount) / parseFloat(currentRedeemPoint)).toFixed(2)
                      : "Loading..."}
                  </Text>
                )}
              </View>

              {/* Form Card */}
              <View style={styles.card}>
                {/* Loyalty Number Section */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.label}>Loyalty Number *</Text>
                  <View style={styles.editContainer}>
                    <TouchableOpacity onPress={handleEdit}>
                      <MaterialIcons name="edit" size={28} color="#ffff" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.row}>
                  <TextInput
                    ref={loyaltyNumberRef}
                    style={[styles.input, validationErrors[mode === "add" ? "addLoyaltyNumber" : "redeemLoyaltyNumber"] && styles.inputError, { flex: 1 }]}
                    value={mode === "add" ? addLoyaltyNumber : redeemLoyaltyNumber}
                    onChangeText={mode === "add" ? setAddLoyaltyNumber : setRedeemLoyaltyNumber}
                    onBlur={getPoints}
                    placeholder="Enter Loyalty Number"
                    returnKeyType="next"
                    onSubmitEditing={() => {
                      if (mode === "add") {
                        purchaseAmountRef.current.focus();
                      } else {
                        redeemPointsRef.current.focus();
                      }
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => (hasPermission ? setShowScanner(true) : requestPermission())}
                    style={styles.qrButton}
                  >
                    <Icon name="qr-code-scanner" size={isTablet ? wp('5%') : wp('7%')} color="#333" />
                  </TouchableOpacity>
                </View>
                {renderError(mode === "add" ? "addLoyaltyNumber" : "redeemLoyaltyNumber")}

                {/* Name Field */}
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={mode === "add" ? addName : redeemName}
                  editable={false}
                />

                {/* Balance Points Field */}
                <Text style={styles.label}>Balance Points</Text>
                <TextInput
                  style={styles.input}
                  value={mode === "add" ? addBalance : redeemBalance}
                  editable={false}
                />

                {/* Mode Specific Fields */}
                {mode === "add" ? (
                  <>
                    <Text style={styles.label}>Amount *</Text>
                    <TextInput
                      ref={purchaseAmountRef}
                      style={[styles.input, validationErrors.purchaseAmount && styles.inputError]}
                      value={purchaseAmount}
                      onChangeText={(val) => {
                        setPurchaseAmount(val);
                        calculatePoints(val);
                      }}
                      keyboardType="phone-pad"
                      returnKeyType="next"
                    />
                    {renderError("purchaseAmount")}

                    <Text style={styles.label}>Points Earned</Text>
                    <TextInput
                      style={[styles.input, validationErrors.pointsEarned && styles.inputError]}
                      value={pointsEarned}
                      editable={false}
                    />
                    {renderError("pointsEarned")}
                  </>
                ) : (
                  <>
                    <Text style={styles.label}>Redeem Points *</Text>
                    <TextInput
                      ref={redeemPointsRef}
                      style={[styles.input, validationErrors.redeemPoints && styles.inputError]}
                      value={redeemPoints}
                      onChangeText={(val) => {
                        setRedeemPoints(val);
                        convertPointsToAmount(val);
                      }}
                      keyboardType="phone-pad"
                      returnKeyType="next"
                    />
                    {renderError("redeemPoints")}

                    <Text style={styles.label}>Amount</Text>
                    <TextInput
                      style={[styles.input, validationErrors.redeemAmount && styles.inputError]}
                      value={redeemAmount}
                      editable={false}
                      keyboardType="phone-pad"
                    />
                    {renderError("redeemAmount")}
                  </>
                )}

                {/* Narration Field */}
                <Text style={styles.label}>Narration</Text>
                <TextInput
                  style={[styles.input, validationErrors[mode === "add" ? "addNarration" : "redeemNarration"] && styles.inputError, { height: 80, textAlignVertical: 'top' }]}
                  value={mode === "add" ? addNarration : redeemNarration}
                  onChangeText={mode === "add" ? setAddNarration : setRedeemNarration}
                  multiline={true}
                  numberOfLines={4}
                  returnKeyType="done"
                />
                {renderError(mode === "add" ? "addNarration" : "redeemNarration")}

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
                   {isEditing==true && (
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
          visible={modalAddVisible || modalRedeemVisible}
          onRequestClose={() => {
            setModalAddVisible(false);
            setModalRedeemVisible(false);
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Search Customer</Text>

              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Enter Loyalty Number, Name, or Phone"
                  value={searchTerm}
                  onChangeText={(text) => {
                    setSearchTerm(text);
                    setPageNumber(1);
                  }}
                />

                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={() => searchCustomers(true)}
                >
                  <Text style={styles.searchButtonText}>Search</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={searchResults}
                renderItem={renderCustomerItem}
                keyExtractor={(item, index) => index.toString()}
                keyboardShouldPersistTaps="handled"
                style={styles.customerList}
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
                onPress={() => {
                  setModalAddVisible(false);
                  setModalRedeemVisible(false);
                }}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* QR Scanner Modal */}
        <Modal visible={showScanner} animationType="slide" onRequestClose={() => setShowScanner(false)}>
          <View style={{ flex: 1, backgroundColor: 'black' }}>
            {device && hasPermission && (
              <Camera
                style={{ flex: 1 }}
                device={device}
                isActive={showScanner}
                codeScanner={codeScanner}
              />
            )}
            <TouchableOpacity
              style={[styles.closeButton, { position: 'absolute', bottom: 30, alignSelf: 'center' }]}
              onPress={() => setShowScanner(false)}
            >
              <Text style={{ color: 'white', fontSize: 18 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  header: {
    backgroundColor: '#006A72',
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
  label: {
    fontSize: wp('4%'),
    fontWeight: "600",
    color: "#006A72",
    marginTop: hp('1.5%'),
    marginBottom: hp('0.7%')
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
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: wp('5%'),
    marginTop: hp('2%'),
    borderRadius: 30,
    backgroundColor: "#D9F5F7",
    padding: hp('0.5%'),
    overflow: "hidden",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp('1.5%'),
    borderRadius: 30,
  },
  activeTab: {
    backgroundColor: "#006A72",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  tabText: {
    color: "#006A72",
    fontWeight: "bold",
    fontSize: wp('4%'),
  },
  activeTabText: {
    color: "#fff",
  },
  row: {
    flexDirection: "row",
    alignItems: "center"
  },
  qrButton: {
    marginLeft: wp('2%'),
    paddingHorizontal: wp('1.5%'),
    justifyContent: "center",
    alignItems: "center"
  },
  editContainer: {
    paddingHorizontal: 8,
    backgroundColor: '#006A72',
    borderRadius: wp('6%'),
    padding: wp('2%')
  },
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
   deleteBtn: {
        backgroundColor: '#FF4136',
    },
});
