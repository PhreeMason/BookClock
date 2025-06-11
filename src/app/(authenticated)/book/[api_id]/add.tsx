// src/app/book/[id]/index.tsx
import AddToLibraryDetails from "@/components/AddToLibraryDetails";
import { Loader } from "@/components/Loader";
import { useGetBookData } from "@/hooks/useBooks";
import { BookAndUserBookInsert } from "@/types/book";
import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const sampleFormData = {
    api_id: "10127019-the-lean-startup",
    api_source: "goodreads",
    cover_image_url:
        "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1629999184i/10127019.jpg",
    currentHours: 4,
    currentMinutes: 15,
    currentPage: 0,
    currentPercentage: 49,
    description:
        '<b>Most startups fail. But many of those failures are preventable. The Lean Startup is a new approach being adopted across the globe, changing the way companies are built and new products are launched. <br /></b><br />Eric Ries defines a startup as <b>an organization dedicated to creating something new under conditions of extreme uncertainty</b>. This is just as true for one person in a garage or a group of seasoned professionals in a Fortune 500 boardroom. What they have in common is a mission to penetrate that fog of uncertainty to discover a successful path to a sustainable business.<br /><br /><br /><br />The Lean Startup approach fosters companies that are both more capital efficient and that leverage human creativity more effectively. Inspired by lessons from lean manufacturing, it relies on "validated learning," rapid scientific experimentation, as well as a number of counter-intuitive practices that shorten product development cycles, measure actual progress without resorting to vanity metrics, and learn what customers really want. It enables a company to shift directions with agility, altering plans inch by inch, minute by minute.<br /><br />Rather than wasting time creating elaborate business plans, <i>The Lean Startup</i> offers entrepreneurs - in companies of all sizes - a way to test their vision continuously, to adapt and adjust before it\'s too late. Ries provides a scientific approach to creating and managing successful startups in a age when companies need to innovate more than ever.',
    edition: null,
    format: ["audio", "ebook"],
    genres: [
        "Business",
        "Nonfiction",
        "Entrepreneurship",
        "Management",
        "Leadership",
        "Self Help",
    ],
    has_user_edits: false,
    hours: 8,
    isbn10: null,
    isbn13: "9780307887894",
    language: "English",
    metadata: {
        authors: ["Eric Ries"],
        extraction_method: "schema",
        rating_count: 353670,
        review_count: 4905,
    },
    minutes: 39,
    note: "Main take away so far is to validate everything against customer behavior.",
    publication_date: "2011-01-01T00:00:00.000Z",
    publisher: null,
    rating: 4.11,
    source: "goodreads",
    startDate: "2025-06-04T17:03:00.000Z",
    start_date: "2025-06-04T17:03:00.000Z",
    status: "current",
    targetDate: "2025-06-30T17:03:00.000Z",
    target_completion_date: "2025-06-30T17:03:00.000Z",
    title: "The Lean Startup",
    totalPage: 299,
    total_duration: null,
    total_pages: 299,
};

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
