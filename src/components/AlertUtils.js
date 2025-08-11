import { Alert } from "react-native";

export const showConfirmation = (message, onConfirm) => {
  Alert.alert(
    "Confirmation",
    message,
    [
      {
        text: "No", 
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: () => onConfirm && onConfirm(),
      },
    ],
    { cancelable: true } 
  );
};
