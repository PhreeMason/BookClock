import { BookInsert } from '@/types/book';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import HTML from 'react-native-render-html';

const BookDescription = ({ book }: { book: BookInsert }) => {
    const [expanded, setExpanded] = useState(false);
    const { width } = useWindowDimensions();


    const text = book.description
    // Memoize the HTML component to prevent re-renders when other state changes
    const htmlContent = useMemo(() => {
        if (!text) {
            return null;
        }
        const content = expanded ? text : text.substring(0, 150) + '...';
        return (
            <HTML
                source={{ html: content }}
                contentWidth={width - 48}
                tagsStyles={{
                    p: { fontSize: 14, color: '#374151', lineHeight: 20 },
                    i: { fontStyle: 'italic' },
                    br: { height: 12 }
                }}
            />
        );
    }, [expanded, width, text]);

    if (!book.description) {
        return null;
    }


    return (
        <View style={styles.container}>
            {htmlContent}
            <TouchableOpacity onPress={() => setExpanded(!expanded)}>
                <Text style={styles.readMoreText}>
                    {expanded ? 'Read less' : 'Read more'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    readMoreText: {
        fontSize: 14,
        fontWeight: '600',
        textDecorationLine: 'underline',
        color: '#1f2937',
        marginTop: 4,
    },
});

export default BookDescription;