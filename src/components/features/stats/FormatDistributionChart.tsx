import { ThemedText, ThemedView } from '@/components/themed';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useDeadlines } from '@/contexts/DeadlineProvider';
import { useTheme } from '@/theme';
import { Database } from '@/types/supabase';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

type BookFormat = Database['public']['Enums']['book_format_enum'];

interface FormatData {
    format: BookFormat;
    count: number;
    color: string;
    icon: string;
    label: string;
}

const FormatDistributionChart: React.FC = () => {
    const { theme } = useTheme();
    const { activeDeadlines, isLoading } = useDeadlines();

    // Data validation - need at least 1 active deadline
    if (isLoading) {
        return (
            <ThemedView backgroundColor="card" borderColor="border" style={styles.container}>
                <View style={styles.header}>
                    <IconSymbol name="chart.bar.fill" size={24} color={theme.primary} />
                    <ThemedText type="semiBold" style={styles.title}>
                        Format Distribution
                    </ThemedText>
                </View>
                <ThemedText color="textMuted" style={styles.loadingText}>
                    Loading...
                </ThemedText>
            </ThemedView>
        );
    }

    if (!activeDeadlines?.length) {
        return null; // Don't show if no data
    }

    // Count books by format
    const formatCounts = activeDeadlines.reduce((acc, deadline) => {
        acc[deadline.format] = (acc[deadline.format] || 0) + 1;
        return acc;
    }, {} as Record<BookFormat, number>);

    // Define format configurations
    const formatConfigs: Record<BookFormat, { color: string; icon: string; label: string }> = {
        physical: {
            color: theme.primary,
            icon: 'books.vertical',
            label: 'Physical'
        },
        ebook: {
            color: theme.accent,
            icon: 'rectangle.portrait.and.arrow.right',
            label: 'E-book'
        },
        audio: {
            color: theme.success,
            icon: 'bell.fill',
            label: 'Audiobook'
        }
    };

    // Prepare data for pie chart
    const formatData: FormatData[] = Object.entries(formatCounts)
        .filter(([_, count]) => count > 0)
        .map(([format, count]) => ({
            format: format as BookFormat,
            count,
            ...formatConfigs[format as BookFormat]
        }));

    // Convert to pie chart format
    const pieData = formatData.map((item) => ({
        value: item.count,
        color: item.color,
        label: item.label,
        labelTextStyle: {
            color: theme.text,
            fontSize: 12,
        }
    }));

    const totalBooks = activeDeadlines.length;

    return (
        <ThemedView backgroundColor="card" borderColor="border" style={styles.container}>
            <View style={styles.header}>
                <IconSymbol name="chart.bar.fill" size={24} color={theme.primary} />
                <ThemedText type="semiBold" style={styles.title}>
                    Format Distribution
                </ThemedText>
            </View>

            <View style={styles.content}>
                <View style={styles.chartContainer}>
                    <PieChart
                        data={pieData}
                        donut
                        radius={80}
                        innerRadius={45}
                        centerLabelComponent={() => (
                            <View style={styles.centerLabel}>
                                <ThemedText style={styles.centerNumber}>
                                    {totalBooks}
                                </ThemedText>
                                <ThemedText color="textMuted" style={styles.centerText}>
                                    {totalBooks === 1 ? 'book' : 'books'}
                                </ThemedText>
                            </View>
                        )}
                        strokeColor={theme.background}
                        strokeWidth={2}
                        animationDuration={800}
                    />
                </View>

                <View style={styles.legend}>
                    {formatData.map((item) => (
                        <View key={item.format} style={styles.legendItem}>
                            <View style={styles.legendIcon}>
                                <IconSymbol 
                                    name={item.icon as any} 
                                    size={16} 
                                    color={item.color} 
                                />
                            </View>
                            <ThemedText style={styles.legendLabel}>
                                {item.label}
                            </ThemedText>
                            <ThemedText style={styles.legendCount}>
                                {item.count}
                            </ThemedText>
                            <ThemedText color="textMuted" style={styles.legendPercentage}>
                                ({Math.round((item.count / totalBooks) * 100)}%)
                            </ThemedText>
                        </View>
                    ))}
                </View>
            </View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 20,
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        marginLeft: 12,
    },
    loadingText: {
        fontSize: 14,
        textAlign: 'center',
        paddingVertical: 20,
    },
    content: {
        alignItems: 'center',
    },
    chartContainer: {
        marginBottom: 20,
    },
    centerLabel: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerNumber: {
        fontSize: 24,
        fontWeight: '600',
    },
    centerText: {
        fontSize: 12,
        marginTop: 2,
    },
    legend: {
        width: '100%',
        gap: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    legendIcon: {
        width: 24,
        alignItems: 'center',
        marginRight: 12,
    },
    legendLabel: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
    },
    legendCount: {
        fontSize: 14,
        fontWeight: '600',
        marginRight: 8,
    },
    legendPercentage: {
        fontSize: 12,
        minWidth: 40,
        textAlign: 'right',
    },
});

export default FormatDistributionChart;