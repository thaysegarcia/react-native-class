import "@/global.css";
import { Text } from "react-native";
import { Link } from "expo-router";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-5xl font-sans-extrabold">Home</Text>

      <Link
        href="/(auth)/sign-in"
        className="mt-4 font-sans-bold rounded bg-primary text-white p-4"
      >
        Go to Sign In
      </Link>
      <Link
        href="/(auth)/sign-on"
        className="mt-4 font-sans-bold rounded bg-primary text-white p-4"
      >
        Go to Sign On
      </Link>
    </SafeAreaView>
  );
}
