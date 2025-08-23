import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  FlatList,
  Modal,
  Platform,
  Alert,
  Linking,
  Dimensions,
  SafeAreaView
} from 'react-native';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import axios from 'axios';
import bgcard from '../assets/bgcard.png';
import { BASE_URL } from './Services';
import { handleStatusCodeError } from './ErrorHandler';
import { getCompanyCode, getGroupCode } from "../store";

const { width, height } = Dimensions.get('window');

const IndividualCustomer = () => {
  const [loyaltyNumber, setLoyaltyNumber] = useState('');
  const [customerData, setCustomerData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [scannedValue, setScannedValue] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const camera = useRef(null);

  const fcomCode = getCompanyCode();
  const groupCode = getGroupCode();
  const device = useCameraDevice('back');

  // Function to extract loyalty number
  const extractLoyaltyNumber = (value) => {
    if (!value) return null;
    console.log('Raw scanned value:', value);
    // Return the original value without any processing
    return value;
  };

  // Request camera permission
  useEffect(() => {
    (async () => {
      try {
        const status = await Camera.requestCameraPermission();
        setHasPermission(status === 'granted');

        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Camera permission is needed to scan barcodes and QR codes',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() }
            ]
          );
        }
      } catch (error) {
        console.error('Error requesting camera permission:', error);
      }
    })();
  }, []);

  // Fixed code scanner configuration
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'code-128', 'code-39', 'ean-13', 'ean-8', 'upc-a', 'upc-e', 'codabar', 'code-93', 'itf'],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && scannerVisible && isScanning) {
        const scannedValue = codes[0].value;
        if (scannedValue) {
          setScannedValue(scannedValue);
          const extractedNumber = extractLoyaltyNumber(scannedValue);
          if (extractedNumber) {
            setIsScanning(false);
            setShowManualInput(true);
            setManualInput(scannedValue);
          }
        }
      }
    }
  });

  // Reset scanning state when scanner opens/closes
  useEffect(() => {
    if (scannerVisible) {
      setIsScanning(true);
      setScannedValue('');
      setShowManualInput(false);
      setManualInput('');
    }
  }, [scannerVisible]);

  // Fetch customer info
  const fetchUser = async (val) => {
    if (!val) return;
    setLoyaltyNumber(val);
    setLoading(true);

    try {
      const response = await axios.get(`${BASE_URL}Register/points-summary/${val}/${groupCode}`);
      if (response.status === 200) {
        const customerInfo = {
          name: response.data.customerName,
          loyaltyNumber: val,
          balancePoints: response.data.balance
        };
        setCustomerData(customerInfo);
        fetchCustomerData(val);
      } else {
        handleStatusCodeError(response.status, "Error fetching customer");
        setTransactions([]);
        setCustomerData(null);
        
        // Show manual input if API call fails
        setShowManualInput(true);
        setManualInput(val);
      }
    } catch (error) {
      if (error.response) {
        handleStatusCodeError(error.response.status, error.response.data?.message || "Server error");
      } else {
        alert(`Error: ${error.message}`);
      }
      setTransactions([]);
      setCustomerData(null);
      
      // Show manual input on error
      setShowManualInput(true);
      setManualInput(val);
    } finally {
      setLoading(false);
    }
  };

  // Handle manual input confirmation
  const handleManualConfirm = () => {
    if (manualInput.trim()) {
      fetchUser(manualInput.trim());
      setShowManualInput(false);
      setScannerVisible(false);
    }
  };

  // Fetch transactions
  const fetchCustomerData = async (number, page = 1) => {
    if (!number.trim()) return;
    if (page === 1) setTransactions([]);
    setLoading(true);

    try {
      const pageSize = 10;
      const response = await axios.get(`${BASE_URL}Report/History/${number}/${groupCode}?pageNumber=${page}&pageSize=${pageSize}`);
      if (response.status === 200) {
        const newTransactions = response.data.data.map((item, index) => ({
          id: `${page}-${index}`,
          date: item.lDate.split(" ")[0],
          amount: item.lAmt,
          points: item.points,
          type: item.sourceTable === "Y" ? "CR" : "DR",
          description: item.sourceTable === "Y" ? "Points Added" : "Points Redeemed"
        }));
        setTransactions(prev => [...prev, ...newTransactions]);
        setHasMore(response.data.data.length === pageSize);
      } else {
        handleStatusCodeError(response.status, "Error fetching transactions");
        setHasMore(false);
      }
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const openSettings = () => {
    Linking.openSettings();
  };

  if (device == null) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Camera not available on this device</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Individual Customer Report</Text>

      {/* Loyalty Number Input + Barcode Scanner */}
      <View style={styles.inputRow}>
        <TextInput
          placeholder="Enter Loyalty Number or Scan Barcode/QR"
          value={loyaltyNumber}
          onChangeText={setLoyaltyNumber}
          style={styles.input}
          returnKeyType="done"
          onSubmitEditing={() => fetchUser(loyaltyNumber)}
        />
        <TouchableOpacity
          style={styles.scannerButton}
          onPress={() => setScannerVisible(true)}
        >
          <MaterialIcons name="qr-code-scanner" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Barcode/QR Scanner Modal */}
      <Modal
        visible={scannerVisible}
        animationType="slide"
        onRequestClose={() => setScannerVisible(false)}
      >
        <View style={styles.cameraContainer}>
          {hasPermission ? (
            <>
              <Camera
                ref={camera}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={scannerVisible}
                codeScanner={codeScanner}
                audio={false}
                zoom={0.5}
              />
              
              <View style={styles.scannerOverlay}>
                {/* Top overlay */}
                <View style={styles.overlaySection} />
                
                {/* Middle section with scanner frame */}
                <View style={styles.middleSection}>
                  <View style={styles.overlaySection} />
                  
                  <View style={styles.scannerFrameContainer}>
                    <View style={styles.scannerFrame}>
                      <View style={styles.cornerTopLeft} />
                      <View style={styles.cornerTopRight} />
                      <View style={styles.cornerBottomLeft} />
                      <View style={styles.cornerBottomRight} />
                      
                      {/* Scanning line animation */}
                      <View style={styles.scanLine} />
                    </View>
                    
                    <Text style={styles.scannerText}>
                      Align barcode or QR code within the frame
                    </Text>
                    
                    {/* Show scanned value for debugging */}
                    {scannedValue ? (
                      <View style={styles.scannedValueContainer}>
                        <Text style={styles.scannedValueLabel}>Scanned:</Text>
                        <Text style={styles.scannedValueText}>{scannedValue}</Text>
                      </View>
                    ) : null}
                  </View>
                  
                  <View style={styles.overlaySection} />
                </View>
                
                {/* Bottom overlay */}
                <View style={styles.overlaySection}>
                  <Text style={styles.helpText}>
                    Position the barcode or QR code between the lines and ensure it's well lit
                  </Text>
                </View>
              </View>

              {/* Scanner mode indicator */}
              <View style={styles.scannerModeIndicator}>
                <MaterialIcons name="qr-code" size={16} color="#fff" />
                <Text style={styles.scannerModeText}>QR & Barcode Scanner</Text>
              </View>

              {/* Manual Input Overlay */}
              {showManualInput && (
                <View style={styles.manualInputOverlay}>
                  <View style={styles.manualInputContainer}>
                    <Text style={styles.manualInputTitle}>Verify Loyalty Number</Text>
                    <Text style={styles.manualInputSubtitle}>
                      Please verify the scanned loyalty number:
                    </Text>
                    
                    <TextInput
                      style={styles.manualInput}
                      value={manualInput}
                      onChangeText={setManualInput}
                      placeholder="Enter loyalty number"
                      autoFocus={true}
                      keyboardType="default"
                    />
                    
                    <View style={styles.manualInputButtons}>
                      <TouchableOpacity 
                        style={[styles.manualButton, styles.cancelButton]}
                        onPress={() => {
                          setShowManualInput(false);
                          setIsScanning(true);
                        }}
                      >
                        <Text style={styles.buttonText}>Rescan</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.manualButton, styles.confirmButton]}
                        onPress={handleManualConfirm}
                      >
                        <Text style={styles.buttonText}>Confirm</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </>
          ) : (
            <View style={styles.permissionContainer}>
              <MaterialIcons name="camera-off" size={50} color="#999" />
              <Text style={styles.permissionText}>
                Camera permission not granted
              </Text>
              <Text style={styles.permissionSubText}>
                Please allow camera access to use the barcode scanner
              </Text>
              <TouchableOpacity style={styles.settingsButton} onPress={openSettings}>
                <Text style={styles.settingsButtonText}>Open Settings</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setScannerVisible(false)}
          >
            <MaterialIcons name="close" size={28} color="#fff" />
          </TouchableOpacity>

          {!isScanning && !showManualInput && (
            <View style={styles.successOverlay}>
              <MaterialIcons name="check-circle" size={60} color="#4CAF50" />
              <Text style={styles.successText}>Code scanned successfully!</Text>
            </View>
          )}
        </View>
      </Modal>

      {/* Customer Card */}
      {customerData && (
        <View style={styles.customerInfoContainer}>
          <View style={styles.customerCard}>
            <ImageBackground
              source={bgcard}
              style={styles.cardBackground}
              imageStyle={{ borderRadius: 12 }}
              resizeMode="cover"
            >
              <View style={styles.loyaltyNumberContainer}>
                <Text style={styles.infoLabel}>LOYALTY NUMBER</Text>
                <Text style={styles.loyaltyNumberValue}>{customerData.loyaltyNumber}</Text>
              </View>
              <View style={styles.centerNameContainer}>
                <Text style={styles.customerName}>{customerData.name}</Text>
              </View>
              <View style={styles.balanceContainer}>
                <Text style={styles.infoLabel}>BALANCE</Text>
                <Text style={styles.balanceValue}>{customerData.balancePoints}</Text>
              </View>
            </ImageBackground>
          </View>
        </View>
      )}

      {/* Transactions Header */}
      {transactions.length > 0 && (
        <View style={styles.transactionHeader}>
          <Text style={styles.headerDate}>Date</Text>
          <Text style={styles.headerAmount}>Amount</Text>
          <Text style={styles.headerType}>Type</Text>
          <Text style={styles.headerPoints}>Points</Text>
          <Text style={styles.headerDesc}>Description</Text>
        </View>
      )}

      {/* Transactions List */}
      {transactions.length > 0 ? (
        <FlatList
          data={transactions}
          style={styles.transactionList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.transactionItem}>
              <Text style={styles.transactionDate}>{item.date}</Text>
              <Text style={styles.transactionAmount}>{item.amount.toFixed(2)}</Text>
              <View style={styles.typeContainer}>
                {item.type === 'CR'
                  ? <MaterialIcons name="arrow-upward" size={16} color="#4CAF50" />
                  : <MaterialIcons name="arrow-downward" size={16} color="#F44336" />}
                <Text style={[
                  styles.transactionType, 
                  item.type === 'CR' ? styles.creditType : styles.debitType
                ]}>
                  {item.type}
                </Text>
              </View>
              <Text style={styles.transactionPoints}>{item.points}</Text>
              <Text style={styles.transactionDesc}>{item.description}</Text>
            </View>
          )}
          ListFooterComponent={() =>
            loading ? <ActivityIndicator size="small" color="#006A72" style={{ margin: 10 }} /> : null
          }
          onEndReached={() => {
            if (!loading && hasMore) {
              setPageNumber(prev => {
                const nextPage = prev + 1;
                fetchCustomerData(loyaltyNumber, nextPage);
                return nextPage;
              });
            }
          }}
          onEndReachedThreshold={0.5}
        />
      ) : !loading && customerData ? (
        <View style={styles.emptyTransactionContainer}>
          <MaterialIcons name="receipt" size={40} color="#CCCCCC" />
          <Text style={styles.emptyTransactionText}>No transactions found</Text>
        </View>
      ) : null}

      {/* Empty State */}
      {!customerData && !loading && (
        <View style={styles.emptyStateContainer}>
          <MaterialIcons name="search" size={60} color="#CCCCCC" />
          <Text style={styles.emptyStateText}>Scan a loyalty barcode/QR or enter loyalty number</Text>
          <Text style={styles.emptyStateSubText}>
            Point your camera at a barcode or QR code to scan
          </Text>
        </View>
      )}

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#006A72" />
          <Text style={styles.loadingText}>Searching customer data...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

