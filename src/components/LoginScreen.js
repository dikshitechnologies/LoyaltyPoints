import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as Keychain from 'react-native-keychain';

const illustration = require('../assets/login.jpeg');

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    username: '',
    password: '',
  });

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      username: '',
      password: '',
    };

    if (!username.trim()) {
      newErrors.username = 'Username is required';
      valid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (password.length < 2) {
      newErrors.password = 'Password must be at least 3 characters';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    Keyboard.dismiss();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // MODIFICATION: Construct URL with query parameters for a GET request.
      // The provided cURL command shows the API expects a GET request with credentials in the URL.
      const baseUrl = 'https://dikshi.ddns.net/loyaltypoints/api/LoginPage';
      // URLSearchParams automatically handles encoding of special characters.
      const params = new URLSearchParams({ username, password }).toString();
      const url = `${baseUrl}?${params}`;

      // MODIFICATION: Changed fetch call to match the cURL command (GET request).
      const response = await fetch(url, {
        method: 'GET', // Changed from 'POST'
        headers: {
          // 'Content-Type' is not needed for a GET request.
          'Accept': 'application/json',
        },
        // 'body' is not used in a GET request.
      });

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Could not parse response JSON:", e);
        // If JSON parsing fails, the response might be plain text or an HTML error page.
        // We use the raw text as the error message.
        throw new Error(responseText || "Received an invalid response from the server.");
      }

      if (!response.ok) {
        // Use the 'message' from the parsed JSON if available, otherwise fallback to the full text.
        const errorMessage = data?.message || responseText || 'An unknown error occurred.';
        throw new Error(errorMessage);
      }

      if (!data) {
          throw new Error('Received an empty but successful response from the server.');
      }
      
      if (rememberMe) {
        await Keychain.setGenericPassword(username, password, {
          service: 'loyaltypoints_app',
        });
      } else {
        await Keychain.resetGenericPassword({ service: 'loyaltypoints_app' });
      }

      if (data.token) {
          await Keychain.setGenericPassword('auth_token', data.token, {
            service: 'loyaltypoints_auth',
          });
      }

      navigation.navigate('Home', { user: data.user });

    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Login Failed',
        error.message,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };


  const loadSavedCredentials = async () => {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: 'loyaltypoints_app',
      });
      if (credentials) {
        setUsername(credentials.username);
        setPassword(credentials.password);
        setRememberMe(true);
      }
    } catch (error) {
      console.error('Failed to load credentials', error);
    }
  };

  React.useEffect(() => {
    loadSavedCredentials();
  }, []);

  return (
    <LinearGradient colors={['#f5f7fa', '#c3cfe2']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f7fa" />
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              contentContainerStyle={styles.scrollViewContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.header}>
                <Text style={styles.logo}>Welcome</Text>
                <Text style={styles.subtitle}>Sign in to continue</Text>
              </View>

              <View style={styles.illustrationContainer}>
                <Image source={illustration} style={styles.illustration} resizeMode="contain" />
              </View>

              <View style={styles.formContainer}>
                {/* Username Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Username</Text>
                  <View style={[styles.inputWrapper, errors.username ? styles.inputError : null]}>
                    <Icon name="user" size={20} color="#888" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      onChangeText={setUsername}
                      value={username}
                      placeholder="Enter your username"
                      placeholderTextColor="#A9A9A9"
                      autoCapitalize="none"
                      autoComplete="username"
                    />
                  </View>
                  {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Password</Text>
                  <View style={[styles.inputWrapper, errors.password ? styles.inputError : null]}>
                    <Icon name="lock" size={20} color="#888" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      onChangeText={setPassword}
                      value={password}
                      placeholder="••••••••"
                      secureTextEntry={!showPassword}
                      placeholderTextColor="#A9A9A9"
                      autoComplete="password"
                      textContentType="password"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.passwordToggle}
                    >
                      <Icon
                        name={showPassword ? 'eye-slash' : 'eye'}
                        size={20}
                        color="#888"
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
                </View>

                {/* Remember Me Toggle */}
                <View style={styles.rememberForgotContainer}>
                  <TouchableOpacity 
                    style={styles.rememberMe} 
                    onPress={() => setRememberMe(!rememberMe)}
                  >
                    <View style={[styles.checkbox, rememberMe && styles.checked]}>
                      {rememberMe && <Icon name="check" size={12} color="#fff" />}
                    </View>
                    <Text style={styles.rememberText}>Remember me</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  style={styles.button} 
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={['#006a72', '#006a72','#006a72']}
                    style={styles.gradient}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.buttonText}>Sign In</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginTop: 5,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  illustration: {
    width: '80%',
    height: 200,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    padding: 25,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    height: 50,
  },
  inputError: {
    borderColor: '#ff3333',
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#333',
  },
  inputIcon: {
    paddingLeft: 15,
  },
  passwordToggle: {
    paddingHorizontal: 15,
  },
  errorText: {
    color: '#ff3333',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  rememberForgotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#4c669f',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checked: {
    backgroundColor: '#4c669f',
  },
  rememberText: {
    fontSize: 14,
    color: '#555',
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  gradient: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoginScreen;