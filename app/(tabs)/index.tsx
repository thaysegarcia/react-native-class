import "@/global.css";
import { useCallback, useState } from "react";
import { Alert, FlatList, Image, Text, View } from "react-native";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { useUser } from "@clerk/expo";
import images from "@/constants/images";
import {
  HOME_BALANCE,
  HOME_SUBSCRIPTIONS,
  HOME_USER,
  UPCOMING_SUBSCRIPTIONS,
} from "@/constants/data";
import { icons } from "@/constants/icons";
import { formatCurrency, formatSubscriptionDateTime } from "@/lib/utils";
import ListHeading from "@/components/ListHeading";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import SubscriptionCard from "@/components/SubscriptionCard";
import { posthog } from "@/lib/posthog";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const { user } = useUser();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setExpandedSubscriptionId(null);
      };
    }, [])
  );

  const userName =
    user?.fullName ||
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    HOME_USER.name;
  const avatarSource = user?.imageUrl ? { uri: user.imageUrl } : images.avatar;

  const handleModifyPlan = (subscription: Subscription) => {
    posthog?.capture("subscription_modify_plan_clicked", {
      subscription_id: subscription.id,
      subscription_name: subscription.name,
      current_plan: subscription.plan ?? null,
    });
    Alert.alert(
      "Modify Plan",
      `Would you like to change your plan for ${subscription.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Change Plan",
          onPress: () => {
            posthog?.capture("subscription_plan_change_confirmed", {
              subscription_id: subscription.id,
            });
            Alert.alert("Plan Update", "Plan change request submitted.");
          },
        },
      ]
    );
  };

  const handleModifyCard = (subscription: Subscription) => {
    posthog?.capture("subscription_modify_card_clicked", {
      subscription_id: subscription.id,
      subscription_name: subscription.name,
      payment_method: subscription.paymentMethod ?? null,
    });
    Alert.alert(
      "Modify Payment Method",
      `Update payment details for ${subscription.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Update Card",
          onPress: () => {
            posthog?.capture("subscription_card_change_confirmed", {
              subscription_id: subscription.id,
            });
            Alert.alert("Payment Update", "Payment details update opened.");
          },
        },
      ]
    );
  };

  const handleCancelSubscription = (subscription: Subscription) => {
    posthog?.capture("subscription_cancelled_clicked", {
      subscription_id: subscription.id,
      subscription_name: subscription.name,
    });
    Alert.alert(
      "Cancel Subscription",
      `Are you sure you want to cancel your ${subscription.name} subscription?`,
      [
        { text: "Keep Subscription", style: "cancel" },
        {
          text: "Confirm Cancellation",
          style: "destructive",
          onPress: () => {
            posthog?.capture("subscription_cancellation_confirmed", {
              subscription_id: subscription.id,
              subscription_name: subscription.name,
            });
            Alert.alert(
              "Subscription Cancelled",
              `Your ${subscription.name} subscription has been cancelled.`
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5 pb-5">
      <FlatList
        ListHeaderComponent={
          <>
            {/*Header*/}
            <View className="home-header">
              <View className="home-user">
                <Image source={avatarSource} className="home-avatar" />
                <Text className="home-user-name">{userName}</Text>
              </View>
              <Image source={icons.add} className="home-add-icon" />
            </View>

            {/*Balance Card*/}
            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>
              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date">
                  {formatSubscriptionDateTime(HOME_BALANCE.nextRenewalDate)}
                </Text>
              </View>
            </View>

            {/*Upcoming Subscription Cards*/}
            <View className="mb-5">
              <ListHeading title="Upcoming" />
              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <UpcomingSubscriptionCard {...item} />
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <Text className="home-empty-state">
                    No upcoming renewals yet.
                  </Text>
                }
              />
            </View>

            {/*All Subscriptions Cards*/}
            <ListHeading title="All Subscriptions" />
          </>
        }
        data={HOME_SUBSCRIPTIONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => {
              const isExpanded = expandedSubscriptionId === item.id;
              posthog?.capture("subscription_details_toggled", {
                expanded: !isExpanded,
                billing_frequency: item.billing,
                category: item.category ?? null,
              });
              setExpandedSubscriptionId(isExpanded ? null : item.id);
            }}
            onModifyPlan={() => handleModifyPlan(item)}
            onModifyCard={() => handleModifyCard(item)}
            onCancelPress={() => handleCancelSubscription(item)}
          />
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="home-empty-state">No subscriptions yet.</Text>
        }
        contentContainerClassName="pb-30"
      />
    </SafeAreaView>
  );
}
