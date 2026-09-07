import { useClerk, useUser } from "@clerk/expo";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import images from "@/constants/images";
import { posthog } from "@/lib/posthog";
import { useSubscriptionStore } from "@/lib/subscriptionStore";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [signingOut, setSigningOut] = useState(false);

  const name =
    user?.fullName ||
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "User";
  const email = user?.primaryEmailAddress?.emailAddress || "Not provided";
  const avatarSource = user?.imageUrl ? { uri: user.imageUrl } : images.avatar;
  const createdAt = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : "Recently";

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await signOut();
      posthog?.capture("sign_out_completed");
      posthog?.reset();
      useSubscriptionStore.getState().resetSubscriptions();
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-10"
      >
        <View className="mb-4">
          <Text className="text-2xl font-sans-bold text-primary">Settings</Text>
        </View>

        {/* User Profile Card */}
        <View className="sub-card mt-2 p-5">
          <View className="flex-row items-center gap-4">
            <Image source={avatarSource} className="size-16 rounded-full" />
            <View className="flex-1">
              <Text className="text-xl font-sans-bold text-primary">
                {name}
              </Text>
              <Text className="text-sm font-sans-medium text-muted-foreground">
                {email}
              </Text>
            </View>
          </View>

          <View className="mt-5 gap-3 border-t border-border pt-4">
            <View className="sub-row">
              <Text className="sub-label">Email</Text>
              <Text className="sub-value text-right" numberOfLines={1}>
                {email}
              </Text>
            </View>
            <View className="sub-row">
              <Text className="sub-label">Member Since</Text>
              <Text className="sub-value text-right">{createdAt}</Text>
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <Pressable
          className={`sub-cancel mt-8 ${signingOut ? "sub-cancel-disabled" : ""}`}
          onPress={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="sub-cancel-text">Sign Out</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;
