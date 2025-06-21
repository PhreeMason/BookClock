import ActiveReads from '@/components/ActiveReads';
import Header from '@/components/Header';
import OverdueReads from '@/components/OverdueReads';
import { useGetDeadlines } from '@/hooks/useDeadlines';
import { ReadingDeadlineWithProgress } from '@/types/deadline';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaView } from "react-native-safe-area-context";
const TopTabs = createMaterialTopTabNavigator();

export default function MyTabs() {
    const activeCount = 3;
    const attentionCount = 1;
    const {data, error, isLoading} = useGetDeadlines();
    
    // Now data is properly typed as ReadingDeadlineWithProgress[]
    console.log({data, error, isLoading});
    
    // Example of type-safe access to the data
    if (data && data.length > 0) {
        const firstDeadline: ReadingDeadlineWithProgress = data[0];
        console.log('First book:', firstDeadline.book_title);
        console.log('Author:', firstDeadline.author);
        console.log('Progress entries:', firstDeadline.progress.length);
    }
    
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Header
                activeCount={activeCount}
                attentionCount={attentionCount}
            />
            <TopTabs.Navigator
                screenOptions={{
                    tabBarLabelStyle: { fontSize: 18, fontWeight: '600' },
                    tabBarStyle: { backgroundColor: '#2d2d2d' },
                    tabBarBounces: true,
                    tabBarIndicatorStyle: { backgroundColor: '#fff' },
                }}
            >
                <TopTabs.Screen name="active" component={ActiveReads} options={{ title: 'Active' }} />
                <TopTabs.Screen name="overdue" component={OverdueReads} options={{ title: 'Overdue' }} />
            </TopTabs.Navigator>
        </SafeAreaView>
    );
}