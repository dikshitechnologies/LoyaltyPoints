import React, { useState, useCallback } from "react";
import axios from "axios";
import Video from "react-native-video";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  FlatList,
  Animated,
  Easing,
  ActivityIndicator
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { handleStatusCodeError } from "./components/ErrorHandler";
import { BASE_URL } from "./components/Services";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function CreationScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("company");

  // --- Company State ---
  const [companyCode, setCompanyCode] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [gstin, setGstin] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedGroupName, setSelectedGroupName] = useState("Select a group");
  const [selectedGroupCode, setSelectedGroupCode] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- Search Modal ---
  const [modalVisible, setModalVisible] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Group State ---
  const [groupName, setGroupName] = useState("");
  const [groupList, setGroupList] = useState([]);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [selectedGroupForEdit, setSelectedGroupForEdit] = useState(null);
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(300));

  useFocusEffect(
    useCallback(() => {
      getGroupNameList();
      // Animate on focus
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      ]).start();
    }, [fadeAnim, slideAnim])
  );

  // --- API: Get Groups ---
  const getGroupNameList = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}GroupCreation/GetGroups`);
      if (response.status === 200) {
        setGroupList(response.data);
      } else {
        handleStatusCodeError(response.status, "Error fetching groups");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load groups");
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Helpers ---
  const clearCompanyForm = () => {
    setCompanyCode(null);
    setSelectedGroupName("Select a group");
    setCompanyName("");
    setGstin("");
    setPhone("");
    setAddress1("");
    setAddress2("");
    setUsername("");
    setPassword("");
    setRePassword("");
    setSelectedGroup(null);
    setSelectedGroupCode(null);
    setIsEditing(false);
  };
  
    // --- API: Group CRUD ---
    const clearGroupForm = () => {
      setGroupName("");
      setSelectedGroupForEdit(null);
      setIsEditingGroup(false);
    };

  // --- API: Company CRUD ---
  const registerCompany = async () => {
    if (
      !companyName.trim() ||
      !address1.trim() ||
      !username.trim() ||
      !password ||
      !rePassword ||
      !selectedGroup
    ) {
      Alert.alert(
        "Missing Fields",
        "Please fill all required fields and select a group."
      );
      return;
    }

    if (password !== rePassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        companyName,
        gstNumber: gstin,
        phone,
        addressLine1: address1,
        addressLine2: address2,
        userName: username,
        password,
        roleFlag: "N",
        fGroupCode: selectedGroupCode,
      };
      console.log(payload)
      const res = await axios.post(`${BASE_URL}Company/companyCreation`, payload);
      if (res.status === 200 || res.status === 201) {
        Alert.alert("Success", "Company created successfully");
        clearCompanyForm();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to create company");
      console.error("Error creating company:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!companyCode) {
      Alert.alert("Error", "No company selected");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        companyName,
        groupName: selectedGroup?.fGroupName || "",
        gstNumber: gstin,
        phone,
        addressLine1: address1,
        addressLine2: address2,
        userName: username,
        password,
        roleFlag: "N",
        groupCode: selectedGroupCode,
        fGroupCode: selectedGroup?.fGroupCode || "",

      };

      console.log(payload)
      const res = await axios.put(
        `${BASE_URL}Company/updateCompany/${companyCode}`,
        payload
      );
      if (res.status === 200) {
        Alert.alert("Success", "Company updated successfully");
        clearCompanyForm();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update company");
      console.error("Error updating company:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!companyCode) {
      Alert.alert("Error", "No company selected");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.delete(
        `${BASE_URL}Company/deleteCompany/${companyCode}`
      );
      if (res.status === 200) {
        Alert.alert("Success", "Company deleted successfully");
        clearCompanyForm();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to delete company");
      console.error("Error deleting company:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveOrUpdateCompany = () => {
    if (isEditing) {
      Alert.alert("Confirm", "Update this company?", [
        { text: "Cancel" },
        { text: "Yes", onPress: handleUpdate },
      ]);
    } else {
      registerCompany();
    }
  };

  // --- API: Get All Companies ---
  const getAllCompanies = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}Company/GetCompanyList`);
      if (res.status === 200) {
        setSearchResults(res.data || []);
        setModalVisible(true);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load companies");
      console.error("Error loading companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectCompany = (company) => {
    console.log("Selected company:", company);
    setCompanyCode(company.companyCode);
    setCompanyName(company.companyName);
    setSelectedGroupName(company.fGroupName || "");
    setGstin(company.gstNumber || "");
    setPhone(company.phone || "");
    setAddress1(company.addressLine1 || "");
    setAddress2(company.addressLine2 || "");
    setUsername(company.userName || "");
    setPassword(company.password || "");
    setRePassword(company.password || "");
    setSelectedGroupCode(company.fGroupCode);
    
    // **FIXED**: Removed the line below to prevent updating the group creation form state
    // setGroupName(company.fGroupName || "");
    
    const group = groupList.find((g) => g.fGroupCode === company.groupCode);
    if (group) {
      setSelectedGroup(group);
    } else {
      fetchGroupDetails(company.groupCode);
    }
    
    setIsEditing(true);
    setModalVisible(false);
  };

  // **FIXED**: Correctly fetches a single group by its code
  const fetchGroupDetails = async (groupCode) => {
    if (!groupCode) return;
    try {
      setLoading(true);
      // The API endpoint now includes the groupCode
      const response = await axios.get(`${BASE_URL}GroupCreation/GetGroup/${groupCode}`);
      if (response.status === 200 && response.data) {
        setSelectedGroup(response.data);
      } else {
        Alert.alert("Info", "Group information for the selected company could not be found.");
        setSelectedGroup(null); // Clear selection if not found
      }
    } catch (error) {
      console.error("Error fetching group details:", error);
      Alert.alert("Error", "An error occurred while fetching group details.");
    } finally {
      setLoading(false);
    }
  };

  const registerGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert("Missing Fields", "Please enter Group Name.");
      return;
    }
    try {
      setLoading(true);
      const payload = { fGroupName: groupName.trim() };

      const res = await axios.post(`${BASE_URL}GroupCreation`, payload);
      if (res.status === 200 || res.status === 201) {
        Alert.alert("Success", "Group created successfully");
        clearGroupForm();
        getGroupNameList();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to create group");
      console.error("Error creating group:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateGroup = async () => {
    if (!selectedGroupForEdit) {
      Alert.alert("Error", "No group selected");
      return;
    }
    try {
      setLoading(true);
      const payload = { fGroupName: groupName.trim() };
      const res = await axios.put(
        `${BASE_URL}GroupCreation/UpdateGroup/${selectedGroupForEdit.fGroupCode}`,
        payload
      );
      if (res.status === 200) {
        Alert.alert("Success", "Group updated successfully");
        clearGroupForm();
        getGroupNameList();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update group");
      console.error("Error updating group:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteGroup = async () => {
    if (!selectedGroupForEdit) {
      Alert.alert("Error", "No group selected");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.delete(
        `${BASE_URL}GroupCreation/DeleteGroup/${selectedGroupForEdit.fGroupCode}`
      );
      if (res.status === 200) {
        Alert.alert("Success", "Group deleted successfully");
        clearGroupForm();
        getGroupNameList();
        setShowGroupModal(false);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to delete group");
      console.error("Error deleting group:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveOrUpdateGroup = () => {
    if (isEditingGroup) {
      Alert.alert("Confirm", "Update this group?", [
        { text: "Cancel" },
        { text: "Yes", onPress: updateGroup },
      ]);
    } else {
      registerGroup();
    }
  };

  const handleGroupSelect = (group) => {
    setSelectedGroupForEdit(group);
    setGroupName(group.fGroupName);
    setIsEditingGroup(true);
    setShowGroupModal(false);
  };

  // --- Render Inputs ---
  const renderInput = (label, value, setValue, secure, keyboardType) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setValue}
        secureTextEntry={secure || false}
        keyboardType={keyboardType || "default"}
      />
    </View>
  );

  const renderPasswordInput = (label, value, setValue, show, setShow) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.passwordRow}>
        <TextInput
          style={[styles.input, { flex: 1, borderWidth: 0 }]}
          value={value}
          onChangeText={setValue}
          secureTextEntry={!show}
        />
        <TouchableOpacity onPress={() => setShow(!show)} style={styles.eyeIcon}>
          <MaterialIcons
            name={show ? "visibility" : "visibility-off"}
            size={24}
            color="#666"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderGroupDropdown = () => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>SELECT GROUP *</Text>
      <TouchableOpacity
        style={styles.dropdownSelector}
        onPress={() => setShowGroupDropdown(true)}
      >
        <Text style={{ color: selectedGroup ? "#000" : "#020202ff", flex: 1 }}>
          { selectedGroupName}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
      </TouchableOpacity>

      <Modal visible={showGroupDropdown} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.advancedModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Group</Text>
              <TouchableOpacity 
                onPress={() => setShowGroupDropdown(false)}
                style={styles.closeIcon}
              >
                <Ionicons name="close" size={24} color="#006A72" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#006A72" />
                  <Text style={styles.loadingText}>Loading groups...</Text>
                </View>
              ) : (
                <FlatList
                  data={groupList}
                  keyExtractor={(item) => item.fGroupCode.toString()}
                  style={{ maxHeight: hp("40%") }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.listItem, 
                        selectedGroupCode === item.fGroupCode && styles.selectedListItem
                      ]}
                      onPress={() => {
                        console.log(item)
                        setSelectedGroup(item);
                        setSelectedGroupName(item.fGroupName);
                        setSelectedGroupCode(item.fGroupCode);
                        setShowGroupDropdown(false);
                      }}
                    >
                      <Text style={{ fontWeight: "600", fontSize: 16, color: "#333" }}>
                        {item.fGroupName}
                      </Text>
                      <Text style={{ color: "#666", fontSize: 12 }}>Code: {item.fGroupCode}</Text>
                    </TouchableOpacity>
                  )}
                  ItemSeparatorComponent={() => <View style={styles.separator} />}
                  ListEmptyComponent={
                    <View style={styles.emptyState}>
                      <Ionicons name="business-outline" size={40} color="#ccc" />
                      <Text style={styles.emptyStateText}>No groups available</Text>
                    </View>
                  }
                />
              )}
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setShowGroupDropdown(false)}
              >
                <Text style={styles.secondaryButtonText}>CLOSE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );

  // --- UI ---
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}>
          {/* Banner Video with Overlay */}
          <View style={{ position: "relative" }}>
            <Video
              source={require("./assets/Company.mp4")}
              style={styles.topImage}
              resizeMode="cover"
              repeat
              muted
            />
            <View style={styles.overlay}>
              <Text style={styles.bannerText}>Company & Group Management</Text>
            </View>
          </View>

          <Animated.View 
            style={[
              styles.card,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }] 
              }
            ]}
          >
            {/* Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === "company" && styles.activeTab]}
                onPress={() => {
                  setActiveTab("company");
                  clearGroupForm(); // Clear group form when switching to company
                }}
              >
                <Text
                  style={activeTab === "company" ? styles.activeTabText : styles.tabText}
                >
                  Company
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === "group" && styles.activeTab]}
                onPress={() => {
                  setActiveTab("group");
                  clearCompanyForm(); // Clear company form when switching to group
                }}
              >
                <Text
                  style={activeTab === "group" ? styles.activeTabText : styles.tabText}
                >
                  Group
                </Text>
              </TouchableOpacity>
            </View>

            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#006A72" />
                <Text style={styles.loadingText}>Processing...</Text>
              </View>
            )}

            {activeTab === "company" ? (
              <>
                {/* Edit Company Button */}
                <TouchableOpacity
                  style={styles.searchEditBtn}
                  onPress={getAllCompanies}
                >
                  <MaterialIcons name="edit" size={20} color="#fff" />
                  <Text style={styles.searchEditBtnText}>Edit Company</Text>
                </TouchableOpacity>

                {renderInput("COMPANY NAME *", companyName, setCompanyName)}
                {renderGroupDropdown()}
                {renderInput("GSTIN", gstin, setGstin)}
                {renderInput("PHONE", phone, setPhone, false, "phone-pad")}
                {renderInput("ADDRESS 1 *", address1, setAddress1)}
                {renderInput("ADDRESS 2", address2, setAddress2)}
                {renderInput("USERNAME *", username, setUsername)}
                {renderPasswordInput(
                  "PASSWORD *",
                  password,
                  setPassword,
                  showPassword,
                  setShowPassword
                )}
                {renderPasswordInput(
                  "RE-PASSWORD *",
                  rePassword,
                  setRePassword,
                  showRePassword,
                  setShowRePassword
                )}

                {/* Action Buttons */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.saveBtn]}
                    onPress={saveOrUpdateCompany}
                    disabled={loading}
                  >
                    <MaterialIcons 
                      name={isEditing ? "update" : "save"} 
                      size={20} 
                      color="#fff" 
                      style={{ marginRight: 8 }} 
                    />
                    <Text style={styles.btnText}>
                      {isEditing ? "UPDATE" : "SAVE"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.clearBtn]}
                    onPress={clearCompanyForm}
                    disabled={loading}
                  >
                    <MaterialIcons name="clear" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.btnText}>CLEAR</Text>
                  </TouchableOpacity>
                  {isEditing && (
                    <TouchableOpacity
                      style={[styles.button, styles.deleteBtn]}
                      onPress={handleDelete}
                      disabled={loading}
                    >
                      <MaterialIcons name="delete" size={20} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.btnText}>DELETE</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            ) : (
              <>
                {/* Group Creation UI */}
                <TouchableOpacity
                  style={styles.searchEditBtn}
                  onPress={() => setShowGroupModal(true)}
                >
                  <MaterialIcons name="edit" size={20} color="#fff" />
                  <Text style={styles.searchEditBtnText}>Manage Groups</Text>
                </TouchableOpacity>

                {renderInput("GROUP NAME *", groupName, setGroupName)}
                
                {/* Action Buttons */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.saveBtn]}
                    onPress={saveOrUpdateGroup}
                    disabled={loading}
                  >
                    <MaterialIcons 
                      name={isEditingGroup ? "update" : "add"} 
                      size={20} 
                      color="#fff" 
                      style={{ marginRight: 8 }} 
                    />
                    <Text style={styles.btnText}>
                      {isEditingGroup ? "UPDATE" : "CREATE"} 
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.clearBtn]}
                    onPress={clearGroupForm}
                    disabled={loading}
                  >
                    <MaterialIcons name="clear" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.btnText}>CLEAR</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Animated.View>
        </ScrollView>

        {/* Company Selection Modal */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalBackdrop}>
            <View style={styles.advancedModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Company</Text>
                <TouchableOpacity 
                  onPress={() => setModalVisible(false)}
                  style={styles.closeIcon}
                >
                  <Ionicons name="close" size={24} color="#006A72" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalBody}>
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#006A72" />
                    <Text style={styles.loadingText}>Loading companies...</Text>
                  </View>
                ) : (
                  <FlatList
                    data={searchResults}
                    keyExtractor={(item, i) => i.toString()}
                    style={{ maxHeight: hp("50%") }}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.listItem}
                        onPress={() => selectCompany(item)}
                      >
                        <View>
                          <Text style={styles.companyName}>{item.companyName}</Text>
                          <Text style={styles.gstText}>{item.gstNumber || "No GSTIN"}</Text>
                          <Text style={styles.groupText}>Group: {item.fGroupName}</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color="#006A72" />
                      </TouchableOpacity>
                    )}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    ListEmptyComponent={
                      <View style={styles.emptyState}>
                        <Ionicons name="business-outline" size={40} color="#ccc" />
                        <Text style={styles.emptyStateText}>No companies available</Text>
                      </View>
                    }
                  />
                )}
              </View>
              
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.secondaryButtonText}>CLOSE</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Group Management Modal */}
        <Modal visible={showGroupModal} transparent animationType="slide">
          <View style={styles.modalBackdrop}>
            <View style={styles.advancedModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Manage Groups</Text>
                <TouchableOpacity 
                  onPress={() => {
                    setShowGroupModal(false);
                    clearGroupForm();
                  }}
                  style={styles.closeIcon}
                >
                  <Ionicons name="close" size={24} color="#006A72" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalBody}>
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#006A72" />
                    <Text style={styles.loadingText}>Loading groups...</Text>
                  </View>
                ) : (
                  <FlatList
                    data={groupList}
                    keyExtractor={(item) => item.fGroupCode.toString()}
                    style={{ maxHeight: hp("50%") }}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.listItem,
                          selectedGroupForEdit?.fGroupCode === item.fGroupCode && styles.selectedListItem
                        ]}
                        onPress={() => handleGroupSelect(item)}
                      >
                        <View style={{flex: 1}}>
                          <Text style={styles.companyName}>{item.fGroupName}</Text>
                          <Text style={styles.gstText}>Code: {item.fGroupCode}</Text>
                        </View>
                        <View style={styles.groupActionButtons}>
                          <TouchableOpacity 
                            onPress={() => handleGroupSelect(item)}
                            style={styles.smallActionButton}
                          >
                            <MaterialIcons name="edit" size={20} color="#006A72" />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            onPress={() => {
                              setSelectedGroupForEdit(item);
                              Alert.alert("Confirm Delete", `Delete group "${item.fGroupName}"?`, [
                                { text: "Cancel" },
                                { text: "Delete", onPress: deleteGroup, style: "destructive" },
                              ]);
                            }}
                            style={[styles.smallActionButton, { marginLeft: 10 }]}
                          >
                            <MaterialIcons name="delete" size={20} color="#E63946" />
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    )}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    ListEmptyComponent={
                      <View style={styles.emptyState}>
                        <Ionicons name="business-outline" size={40} color="#ccc" />
                        <Text style={styles.emptyStateText}>No groups available</Text>
                      </View>
                    }
                  />
                )}
              </View>
              
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => {
                    setShowGroupModal(false);
                    clearGroupForm();
                  }}
                >
                  <Text style={styles.secondaryButtonText}>CLOSE</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#E6F9FF" },
    topImage: { width: wp("100%"), height: hp("22%") },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.3)",
      justifyContent: "center",
      alignItems: "center",
    },
    bannerText: { 
      color: "#fff", 
      fontSize: wp("5.5%"), 
      fontWeight: "bold",
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: {width: 1, height: 1},
      textShadowRadius: 3
    },
    card: {
      backgroundColor: "#fff",
      marginHorizontal: wp("5%"),
      marginTop: -hp("5%"), // Pull the card up
      padding: wp("5%"),
      borderRadius: wp("4%"),
      shadowColor: "#006A72",
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 5,
    },
    tabContainer: {
      flexDirection: "row",
      backgroundColor: "#E8F9FA",
      borderRadius: 12,
      overflow: "hidden",
      marginBottom: 20,
      borderWidth: 1,
      borderColor: "#D0F4F7",
    },
    tabButton: { 
      flex: 1, 
      alignItems: "center", 
      padding: 12,
    },
    tabText: { 
      color: "#006A72", 
      fontWeight: "600",
      fontSize: 15
    },
    activeTab: { 
      backgroundColor: "#006A72",
      borderRadius: 10,
      margin: 2,
    },
    activeTabText: { 
      color: "#fff", 
      fontWeight: "600",
      fontSize: 15
    },
    inputContainer: { 
      marginBottom: 16 
    },
    label: { 
      fontWeight: "600", 
      color: "#006A72", 
      marginBottom: 6,
      fontSize: 14
    },
    input: {
      borderWidth: 1,
      borderColor: "#D1E8EB",
      borderRadius: 10,
      padding: 14,
      backgroundColor: "#FAFDFE",
      fontSize: 15,
      color: "#333"
    },
    dropdownSelector: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#D1E8EB",
      borderRadius: 10,
      padding: 14,
      backgroundColor: "#FAFDFE",
    },
    passwordRow: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#D1E8EB",
      borderRadius: 10,
      backgroundColor: "#FAFDFE",
      paddingRight: 10,
    },
    eyeIcon: {
      padding: 5,
    },
    buttonRow: {
      flexDirection: "row",
      marginHorizontal: -5, // Counteract button margin
      marginTop: 20,
    },
    button: {
      flex: 1,
      marginHorizontal: 5,
      padding: 14,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    },
    btnText: { 
      fontWeight: "600", 
      color: "#fff", 
      fontSize: 15 
    },
    saveBtn: { 
      backgroundColor: "#006A72" 
    },
    clearBtn: { 
      backgroundColor: "#7F9FA3" 
    },
    deleteBtn: { 
      backgroundColor: "#E63946" 
    },
    searchEditBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#4A9BA8",
      padding: 12,
      borderRadius: 10,
      marginBottom: 16,
    },
    searchEditBtnText: { 
      color: "#fff", 
      fontWeight: "600", 
      marginLeft: 8,
      fontSize: 15
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      borderRadius: wp("4%"),
    },
    loadingContainer: {
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      marginTop: 10,
      color: '#006A72',
      fontSize: 16,
    },
    groupText: {
      color: "#888",
      fontSize: 12,
      marginTop: 2,
    },
    
    // Advanced Modal Styles
    modalBackdrop: {
      flex: 1,
      justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.5)",
      padding: 16,
    },
    advancedModal: {
      backgroundColor: "#fff",
      borderRadius: 16,
      overflow: "hidden",
      maxHeight: hp("80%"),
      shadowColor: "#000",
      shadowOpacity: 0.25,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 5 },
      elevation: 10,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: "#E8F9FA",
      backgroundColor: "#F7FDFE",
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: "#006A72",
    },
    closeIcon: {
      padding: 4,
    },
    modalBody: {
      paddingHorizontal: 10,
      paddingVertical: 10,
    },
    modalFooter: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: "#E8F9FA",
      backgroundColor: "#F7FDFE",
    },
    listItem: {
      paddingVertical: 16,
      paddingHorizontal: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderRadius: 8,
      marginVertical: 2,
    },
    selectedListItem: {
      backgroundColor: "#E6F9FF",
    },
    companyName: {
      fontWeight: "600",
      fontSize: 16,
      color: "#333",
      marginBottom: 4,
    },
    gstText: {
      color: "#666",
      fontSize: 13,
    },
    separator: {
      height: 1,
      backgroundColor: "#E8F9FA",
      marginHorizontal: 10,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 30,
    },
    emptyStateText: {
      marginTop: 10,
      color: "#999",
      fontSize: 15,
      textAlign: "center",
    },
    secondaryButton: {
      backgroundColor: "#E8F9FA",
      padding: 14,
      borderRadius: 10,
      alignItems: "center",
    },
    secondaryButtonText: {
      color: "#006A72",
      fontWeight: "600",
      fontSize: 15,
    },
    groupActionButtons: {
      flexDirection: "row",
      alignItems: "center",
    },
    smallActionButton: {
      padding: 8,
      borderRadius: 20, // Circular buttons
      backgroundColor: "#F0F9FA",
    },
});