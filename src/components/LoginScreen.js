import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions
} from "react-native";
import { setCompanyCode, setGroupCode } from "../store";
import axios from "axios";
import Video from "react-native-video";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import loginVideo from "../assets/Generate.mp4";
import { useFocusEffect } from "@react-navigation/native";
import { handleStatusCodeError } from "./ErrorHandler";
import { BASE_URL } from "./Services";
import { getCompanyCode } from "../store";

const { width, height } = Dimensions.get("window");
const isTablet = Math.min(width, height) >= 600;

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const passwordRef = useRef(null);
  const scrollViewRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      setCompanyCode("");
      console.log("Company code reset on focus", getCompanyCode());
    }, [])
  );

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        // Scroll to the bottom when keyboard appears
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const savedUsername = await AsyncStorage.getItem("username");
        const savedPassword = await AsyncStorage.getItem("password");
        if (savedUsername && savedPassword) {
          setUsername(savedUsername);
          setPassword(savedPassword);
          setRememberMe(true);
        }
      } catch (error) {
        console.error("Error loading saved credentials:", error);
      }
    };
    loadCredentials();
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Please enter username and password");
      return;
    }

    try {
      const response = await axios.get(
        `${BASE_URL}LoginPage`,
        { params: { username, password } }
      );
      console.log("Login response:", response);

      if (response.status == 200) {
        const { roleFlag, username: userFromAPI, fcompcode } = response.data;

        if (rememberMe) {
          await AsyncStorage.setItem("username", username);
          await AsyncStorage.setItem("password", password);
        } else {
          await AsyncStorage.removeItem("username");
          await AsyncStorage.removeItem("password");
        }

        if (roleFlag === "Y") {
          navigation.navigate("Company");
        } else if (roleFlag === "N") {
          console.log(response.data.companyCode)
          setCompanyCode(response.data.companyCode);
          setGroupCode(response.data.groupCode);
          console.log("Company code set:", getCompanyCode());
          navigation.navigate("Home", {
            username: userFromAPI || username,
            roleFlag,
            companyCode: fcompcode,
            fullPayload: response.data
          });
        }
        handleCancel();
      } else {
        handleStatusCodeError(response.status, "Error deleting data");
      }
    } catch (error) {
      if (error.response) {
        handleStatusCodeError(
          error.response.status,
          error.response.data?.message || "An unexpected server error occurred."
        );
      } else if (error.request) {
        alert("No response received from the server. Please check your network connection.");
      }
      else {
        alert(`Error: ${error.message}. This might be due to an invalid URL or network issue.`);
      }
    }
  };

  const handleCancel = () => {
    setUsername("");
    setPassword("");
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#fff" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 10}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ 
            flexGrow: 1,
            paddingBottom: keyboardVisible ? hp('0%') : 0
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={["#000000ff", "#000000ff", "#0b508cff"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.container}
          >
            {!keyboardVisible && (
              <Video
                source={loginVideo}
                style={styles.video}
                muted
                repeat
                resizeMode="cover"
                rate={1.0}
                ignoreSilentSwitch="obey"
                 controls={false}  
                  paused={false} 
              />
            )}

            <View style={[
              styles.formContainer, 
              keyboardVisible && styles.formContainerKeyboardActive
            ]}>
              <Text style={styles.header}>Welcome</Text>
              <Text style={styles.subText}>
                Please login with your information
              </Text>

              {/* Username */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>USERNAME</Text>
                <View style={styles.inputBox}>
                  <Icon name="person" size={wp("5%")} color="#006A72" style={styles.leftIcon} />
                  <TextInput
                    style={styles.textField}
                    placeholderTextColor="#888"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    returnKeyType="next"
                    value={username}
                    onChangeText={setUsername}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>PASSWORD</Text>
                <View style={styles.inputBox}>
                  <Icon name="lock" size={wp("5%")} color="#006A72" style={styles.leftIcon} />
                  <TextInput
                    ref={passwordRef}
                    style={styles.textField}
                    placeholderTextColor="#888"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    onSubmitEditing={handleLogin}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Icon
                      name={showPassword ? "visibility" : "visibility-off"}
                      size={wp("5%")}
                      color="#006A72"
                      style={styles.rightIcon}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Remember Me */}
              <TouchableOpacity
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <Icon
                  name={rememberMe ? "check-box" : "check-box-outline-blank"}
                  size={wp("5%")}
                  color="#006A72"
                />
                <Text style={styles.rememberMeText}>Remember Me</Text>
              </TouchableOpacity>

              {/* Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.saveBtn]}
                  onPress={handleLogin}
                >
                  <Text style={styles.saveText}>LOGIN</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.clearBtn]}
                  onPress={handleCancel}
                >
                  <Text style={styles.clearText}>CANCEL</Text>
                </TouchableOpacity>
              </View>

              {!keyboardVisible && (
                <Text style={styles.footer}>
                  © Dikshi Technologies - 9841419981
                </Text>
              )}
            </View>
          </LinearGradient>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center" },
  video: { width: "100%", height: isTablet ? hp("44%") : hp("50%") },
  formContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: wp("8%"),
    paddingVertical: hp("3%"),
    borderTopLeftRadius: wp("6%"),
    borderTopRightRadius: wp("6%"),
    width: "100%",
    marginTop: -hp("4%"),
  },
  formContainerKeyboardActive: {
    paddingBottom: hp('5%'),
    marginTop: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    flex: 1,
    justifyContent: 'center'
  },
  header: {
    fontSize: wp("6%"),
    fontWeight: "bold",
    color: "#006A72",
    marginBottom: hp("1%"),
    textAlign: "center",
  },
  subText: {
    fontSize: wp("3.5%"),
    color: "#006A72",
    marginBottom: hp("2%"),
    textAlign: "center",
  },
  inputContainer: { marginBottom: hp("2%") },
  label: {
    fontSize: wp("3.5%"),
    fontWeight: "600",
    color: "#006A72",
    marginBottom: hp("0.8%"),
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#8FD6DA",
    borderRadius: wp("2%"),
    backgroundColor: "#fff",
    paddingHorizontal: wp("1.5%"),
  },
  leftIcon: { marginHorizontal: wp("1%") },
  rightIcon: { marginHorizontal: wp("1%") },
  textField: {
    flex: 1,
    paddingVertical: hp("1%"),
    fontSize: wp("3.8%"),
    color: "#333",
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("2%"),
  },
  rememberMeText: {
    marginLeft: wp("2%"),
    fontSize: wp("3.5%"),
    color: "#006A72",
  },
  buttonRow: { flexDirection: "row", marginTop: hp("1%") },
  button: {
    flex: 1,
    paddingVertical: hp("1.5%"),
    borderRadius: wp("6%"),
    alignItems: "center",
    marginHorizontal: wp("1%"),
  },
  saveBtn: { backgroundColor: "#006A72" },
  saveText: { color: "#fff", fontWeight: "bold", fontSize: wp("4%") },
  clearBtn: { backgroundColor: "#D9F5F7" },
  clearText: { color: "#006A72", fontWeight: "bold", fontSize: wp("4%") },
  footer: {
    fontSize: wp("3.5%"),
    color: "#006A72",
    marginTop: isTablet ? hp("3%") : hp("7%"),
    textAlign: "center",
  },
});