import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Video from 'react-native-video';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('UserAuth');
    }, 8000); // 8 seconds

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Video
        source={require('../assets/splash.mp4')}
        style={styles.backgroundVideo}
        muted={true}
        repeat={false} // play only once
        resizeMode="cover"
        rate={1.0}
        ignoreSilentSwitch="obey"
        onEnd={() => navigation.replace('UserAuth')} // navigate on video end as fallback
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundVideo: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default SplashScreen;
