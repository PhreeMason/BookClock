import ActiveReads from '@/components/features/deadlines/ActiveReads';
import OverdueReads from '@/components/features/deadlines/OverdueReads';
import Header from '@/components/navigation/Header';
import { useTheme } from '@/theme';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaView } from "react-native-safe-area-context";

const TopTabs = createMaterialTopTabNavigator();

export default function MyTabs() {
    const { theme } = useTheme();
    const backgroundColor = theme.surfaceHover;
    const textColor = theme.text;
    const accentColor = theme.accent;

    
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor }}>
            <Header />
            <TopTabs.Navigator
                screenOptions={{
                    tabBarLabelStyle: { fontSize: 18, fontWeight: '600' },
                    tabBarStyle: { backgroundColor },
                    tabBarIndicatorStyle: { backgroundColor: accentColor },
                    tabBarActiveTintColor: textColor,
                    tabBarInactiveTintColor: textColor,
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