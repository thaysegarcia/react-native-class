import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { clsx } from "clsx";
import dayjs from "dayjs";
import { icons } from "@/constants/icons";
import { posthog } from "@/lib/posthog";

export interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateSubscription: (subscription: Subscription) => void;
}

const CATEGORIES = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

type FrequencyType = "Monthly" | "Yearly";
const FREQUENCIES: FrequencyType[] = ["Monthly", "Yearly"];

const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: "#ffd6a5",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#f5c542",
  Productivity: "#b8e8d0",
  Cloud: "#caffbf",
  Music: "#9bf6ff",
  Other: "#e2e8f0",
};

const CreateSubscriptionModal = ({
  visible,
  onClose,
  onCreateSubscription,
}: CreateSubscriptionModalProps) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<FrequencyType>("Monthly");
  const [category, setCategory] = useState<string>("Entertainment");

  const normalizedPrice = price.trim();
  const parsedPrice = Number(normalizedPrice);
  const isValid =
    name.trim().length > 0 &&
    !/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(normalizedPrice) &&
    +Number.isFinite(parsedPrice) &&
    parsedPrice > 0;

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("Entertainment");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!isValid) return;

    const startDate = dayjs().toISOString();
    const renewalDate =
      frequency === "Yearly"
        ? dayjs().add(1, "year").toISOString()
        : dayjs().add(1, "month").toISOString();

    const newSubscription: Subscription = {
      id: `sub-${Date.now()}`,
      icon: icons.wallet,
      name: name.trim(),
      price: parsedPrice,
      currency: "USD",
      status: "active",
      category,
      billing: frequency,
      startDate,
      renewalDate,
      color: CATEGORY_COLORS[category] || "#e2e8f0",
    };

    onCreateSubscription(newSubscription);
    posthog?.capture("subscription_created", {
      subscription_name: name.trim(),
      subscription_price: parsedPrice,
      subscription_category: category,
      subscription_frequency: frequency,
    });

    handleClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <Pressable className="modal-overlay justify-end" onPress={handleClose}>
          <Pressable
            className="modal-container"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <View className="modal-header">
              <Text className="modal-title">New Subscription</Text>
              <TouchableOpacity
                className="modal-close"
                onPress={handleClose}
                accessibilityLabel="Close modal"
                accessibilityRole="button"
              >
                <Text className="modal-close-text">✕</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Form Body */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerClassName="modal-body"
            >
              {/* Name Field */}
              <View className="auth-field">
                <Text className="auth-label">Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Netflix, Spotify"
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                  className="auth-input"
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>

              {/* Price Field */}
              <View className="auth-field">
                <Text className="auth-label">Price</Text>
                <TextInput
                  value={price}
                  onChangeText={setPrice}
                  placeholder="0.00"
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                  className="auth-input"
                  keyboardType="decimal-pad"
                />
              </View>

              {/* Frequency Toggle */}
              <View className="auth-field">
                <Text className="auth-label">Frequency</Text>
                <View className="picker-row">
                  {FREQUENCIES.map((freq) => {
                    const isActive = frequency === freq;
                    return (
                      <TouchableOpacity
                        key={freq}
                        onPress={() => setFrequency(freq)}
                        className={clsx(
                          "picker-option",
                          isActive && "picker-option-active"
                        )}
                        accessibilityRole="button"
                      >
                        <Text
                          className={clsx(
                            "picker-option-text",
                            isActive && "picker-option-text-active"
                          )}
                        >
                          {freq}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Category Chips */}
              <View className="auth-field">
                <Text className="auth-label">Category</Text>
                <View className="category-scroll">
                  {CATEGORIES.map((cat) => {
                    const isActive = category === cat;
                    return (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => setCategory(cat)}
                        className={clsx(
                          "category-chip",
                          isActive && "category-chip-active"
                        )}
                        accessibilityRole="button"
                      >
                        <Text
                          className={clsx(
                            "category-chip-text",
                            isActive && "category-chip-text-active"
                          )}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!isValid}
                className={clsx(
                  "auth-button",
                  !isValid && "auth-button-disabled"
                )}
                accessibilityRole="button"
              >
                <Text className="auth-button-text">Add Subscription</Text>
              </TouchableOpacity>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateSubscriptionModal;
