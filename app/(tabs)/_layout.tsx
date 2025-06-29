import { Tabs } from 'expo-router';
import { Globe, Bookmark, History, Settings } from 'lucide-react-native';
import { useSettings } from '@/contexts/BrowserContext';

export default function TabLayout() {
  const { theme } = useSettings();
  
  const iconColor = theme === 'dark' ? '#FFFFFF' : '#000000';
  const inactiveIconColor = theme === 'dark' ? '#666666' : '#999999';
  const backgroundColor = theme === 'dark' ? '#000000' : '#FFFFFF';
  const borderColor = theme === 'dark' ? '#333333' : '#E5E5E5';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor,
          borderTopColor: borderColor,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarActiveTintColor: iconColor,
        tabBarInactiveTintColor: inactiveIconColor,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Browser',
          tabBarIcon: ({ size, color }) => (
            <Globe size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: 'Bookmarks',
          tabBarIcon: ({ size, color }) => (
            <Bookmark size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ size, color }) => (
            <History size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}