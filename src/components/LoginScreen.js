import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import Video from "react-native-video";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/MaterialIcons";
import loginVideo from "../assets/Logindesign.mp4";

const { height } = Dimensions.get("window");

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    navigation.navigate("RateFixing");
  };

  const handleCancel = () => {
    setUsername("");
    setPassword("");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={["#000000ff", "#000000ff", "#0b508cff"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.container}
        >
          <Video
            source={loginVideo}
            style={styles.video}
            muted
            repeat
            resizeMode="cover"
            rate={1.0}
            ignoreSilentSwitch="obey"
          />

          <View style={styles.formContainer}>
            <Text style={styles.header}>Welcome</Text>
            <Text style={styles.subText}>
              Please login with your information
            </Text>

            {/* Username */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>USERNAME</Text>
              <View style={styles.inputBox}>
                <Icon
                  name="person"
                  size={20}
                  color="#006A72"
                  style={styles.leftIcon}
                />
                <TextInput
                  style={styles.textField}
                
                  placeholderTextColor="#888"
                  value={username}
                  onChangeText={setUsername}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>PASSWORD</Text>
              <View style={styles.inputBox}>
                <Icon
                  name="lock"
                  size={20}
                  color="#006A72"
                  style={styles.leftIcon}
                />
                <TextInput
                  style={styles.textField}
                
                  placeholderTextColor="#888"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Icon
                    name={showPassword ? "visibility" : "visibility-off"}
                    size={20}
                    color="#006A72"
                    style={styles.rightIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>

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

            <Text style={styles.footer}>
              © Dikshi Technologies - 9841419981
            </Text>
          </View>
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center" },
  video: { width: "100%", height: height * 0.5 },
  formContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 30,
    paddingVertical: 25,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    width: "100%",
    marginTop: -30,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#006A72",
    marginBottom: 5,
    textAlign: "center",
  },
  subText: {
    fontSize: 14,
    color: "#006A72",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: { marginBottom: 15 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#006A72",
    marginBottom: 5,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#8FD6DA",
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 5,
  },
  leftIcon: { marginHorizontal: 5 },
  rightIcon: { marginHorizontal: 5 },
  textField: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14,
    color: "#333",
  },
  buttonRow: { flexDirection: "row", marginTop: 15 },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    marginHorizontal: 5,
  },
  saveBtn: { backgroundColor: "#006A72" },
  saveText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  clearBtn: { backgroundColor: "#D9F5F7" },
  clearText: { color: "#006A72", fontWeight: "bold", fontSize: 15 },
  footer: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
    marginTop: 50,
    textAlign: "center",
  },
});
