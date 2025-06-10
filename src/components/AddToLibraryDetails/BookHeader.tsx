import { BookInsert } from "@/types/book";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const formatAuthorName = (author: string | { name: string }) => {
    let name = "";
    if (typeof author === "string") {
        name = author;
    } else if (typeof author === "object" && author.name) {
        name = author.name;
    }
    return name.replace(/\s+/g, " ").trim();
};

type BookCoverProps = {
    imageUrl: string;
};

const BookCover: React.FC<BookCoverProps> = ({ imageUrl }) => (
    <View style={styles.bookCover}>
        <Image
            source={{ uri: imageUrl }}
            style={styles.coverImage}
            resizeMode="cover"
        />
    </View>
);

type StarRatingProps = {
    rating: number;
    sizeMultiplier?: number;
};

export const StarRating: React.FC<StarRatingProps> = ({
    rating,
    sizeMultiplier = 1,
}) => (
    <View style={styles.starContainer}>
        {[...Array(Math.floor(rating))].map((_, i) => (
            <Ionicons
                key={i}
                name="star"
                size={14 * sizeMultiplier}
                color="#8C6A5B"
            />
        ))}
        {rating % 1 > 0 && (
            <Ionicons name="star-half" size={14 * sizeMultiplier} color="#8C6A5B" />
        )}
        {[...Array(5 - Math.ceil(rating))].map((_, i) => (
            <Ionicons
                key={i + Math.ceil(rating)}
                name="star-outline"
                size={14 * sizeMultiplier}
                color="#8C6A5B"
            />
        ))}
    </View>
);

type BookHeaderProps = {
    book?: BookInsert;
};

// TODO: make all items in book header clickable

const BookHeader: React.FC<BookHeaderProps> = ({ book }) => {
    if (!book) return null;
    const [authorsExpanded, setAuthorsExpanded] = useState(false);

    const {
        title,
        cover_image_url,
        rating,
        metadata,
        genres,
        total_pages,
        publication_date,
    } = book;
    // @ts-ignore
    let { authors, rating_count } = metadata || {};
    authors = authors ?? [];

    const toggleAuthorsExpanded = () => setAuthorsExpanded(!authorsExpanded);
    const displayedAuthors = authorsExpanded ? authors : authors.slice(0, 2);
    const shouldShowToggle = authors.length > 2;

    return (
        <View style={styles.headerContainer}>
            <TouchableOpacity
                style={styles.coverContainer}
                onPress={() => router.push(`/book/${book.api_id}/show`)}
            >
                <BookCover imageUrl={cover_image_url || ""} />
            </TouchableOpacity>

            <View style={styles.contentContainer}>
                <Text style={styles.title}>{title}</Text>

                <View style={styles.authorsContainer}>
                    {displayedAuthors.map(formatAuthorName).map((name: string) => (
                        <Text style={styles.authorName} key={name}>
                            {name}
                        </Text>
                    ))}

                    {shouldShowToggle && (
                        <Text style={styles.toggleText} onPress={toggleAuthorsExpanded}>
                            {authorsExpanded ? "Show less" : "Show more"}
                        </Text>
                    )}
                </View>

                <View style={styles.ratingContainer}>
                    {rating && <StarRating rating={rating} />}
                    <Text style={styles.ratingText}>
                        {rating} ({rating_count?.toLocaleString()} ratings)
                    </Text>
                </View>

                <Text style={styles.genresText}>
                    {genres?.slice(0, 2).join(" • ")} • {total_pages} pages
                </Text>

                {publication_date && (
                    <Text style={styles.publicationText}>
                        Published{" "}
                        {new Date(publication_date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        gap: 16,
        marginBottom: 24,
    },
    coverContainer: {
        flexShrink: 0,
    },
    bookCover: {
        width: 96, // w-24 = 96px
        height: 144, // h-36 = 144px
        borderRadius: 6,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    coverImage: {
        width: "100%",
        height: "100%",
    },
    starContainer: {
        flexDirection: "row",
    },
    contentContainer: {
        flex: 1,
        paddingLeft: 8,
    },
    title: {
        fontWeight: "bold",
        fontSize: 18,
        color: "#000",
        marginBottom: 4,
    },
    authorsContainer: {
        flexDirection: "column",
        marginBottom: 8,
    },
    authorName: {
        color: "#6B7280", // text-gray-600
        fontSize: 14,
    },
    toggleText: {
        color: "#D1D5DB", // text-gray-300
        fontSize: 12,
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    ratingText: {
        fontSize: 12,
        color: "#6B7280", // text-gray-500
        marginLeft: 4,
    },
    genresText: {
        fontSize: 12,
        color: "#6B7280", // text-gray-500
        marginBottom: 4,
    },
    publicationText: {
        fontSize: 12,
        color: "#6B7280", // text-gray-500
    },
});

export default BookHeader;
