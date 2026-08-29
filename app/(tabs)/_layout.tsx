import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUserConversations } from '@/lib/use-chat';
import { useCurrentUserProfile } from '@/lib/user-profile';

function MessagesTabIcon({ color }: { color: string }) {
  const { uid } = useCurrentUserProfile();
  const { unreadCount } = useUserConversations(uid ?? undefined);
  return (
    <View style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
      <MaterialIcons size={24} name="chat-bubble-outline" color={color} />
      {unreadCount > 0 ? (
        <View
          style={{
            position: 'absolute',
            top: -2,
            right: -6,
            minWidth: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: '#DC2626',
            paddingHorizontal: 3,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1.5,
            borderColor: '#FFFFFF',
          }}>
          <Text style={{ color: '#FFFFFF', fontSize: 9, fontWeight: '800' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0E4AA4',
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Rynek',
          tabBarIcon: ({ color }) => <MaterialIcons size={24} name="work-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Czaty',
          tabBarIcon: ({ color }) => <MessagesTabIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Konto',
          tabBarIcon: ({ color }) => <MaterialIcons size={24} name="person-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Ustawienia',
          tabBarIcon: ({ color }) => <MaterialIcons size={24} name="settings" color={color} />,
        }}
      />
    </Tabs>
  );
}
