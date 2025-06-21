import ActiveReads from '@/components/ActiveReads';
import Header from '@/components/Header';
import OverdueReads from '@/components/OverdueReads';
import { useDeadlines } from '@/contexts/DeadlineProvider';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaView } from "react-native-safe-area-context";
const TopTabs = createMaterialTopTabNavigator();

export default function MyTabs() {
    const { activeCount, overdueCount } = useDeadlines();
    
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Header
                activeCount={activeCount}
                attentionCount={overdueCount}
            />
            <TopTabs.Navigator
                screenOptions={{
                    tabBarLabelStyle: { fontSize: 18, fontWeight: '600' },
                    tabBarStyle: { backgroundColor: '#2d2d2d' },
                    tabBarBounces: true,
                    tabBarIndicatorStyle: { backgroundColor: '#fff' },
                }}
            >
                <TopTabs.Screen 
                    name="active" 
                    options={{ title: 'Active' }}
                    component={ActiveReads}
                />
                <TopTabs.Screen 
                    name="overdue" 
                    options={{ title: 'Overdue' }} 
                    component={OverdueReads}
                />
            </TopTabs.Navigator>
        </SafeAreaView>
    );
}