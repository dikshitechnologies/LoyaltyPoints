import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Dimensions,
} from "react-native";
import Video from "react-native-video";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/MaterialIcons";
import loginVideo from "../assets/Logindesign.mp4";


const { width, height } = Dimensions.get("window");

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    navigation.navigate("Company");
  };


  const handleCancel = () => {
    setUsername("");
    setPassword("");
  };

  return (
    <KeyboardAvoidingView>
      <LinearGradient
        colors={["#000000ff", "#000000ff", "#0b508cff"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.container}
      >
        {/* Top video */}
        <Video
          source={loginVideo}
          style={styles.video}
          muted
          repeat
          resizeMode="cover"
          rate={1.0}
          ignoreSilentSwitch="obey"
        />

        {/* Floating container */}

        <View style={styles.formContainer}>
          <Text style={styles.header}>Welcome</Text>
          <Text style={styles.subText}>Please login with your information</Text>

          {/* Username */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username:</Text>
            <View style={styles.inputBox}>
              <Icon name="person" size={20} color="#006A72" style={styles.leftIcon} />
              <TextInput
                style={styles.textField}
                placeholder="Enter username"
                placeholderTextColor="#888"
                value={username}
                onChangeText={setUsername}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password:</Text>
            <View style={styles.inputBox}>
              <Icon name="lock" size={20} color="#006A72" style={styles.leftIcon} />
              <TextInput
                style={styles.textField}
                placeholder="Enter password"
                placeholderTextColor="#888"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
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
            <TouchableOpacity style={styles.submitButton} onPress={handleLogin}>
              <Text style={styles.buttonText}>LOGIN</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.buttonText}>CANCEL</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>
            © Dikshi Technologies - 9841419981
          </Text>
        </View>

      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  video: {
    width: "100%",
    height: height * 0.5,
  },
  formContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 25,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    width: "100%",
    marginTop: -30,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
    textAlign: "center",
  },
  subText: {
    fontSize: 14,
    color: "#777",
    marginBottom: 20,
    textAlign: "center",
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: "#333",
    width: 90, // fixed label width
  },
  inputBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 5,
  },
  leftIcon: {
    marginHorizontal: 5,
  },
  rightIcon: {
    marginHorizontal: 5,
  },
  textField: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14,
    color: "#333",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#006A72",
    paddingVertical: 12,
    borderRadius: 25,
    marginLeft: 90,
    alignItems: "center",
    marginRight: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#006A72",
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    marginLeft: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  footer: {
    fontSize: 14,
    color: "#333",
    marginBottom: 40,
    marginTop: 120,
    textAlign: "center",
  },
});
