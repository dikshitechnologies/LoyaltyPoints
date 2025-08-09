import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image } from 'react-native';
import Video from 'react-native-video';

/**
 * A splash screen component with a video background, an animated logo,
 * and a progress bar that navigates to the 'Login' screen upon completion.
 * 
 * @param {object} props - Component props.
 * @param {object} props.navigation - React Navigation prop for screen transitions.
 */
const SplashScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true, 
      }),
      Animated.timing(progress, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false, 
      }),
    ]).start();

    
    const totalAnimationDuration = 1500 + 2000; 
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, totalAnimationDuration);

    return () => clearTimeout(timer);
  }, [navigation, fadeAnim, progress]);

  const progressBarWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <Video
        source={require('../assets/splash.mp4')}
        style={styles.backgroundVideo}
        muted={true}
        repeat={true}
        resizeMode="cover"
        rate={1.0}
        ignoreSilentSwitch={"obey"}
      />

   
      <View style={styles.overlay} />
      
     
      <View style={styles.topContainer}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Image
            source={require('../assets/logo.png')} 
            style={styles.logo}
          />
        </Animated.View>
      </View>

 
      <View style={styles.bottomContainer}>
        <View style={styles.progressBarContainer}>
          <Animated.View style={[styles.progressBar, { width: progressBarWidth }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
    justifyContent: 'space-between', 
 
    alignItems: 'center',           
    
    paddingVertical: 80,           
  },
  backgroundVideo: {
   
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  overlay: {
   
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30, 149, 229, 0.6)',
  },
  topContainer: {
    
    alignItems: 'center',
  },
  bottomContainer: {
    
    width: '100%',
    alignItems: 'center',
  },
  logo: {
    width: 250,
    height: 150,
    resizeMode: 'contain',
  },
  progressBarContainer: {
    height: 6,
    width: '60%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden', 
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'white',
  },
});

export default SplashScreen;