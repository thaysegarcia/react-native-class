import { View, Text } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";

const SubscriptionsDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View>
      <Text>Subscriptions Details: {id}</Text>
    </View>
  );
};
export default SubscriptionsDetails;
