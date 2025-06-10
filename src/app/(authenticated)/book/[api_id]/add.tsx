// src/app/book/[id]/index.tsx
import AddToLibraryDetails from "@/components/AddToLibraryDetails";
import { Loader } from "@/components/Loader";
import { useGetBookData } from "@/hooks/useBooks";
import { BookAndUserBookInsert } from "@/types/book";
import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BookDetailScreen() {
    const { api_id } = useLocalSearchParams<{ api_id: string }>();
    const { data: bookDetails, isLoading: isLoadingBook } = useGetBookData(
        api_id as string
    );
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    if (isLoadingBook || !bookDetails) {
        return <Loader />;
    }

    const handleAddToLibrary = (data: BookAndUserBookInsert) => {
        console.log(data);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen
                options={{
                    title: "Add To Library",
                }}
            />
            <AddToLibraryDetails
                book={bookDetails}
                onAddToLibrary={handleAddToLibrary}
                saving={saving}
                saved={saved}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
});
