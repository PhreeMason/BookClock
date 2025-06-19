import ActiveReads from '@/components/ActiveReads';
import Header from '@/components/Header';
import OverdueReads from '@/components/OverdueReads';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Stack } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
const TopTabs = createMaterialTopTabNavigator();

export default function MyTabs() {
    const activeCount = 3;
    const attentionCount = 1;
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Stack.Screen options={{ headerShown: false }} />
            <Header 
                activeCount={activeCount}
                attentionCount={attentionCount}
            />
            <TopTabs.Navigator
                screenOptions={{
                    tabBarLabelStyle: { fontSize: 18, fontWeight: '600' },
                    tabBarStyle: { backgroundColor: '#2d2d2d' },
                }}
            >
                <TopTabs.Screen name="index" component={ActiveReads} options={{ title: 'Active' }} />
                <TopTabs.Screen name="overdue" component={OverdueReads} options={{ title: 'Overdue' }} />
            </TopTabs.Navigator>
        </SafeAreaView>
    );
}