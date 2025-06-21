import ActiveReads from '@/components/ActiveReads';
import Header from '@/components/Header';
import OverdueReads from '@/components/OverdueReads';
import { useGetDeadlines } from '@/hooks/useDeadlines';
import { separateDeadlines } from '@/lib/deadlineUtils';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaView } from "react-native-safe-area-context";
const TopTabs = createMaterialTopTabNavigator();

export default function MyTabs() {
    const {data, error, isLoading} = useGetDeadlines();
    
    // Separate deadlines by active and overdue status
    const { active, overdue } = separateDeadlines(data || []);
    const activeCount = active.length;
    const attentionCount = overdue.length;
    
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
                <TopTabs.Screen 
                    name="active" 
                    options={{ title: 'Active' }}
                    children={props => <ActiveReads {...props} deadlines={active} />}
                />
                <TopTabs.Screen 
                    name="overdue" 
                    options={{ title: 'Overdue' }} 
                    children={props => <OverdueReads {...props} deadlines={overdue} />}
                />
            </TopTabs.Navigator>
        </SafeAreaView>
    );
}