import { useAuth, useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function SignUpScreen() {
  const { isLoaded } = useAuth();
  const { signUp } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    if (!emailAddress.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: signUpError } = await signUp.password({
        emailAddress: emailAddress.trim(),
        password,
      });

      if (signUpError) {
        setError(signUpError.message || "Failed to sign up.");
        return;
      }

      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) {
        setError(sendError.message || "Failed to send verification code.");
        return;
      }

      setIsVerifying(true);
    } catch (err: any) {
      const errorMsg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        err?.message ||
        "Failed to sign up. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    if (!code.trim()) {
      setError("Please enter the verification code.");
      return;
    }

    setLoading(true);
    setError("");
    setResendMessage("");

    try {
      const { error: verifyError } = await signUp.verifications.verifyEmailCode({
        code: code.trim(),
      });

      if (verifyError) {
        setError(verifyError.message || "Invalid verification code.");
        return;
      }

      const { error: finalizeError } = await signUp.finalize();
      if (finalizeError) {
        setError(finalizeError.message || "Failed to finalize session.");
        return;
      }

      router.replace("/(tabs)");
    } catch (err: any) {
      const errorMsg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        err?.message ||
        "Verification failed. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const onResendCode = async () => {
    if (!isLoaded || resending) return;
    setResending(true);
    setError("");
    setResendMessage("");

    try {
      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) {
        setError(sendError.message || "Failed to resend code.");
      } else {
        setResendMessage("Verification code resent to your email.");
      }
    } catch (err: any) {
      setError("Failed to resend verification code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="auth-scroll"
          contentContainerClassName="auth-content"
          keyboardShouldPersistTaps="handled"
        >
          <View className="auth-brand-block">
            <View className="auth-logo-wrap">
              <View className="auth-logo-mark">
                <Text className="auth-logo-mark-text">S</Text>
              </View>
              <View>
                <Text className="auth-wordmark">Subscribed</Text>
                <Text className="auth-wordmark-sub">Subscription Tracker</Text>
              </View>
            </View>
            <Text className="auth-title">
              {isVerifying ? "Verify Email" : "Create Account"}
            </Text>
            <Text className="auth-subtitle">
              {isVerifying
                ? `Enter the verification code sent to ${emailAddress}`
                : "Start tracking and optimizing all your recurring subscriptions."}
            </Text>
          </View>

          <View className="auth-card">
            {isVerifying ? (
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Verification Code</Text>
                  <TextInput
                    className={`auth-input ${error ? "auth-input-error" : ""}`}
                    keyboardType="numeric"
                    placeholder="Enter verification code"
                    placeholderTextColor="#9ca3af"
                    value={code}
                    onChangeText={(text) => {
                      setCode(text);
                      if (error) setError("");
                    }}
                    editable={!loading}
                  />
                </View>

                {error ? <Text className="auth-error">{error}</Text> : null}
                {resendMessage ? (
                  <Text className="auth-helper text-center">{resendMessage}</Text>
                ) : null}

                <Pressable
                  className={`auth-button ${loading ? "auth-button-disabled" : ""}`}
                  onPress={onVerifyPress}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#0f172a" />
                  ) : (
                    <Text className="auth-button-text">Verify & Continue</Text>
                  )}
                </Pressable>

                <Pressable
                  className="auth-secondary-button"
                  onPress={onResendCode}
                  disabled={resending || loading}
                >
                  {resending ? (
                    <ActivityIndicator size="small" color="#22c55e" />
                  ) : (
                    <Text className="auth-secondary-button-text">
                      Resend Code
                    </Text>
                  )}
                </Pressable>

                <Pressable
                  className="mt-2 items-center"
                  onPress={() => {
                    setIsVerifying(false);
                    setError("");
                    setResendMessage("");
                  }}
                  disabled={loading}
                >
                  <Text className="auth-link">Back to Sign Up</Text>
                </Pressable>
              </View>
            ) : (
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Email address</Text>
                  <TextInput
                    className={`auth-input ${error ? "auth-input-error" : ""}`}
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    placeholder="name@example.com"
                    placeholderTextColor="#9ca3af"
                    value={emailAddress}
                    onChangeText={(text) => {
                      setEmailAddress(text);
                      if (error) setError("");
                    }}
                    editable={!loading}
                  />
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Password</Text>
                  <TextInput
                    className={`auth-input ${error ? "auth-input-error" : ""}`}
                    secureTextEntry
                    autoCapitalize="none"
                    placeholder="Create a strong password"
                    placeholderTextColor="#9ca3af"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (error) setError("");
                    }}
                    editable={!loading}
                  />
                </View>

                {error ? <Text className="auth-error">{error}</Text> : null}

                <Pressable
                  className={`auth-button ${loading ? "auth-button-disabled" : ""}`}
                  onPress={onSignUpPress}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#0f172a" />
                  ) : (
                    <Text className="auth-button-text">Sign Up</Text>
                  )}
                </Pressable>

                <View nativeID="clerk-captcha" />
              </View>
            )}

            {!isVerifying && (
              <View className="auth-link-row">
                <Text className="auth-link-copy">Already have an account?</Text>
                <Link href="/(auth)/sign-in" asChild>
                  <Pressable disabled={loading}>
                    <Text className="auth-link">Sign in</Text>
                  </Pressable>
                </Link>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
