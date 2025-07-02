import { Loader } from "@/components/shared/Loader";
import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Slot } from "expo-router";

export default function AuthLayout() {
    const { isLoaded, isSignedIn } = useAuth();

    if (!isLoaded) { 
        // If Clerk is still loading, show a loader
        return <Loader />;
    }
    if (isSignedIn) {
        // If the user is signed in, redirect them to the home screen
        return <Redirect href="/" />;
    }
  return (
    <Slot />
  );
}