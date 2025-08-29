import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
  PanResponder,
  Dimensions,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';

const isTablet = Dimensions.get('window').width >= 600;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const PopupListSelector = ({
  visible,
  onClose,
  onSelect,
  fetchItems,
  title = 'Select Item',
  displayFieldIndex = [],
  onCustomClose,
  clearSearch,
  headerNames,
  columnWidths,
  tableStyles = {},
}) => {
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const animatedHeight = useRef(new Animated.Value(SCREEN_HEIGHT * 0.7)).current;
  const searchInputRef = useRef(null);

  const defaultTableStyles = {
    header: { backgroundColor: 'green' },
    headerText: { fontSize: 20, color: 'white' },
    item: { backgroundColor: '#fafafa' },
    itemText: { color: '#555' },
    titleContainer: {
      backgroundColor: 'white',
      paddingVertical: 15,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
    },
    titleText: {
      fontSize: 23,
      fontFamily: '',
      color: 'white',
      textAlign: 'center',
      color:'black'
    },
    closeIcon: {
      fontSize:isTablet?40:22,
      fontWeight: 'bold',
      color: 'red',
    },
  };

  const mergedTableStyles = {
    header: { ...defaultTableStyles.header, ...(tableStyles.header || {}) },
    headerText: { ...defaultTableStyles.headerText, ...(tableStyles.headerText || {}) },
    item: { ...defaultTableStyles.item, ...(tableStyles.item || {}) },
    itemText: { ...defaultTableStyles.itemText, ...(tableStyles.itemText || {}) },
    titleContainer: { ...defaultTableStyles.titleContainer, ...(tableStyles.titleContainer || {}) },
    titleText: { ...defaultTableStyles.titleText, ...(tableStyles.titleText || {}) },
    closeIcon: { ...defaultTableStyles.closeIcon, ...(tableStyles.closeIcon || {}) },
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (keyboardVisible) {
          Keyboard.dismiss();
          return;
        }
        let newHeight = SCREEN_HEIGHT - gestureState.moveY;
        if (newHeight < SCREEN_HEIGHT * 0.5) newHeight = SCREEN_HEIGHT * 0.5;
        if (newHeight > SCREEN_HEIGHT) newHeight = SCREEN_HEIGHT;
        animatedHeight.setValue(newHeight);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (keyboardVisible) return;
        
        const draggedUp = gestureState.dy < -50;
        const draggedDown = gestureState.dy > 50;
        const currentHeight = SCREEN_HEIGHT - gestureState.moveY;
      
        if (draggedUp) {
          Animated.timing(animatedHeight, {
            toValue: SCREEN_HEIGHT,
            duration: 200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
          }).start();
        } else if (draggedDown && currentHeight < SCREEN_HEIGHT * 0.6) {
          Animated.timing(animatedHeight, {
            toValue: 0,
            duration: 200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
          }).start(() => {
            onClose();
            if (onCustomClose) onCustomClose();
            if (clearSearch) clearSearch();
          });
        } else {
          Animated.timing(animatedHeight, {
            toValue: SCREEN_HEIGHT * 0.7,
            duration: 200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
          }).start();
        }
      }
    })
  ).current;

  useEffect(() => {
    if (visible) {
      setSearchText('');
      animatedHeight.setValue(0);
      Animated.timing(animatedHeight, {
        toValue: SCREEN_HEIGHT * 0.7,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start(() => {
       
      });
      resetAndFetch();
    }
  }, [visible]);
  
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      resetAndFetch();
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [searchText]);

  const resetAndFetch = async () => {
    setPage(1);
    setHasMore(true);
    const newData = await fetchFromAPI(1, searchText, true);
    setData(newData);
  };

  const fetchFromAPI = async (pg, text, reset = false) => {
    setLoading(true);
    const items = await fetchItems(pg, text);
    if (reset) {
      setData(items);
    } else {
      setData((prev) => [...prev, ...items]);
    }
    if (items.length < 20) {
      setHasMore(false);
    }
    setLoading(false);
    return items;
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFromAPI(nextPage, searchText);
    }
  };

  const handleClose = () => {
    Keyboard.dismiss();
    Animated.timing(animatedHeight, {
      toValue: 0,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start(() => {
      onClose();
      if (onCustomClose) onCustomClose();
      if (clearSearch) clearSearch();
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.item, mergedTableStyles.item]}
      onPress={() => {
        onSelect(item);
        onClose();
      }}
    >
      <View style={styles.itemContainer}>
        {displayFieldIndex.map((key, index) => {
          if (!item[key]) return null;
          let textStyle = styles.secondaryText;
  
          if (index === 0) textStyle = styles.primaryText;
          else if (index === 1) textStyle = styles.secondaryText;
          else textStyle = styles.tertiaryText;

          return (
            <Text key={key} style={textStyle}>
              {item[key]}
            </Text>
          );
        })}
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal 
      visible={visible} 
      animationType="fade" 
      transparent 
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        style={styles.overlay}
        onPress={handleClose}
      >
        
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <Animated.View
              style={[styles.modalContent, { height: animatedHeight }]}
              {...panResponder.panHandlers}
            >
              <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={isTablet ? 100 : 60}
            >
              <View style={styles.dragHandle}>
                <View style={styles.dragBar} />
              </View>

              <View style={[styles.titleContainer, mergedTableStyles.titleContainer]}>
                <View style={styles.titleRow}>  
                  <Text style={[styles.title, mergedTableStyles.titleText]}>{title}</Text>
                  <TouchableOpacity onPress={handleClose}>
                    <Text style={mergedTableStyles.closeIcon}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TextInput
                ref={searchInputRef}
                style={styles.searchInput}
                placeholder="Search..."
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={Keyboard.dismiss}
              />

              {headerNames && (
                <View style={[styles.header, mergedTableStyles.header]}>
                  {headerNames.map((header, index) => {
                    const width = columnWidths?.[header] || '50%';
                    return (
                      <View key={index} style={{ width }}>
                        <Text style={[styles.headerText, mergedTableStyles.headerText]}>
                          {header}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}

              <FlatList
                data={data}
                renderItem={renderItem}
                keyboardShouldPersistTaps="handled"
                keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                
                ListFooterComponent={loading && <ActivityIndicator style={{ margin: 10 }} />}
                ListEmptyComponent={
                  !loading && (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>No items found</Text>
                    </View>
                  )
                }
                
              />
               </KeyboardAvoidingView>
            </Animated.View>
                
          </TouchableWithoutFeedback>
   
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden',
       flex: 1,
  },
  dragHandle: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragBar: {
    width: 60,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ccc',
  },
  titleContainer: {
    justifyContent: 'space-around',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    margin: 10,
  },
  header: {
    borderTopLeftRadius: 10,
    borderTopEndRadius: 10,
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    margin: 10,
  },
  headerText: {
    fontSize: 20,
  },
  item: {
    padding: 3,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    marginLeft: 10,
    marginRight: 10
  },
  itemText: {
    fontSize: 16,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  itemContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderColor: '#eee',
  },
  primaryText: {
    fontSize: 16,
    color: '#000',
  },
  secondaryText: {
    fontSize: 12,
    color: '#999',
  },
  tertiaryText: {
    fontSize: 12,
    color: '#666',
  },
});

export default PopupListSelector;