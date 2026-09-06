import "@/global.css";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { clsx } from "clsx";
import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import SubscriptionCard from "@/components/SubscriptionCard";
import SearchInput from "@/components/SearchInput";
import { posthog } from "@/lib/posthog";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
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

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(
        HOME_SUBSCRIPTIONS.map((item) => item.category).filter(
          (c): c is string => Boolean(c)
        )
      )
    );
    return ["All", ...unique];
  }, []);

  const filteredSubscriptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return HOME_SUBSCRIPTIONS.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!query) return true;
      const nameMatch = item.name.toLowerCase().includes(query);
      const categoryMatch =
        item.category?.toLowerCase().includes(query) ?? false;
      const planMatch = item.plan?.toLowerCase().includes(query) ?? false;
      return nameMatch || categoryMatch || planMatch;
    });
  }, [searchQuery, selectedCategory]);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (text.trim().length > 0) {
      posthog?.capture("subscription_searched", {
        query: text.trim(),
      });
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    posthog?.capture("subscription_category_filtered", {
      category,
    });
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
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
            Alert.alert(
              "Subscription Cancelled",
              `Your ${subscription.name} subscription has been cancelled.`
            );
          },
        },
      ]
    );
  };

  const isFiltering = searchQuery.trim().length > 0 || selectedCategory !== "All";

  return (
    <SafeAreaView className="flex-1 bg-background p-5 pb-5">
      <FlatList
        ListHeaderComponent={
          <View className="mb-4">
            {/* Screen Header */}
            <View className="mb-4 flex-row items-center justify-between">
              <View>
                <Text className="text-3xl font-sans-bold text-primary">
                  Subscriptions
                </Text>
                <Text className="text-sm font-sans-medium text-muted-foreground mt-1">
                  {filteredSubscriptions.length}{" "}
                  {filteredSubscriptions.length === 1
                    ? "subscription"
                    : "subscriptions"}
                </Text>
              </View>
            </View>

            {/* Search Input */}
            <SearchInput
              value={searchQuery}
              onChangeText={handleSearchChange}
              onClear={() => handleSearchChange("")}
              placeholder="Search subscriptions..."
              className="mb-3"
            />

            {/* Category Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="flex-row gap-2 py-1"
            >
              {categories.map((category) => {
                const isActive = selectedCategory === category;
                return (
                  <TouchableOpacity
                    key={category}
                    onPress={() => handleCategorySelect(category)}
                    className={clsx(
                      "category-chip",
                      isActive && "category-chip-active"
                    )}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                  >
                    <Text
                      className={clsx(
                        "category-chip-text",
                        isActive && "category-chip-text-active"
                      )}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        }
        data={filteredSubscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
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
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerClassName="pb-30"
        ListEmptyComponent={
          <View className="items-center justify-center py-12 px-4">
            <View className="size-16 items-center justify-center rounded-full bg-muted mb-4">
              <Ionicons
                name="search-outline"
                size={28}
                color="rgba(8, 17, 38, 0.4)"
              />
            </View>
            <Text className="text-lg font-sans-bold text-primary text-center">
              {searchQuery.trim().length > 0
                ? `No subscriptions found for "${searchQuery.trim()}"`
                : selectedCategory !== "All"
                  ? `No subscriptions in "${selectedCategory}"`
                  : "No subscriptions found"}
            </Text>
            <Text className="text-sm font-sans-medium text-muted-foreground text-center mt-1 mb-5">
              Try adjusting your search terms or selecting a different category.
            </Text>
            {isFiltering && (
              <TouchableOpacity
                onPress={handleResetFilters}
                className="rounded-full border border-accent/30 bg-accent/10 px-5 py-2.5"
                accessibilityRole="button"
                accessibilityLabel="Reset filters"
              >
                <Text className="text-sm font-sans-semibold text-accent">
                  Reset filters
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default Subscriptions;
