import "@/global.css";
import { Text } from "react-native";
import { Link } from "expo-router";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-xl font-bold text-success">
        Welcome to Nativewind!
      </Text>

      <Link href="/(auth)/sign-in">Go to Sign In</Link>
      <Link href="/(auth)/sign-on">Go to Sign On</Link>

      <Link
        href={{
          pathname: "/subscriptions/[id]",
          params: { id: "spotify" },
        }}
      >
        Spotify Subscription
      </Link>
    </SafeAreaView>
  );
}
