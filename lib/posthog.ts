import Constants from "expo-constants";
import PostHog from "posthog-react-native";

const projectToken = Constants.expoConfig?.extra?.posthogProjectToken as
  | string
  | undefined;
const host = Constants.expoConfig?.extra?.posthogHost as string | undefined;

export const isPostHogConfigured =
  typeof projectToken === "string" && typeof host === "string";

function createPostHog() {
  if (typeof projectToken !== "string" || typeof host !== "string") {
    if (__DEV__) {
      const missingVariable =
        typeof projectToken !== "string"
          ? "POSTHOG_PROJECT_TOKEN"
          : "POSTHOG_HOST";

      throw new Error(
        `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
      );
    }

    return undefined;
  }

  return new PostHog(projectToken, {
    host,
    errorTracking: {
      autocapture: {
        uncaughtExceptions: true,
        unhandledRejections: true,
        console: false,
      },
    },
  });
}

export const posthog = createPostHog();
