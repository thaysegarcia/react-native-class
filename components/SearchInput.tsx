import React from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { clsx } from "clsx";

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
}

const SearchInput = ({
  value,
  onChangeText,
  onClear,
  placeholder = "Search subscriptions...",
  className,
}: SearchInputProps) => {
  return (
    <View
      className={clsx(
        "flex-row items-center rounded-2xl border border-border bg-card px-4 py-3 gap-3",
        className
      )}
    >
      <Ionicons name="search-outline" size={20} color="rgba(8, 17, 38, 0.5)" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(0, 0, 0, 0.4)"
        className="flex-1 font-sans-medium text-base text-primary py-0"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="never"
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={onClear || (() => onChangeText(""))}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Clear search"
          accessibilityRole="button"
        >
          <Ionicons
            name="close-circle"
            size={18}
            color="rgba(8, 17, 38, 0.4)"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchInput;