// Styles remain the same as in your original code
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#006A72',
    margin: 16,
    textAlign: 'center'
  },
  inputRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    fontSize: 16
  },
  scannerButton: {
    backgroundColor: '#006A72',
    justifyContent: 'center',
    alignItems: 'center',
    width: 48,
    borderRadius: 8,
    marginLeft: 8
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000'
  },
  permissionText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16
  },
  permissionSubText: {
    color: '#ccc',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20
  },
  settingsButton: {
    backgroundColor: '#006A72',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8
  },
  settingsButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  overlaySection: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  middleSection: {
    flexDirection: 'row',
    height: width * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrameContainer: {
    width: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: width * 0.6,
    height: width * 0.6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: 'rgba(0, 106, 114, 0.1)',
    position: 'relative',
    overflow: 'hidden',
    alignSelf: 'center',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 20,
    height: 20,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#006A72',
    borderRadius: 2
  },
  cornerTopRight: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#006A72',
    borderRadius: 2
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 20,
    height: 20,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#006A72',
    borderRadius: 2
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#006A72',
    borderRadius: 2
  },
  scanLine: {
    position: 'absolute',
    height: 2,
    width: '100%',
    backgroundColor: '#006A72',
    top: '50%',
    opacity: 0.8,
  },
  scannerText: {
    color: 'white',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  scannedValueContainer: {
    marginTop: 10,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 5,
  },
  scannedValueLabel: {
    color: '#ccc',
    fontSize: 12,
    textAlign: 'center',
  },
  scannedValueText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  helpText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.8,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
  },
  scannerModeIndicator: {
    position: 'absolute',
    top: 40,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  scannerModeText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 12,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 5,
  },
  successText: {
    color: 'white',
    fontSize: 18,
    marginTop: 16,
    fontWeight: 'bold',
  },
  customerInfoContainer: {
    padding: 16,
    alignItems: 'center'
  },
  customerCard: {
    borderRadius: 12,
    marginVertical: 8,
    width: '100%',
    height: 180,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'hidden'
  },
  cardBackground: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between'
  },
  centerNameContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center'
  },
  customerName: {
    fontSize: 22,
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  loyaltyNumberContainer: {
    position: 'absolute',
    top: 16,
    left: 16
  },
  balanceContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16
  },
  infoLabel: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.9,
    fontWeight: '500'
  },
  loyaltyNumberValue: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold'
  },
  balanceValue: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold'
  },
  transactionHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#F5F5F5'
  },
  headerDate: {
    width: '20%',
    fontWeight: 'bold',
    fontSize: 12,
    color: '#666'
  },
  headerAmount: {
    width: '20%',
    fontWeight: 'bold',
    fontSize: 12,
    color: '#666',
    textAlign: 'right'
  },
  headerType: {
    width: '15%',
    fontWeight: 'bold',
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  },
  headerPoints: {
    width: '15%',
    fontWeight: 'bold',
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  },
  headerDesc: {
    width: '30%',
    fontWeight: 'bold',
    fontSize: 12,
    color: '#666'
  },
  transactionList: {
    flex: 1,
    paddingHorizontal: 16
  },
  transactionItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  transactionDate: {
    width: '20%',
    color: '#333',
    fontSize: 12
  },
  transactionAmount: {
    width: '20%',
    color: '#333',
    textAlign: 'right',
    fontSize: 12
  },
  typeContainer: {
    width: '15%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  transactionPoints: {
    width: '15%',
    color: '#333',
    textAlign: 'center',
    fontSize: 12
  },
  transactionDesc: {
    width: '30%',
    color: '#333',
    fontSize: 12
  },
  transactionType: {
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 4
  },
  creditType: {
    color: '#4CAF50'
  },
  debitType: {
    color: '#F44336'
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  emptyStateText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    maxWidth: '80%'
  },
  emptyStateSubText: {
    marginTop: 8,
    color: '#999',
    fontSize: 14,
    textAlign: 'center'
  },
  emptyTransactionContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyTransactionText: {
    marginTop: 8,
    color: '#999',
    fontSize: 14
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)'
  },
  loadingText: {
    marginTop: 12,
    color: '#006A72',
    fontSize: 16
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'red'
  },
  manualInputOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  manualInputContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
  },
  manualInputTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#006A72',
    textAlign: 'center',
  },
  manualInputSubtitle: {
    fontSize: 14,
    marginBottom: 15,
    color: '#666',
    textAlign: 'center',
  },
  manualInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  manualInputButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  manualButton: {
    padding: 12,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  confirmButton: {
    backgroundColor: '#006A72',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default IndividualCustomer;