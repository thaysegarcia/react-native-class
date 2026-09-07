import "@/global.css";
import { useCallback, useState } from "react";
import { Alert, FlatList, Image, Pressable, Text, View } from "react-native";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { useUser } from "@clerk/expo";
import images from "@/constants/images";
import {
  HOME_BALANCE,
  HOME_USER,
  UPCOMING_SUBSCRIPTIONS,
} from "@/constants/data";
import { icons } from "@/constants/icons";
import { formatCurrency, formatSubscriptionDateTime } from "@/lib/utils";
import ListHeading from "@/components/ListHeading";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import SubscriptionCard from "@/components/SubscriptionCard";
import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import { useSubscriptionStore } from "@/lib/subscriptionStore";
import { usePostHog } from "posthog-react-native";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const { user } = useUser();
  const posthog = usePostHog();
  const { subscriptions, addSubscription, setSubscriptions } =
    useSubscriptionStore();
  const [cancellingSubscriptionId, setCancellingSubscriptionId] = useState<
    string | null
  >(null);
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

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

  const handleCreateSubscription = (newSubscription: Subscription) => {
    addSubscription(newSubscription);
    posthog.capture("subscription_created", {
      subscription_frequency: newSubscription.billing,
      subscription_name: newSubscription.name,
      subscription_price: newSubscription.price,
    });
  };

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
            setCancellingSubscriptionId(subscription.id);

            setSubscriptions(
              subscriptions.map((item) =>
                item.id === subscription.id
                  ? { ...item, status: "cancelled" }
                  : item
              )
            );

            setCancellingSubscriptionId(null);
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
              <Pressable
                onPress={() => setIsCreateModalVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="Add subscription"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Image source={icons.add} className="home-add-icon" />
              </Pressable>
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
        data={subscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            isCancelling={cancellingSubscriptionId === item.id}
            onPress={() => {
              const isExpanded = expandedSubscriptionId === item.id;
              posthog?.capture("subscription_details_toggled", {
                subscription_id: item.id,
                subscription_name: item.name,
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
      <CreateSubscriptionModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onCreateSubscription={handleCreateSubscription}
      />
    </SafeAreaView>
  );
}
