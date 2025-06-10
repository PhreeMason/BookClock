import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type FormatSelectorProps = {
    formats: string[];
    setFormats: (format: string[]) => void;
}

const FormatSelector: React.FC<FormatSelectorProps> = ({ formats, setFormats }) => {
    const toggleFormat = (format: string) => {
        if (formats.includes(format)) {
            // Remove format if already selected (but don't allow removing all formats)
            if (formats.length > 1) {
                setFormats(formats.filter(f => f !== format));
            }
        } else {
            // Add format if not already selected
            setFormats([...formats, format]);
        }
    };
    return (
        <View>
            <Text style={styles.label}>Format *</Text>
            <View style={styles.container}>
                <TouchableOpacity
                    style={[
                        styles.formatButton,
                        formats.includes('physical') ? styles.formatButtonSelected : styles.formatButtonUnselected
                    ]}
                    onPress={() => toggleFormat('physical')}
                >
                    <View style={styles.formatContent}>
                        <Ionicons name="book-outline" size={16} color="#8C6A5B" style={styles.icon} />
                        <Text style={styles.formatText}>Physical</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.formatButton,
                        formats.includes('ebook') ? styles.formatButtonSelected : styles.formatButtonUnselected
                    ]}
                    onPress={() => toggleFormat('ebook')}
                >
                    <View style={styles.formatContent}>
                        <Ionicons name="tablet-portrait-outline" size={16} color="#8C6A5B" style={styles.icon} />
                        <Text style={styles.formatText}>E-Book</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.formatButton,
                        formats.includes('audio') ? styles.formatButtonSelected : styles.formatButtonUnselected
                    ]}
                    onPress={() => toggleFormat('audio')}
                >
                    <View style={styles.formatContent}>
                        <Ionicons name="headset-outline" size={16} color="#8C6A5B" style={styles.icon} />
                        <Text style={styles.formatText}>Audio</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
    },
    container: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 4,
    },
    formatButton: {
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 8,
        flex: 1,
    },
    formatButtonSelected: {
        backgroundColor: '#e5e7eb',
        borderColor: '#9ca3af',
    },
    formatButtonUnselected: {
        backgroundColor: '#ffffff',
        borderColor: '#d1d5db',
    },
    formatContent: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    icon: {
        marginBottom: 4,
    },
    formatText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default FormatSelector;