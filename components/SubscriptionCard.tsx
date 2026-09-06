import { View, Text, Image, Pressable, TouchableOpacity } from "react-native";
import React from "react";
import {
  formatCurrency,
  formatStatusLabel,
  formatSubscriptionDateTime,
} from "@/lib/utils";
import { clsx } from "clsx";

const SubscriptionCard = ({
  name,
  price,
  currency,
  icon,
  billing,
  color,
  category,
  plan,
  startDate,
  renewalDate,
  expanded,
  onPress,
  paymentMethod,
  status,
  onModifyPlan,
  onModifyCard,
  onCancelPress,
  isCancelling,
}: SubscriptionCardProps) => {
  const fallback = "Not provided";
  return (
    <Pressable
      onPress={onPress}
      className={clsx("sub-card", expanded ? "sub-card-expanded" : "bg-card")}
      style={!expanded && color ? { backgroundColor: color } : undefined}
    >
      <View className="sub-head">
        <View className="sub-main">
          <Image source={icon} className="sub-icon" />
          <View className="sub-copy">
            <Text numberOfLines={1} className="sub-title">
              {name}
            </Text>
            <Text numberOfLines={1} ellipsizeMode="tail" className="sub-meta">
              {category?.trim() ||
                plan?.trim() ||
                (renewalDate ? formatSubscriptionDateTime(renewalDate) : "")}
            </Text>
          </View>
        </View>
        <View className="sub-price-box">
          <Text className="sub-price">{formatCurrency(price, currency)}</Text>
          <Text className="sub-billing">{billing}</Text>
        </View>
      </View>

      {expanded && (
        <View className="sub-body">
          <View className="sub-details">
            {/* Plan Row */}
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Plan:</Text>
                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {plan?.trim() ?? fallback}
                </Text>
              </View>
              {onModifyPlan && (
                <TouchableOpacity
                  onPress={onModifyPlan}
                  className="rounded-full border border-primary px-3 py-1"
                  accessibilityRole="button"
                  accessibilityLabel="Modify Plan"
                >
                  <Text className="text-xs font-sans-semibold text-primary">
                    Modify
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Card / Payment Row */}
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Card:</Text>
                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {paymentMethod?.trim() ?? fallback}
                </Text>
              </View>
              {onModifyCard && (
                <TouchableOpacity
                  onPress={onModifyCard}
                  className="rounded-full border border-primary px-3 py-1"
                  accessibilityRole="button"
                  accessibilityLabel="Modify Card"
                >
                  <Text className="text-xs font-sans-semibold text-primary">
                    Modify
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Category Row */}
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Category:</Text>
                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {category?.trim() ?? fallback}
                </Text>
              </View>
            </View>

            {/* Started Row */}
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Started:</Text>
                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {startDate ? formatSubscriptionDateTime(startDate) : fallback}
                </Text>
              </View>
            </View>

            {/* Renewal Date Row */}
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Renewal Date:</Text>
                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {renewalDate
                    ? formatSubscriptionDateTime(renewalDate)
                    : fallback}
                </Text>
              </View>
            </View>

            {/* Status Row */}
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Status:</Text>
                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {status ? formatStatusLabel(status) : fallback}
                </Text>
              </View>
            </View>
          </View>

          {/* Cancel Subscription Button */}
          {onCancelPress && (
            <TouchableOpacity
              onPress={onCancelPress}
              disabled={isCancelling}
              className={clsx(
                "sub-cancel",
                isCancelling && "sub-cancel-disabled"
              )}
              accessibilityRole="button"
              accessibilityLabel="Cancel Subscription"
            >
              <Text className="sub-cancel-text">
                {isCancelling ? "Cancelling..." : "Cancel Subscription"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Pressable>
  );
};
export default SubscriptionCard;
