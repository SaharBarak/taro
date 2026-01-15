import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { votesApi } from '@sync/api-client';
import { formatDate } from '@sync/shared';

interface VoteHistoryItem {
  voteId: string;
  optionId: string;
  createdAt: Date;
  vote?: {
    title: string;
    status: 'active' | 'ended' | 'pending';
    municipality?: string;
  };
  option?: {
    text: string;
  };
}

function HistoryItem({ item, onPress }: { item: VoteHistoryItem; onPress: () => void }) {
  const statusColors = {
    active: { bg: 'bg-green-100', text: 'text-green-600' },
    ended: { bg: 'bg-neutral-100', text: 'text-neutral-600' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
  };

  const colors = statusColors[item.vote?.status || 'ended'];

  return (
    <Pressable
      className="bg-white rounded-xl p-4 mb-3 border border-neutral-100 active:bg-neutral-50"
      onPress={onPress}
    >
      <View className="flex-row-reverse justify-between items-start mb-2">
        <View className="flex-1 mr-3">
          <Text className="text-base font-heebo font-semibold text-neutral-900 text-right" numberOfLines={2}>
            {item.vote?.title || 'הצבעה'}
          </Text>
          <Text className="text-sm text-neutral-500 font-assistant text-right mt-1">
            {item.vote?.municipality}
          </Text>
        </View>
        <View className={`${colors.bg} rounded-full px-2 py-1`}>
          <Text className={`${colors.text} text-xs font-heebo`}>
            {item.vote?.status === 'active' ? 'פעיל' : item.vote?.status === 'ended' ? 'הסתיים' : 'ממתין'}
          </Text>
        </View>
      </View>

      <View className="flex-row-reverse items-center justify-between pt-3 border-t border-neutral-100">
        <View className="flex-row-reverse items-center">
          <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
          <Text className="text-neutral-500 text-sm font-assistant mr-1">
            {formatDate(item.createdAt)}
          </Text>
        </View>
        <View className="flex-row-reverse items-center">
          <Ionicons name="checkmark-circle" size={14} color="#10B981" />
          <Text className="text-green-600 text-sm font-assistant mr-1">הצבעתם</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function HistoryScreen() {
  const router = useRouter();
  const [history, setHistory] = useState<VoteHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      // Fetch participation history with vote details from API
      const participations = await votesApi.getUserParticipations();

      // Transform API response to VoteHistoryItem format
      const historyItems: VoteHistoryItem[] = participations.map((p: any) => ({
        voteId: p.voteId,
        optionId: p.optionId,
        createdAt: new Date(p.createdAt),
        vote: p.vote ? {
          title: p.vote.title || 'הצבעה',
          status: p.vote.status || 'ended',
          municipality: p.vote.municipality,
        } : undefined,
        option: p.option ? {
          text: p.option.text,
        } : undefined,
      }));

      setHistory(historyItems);
    } catch (err) {
      console.error('Error fetching history:', err);
      // Keep empty array on error - user sees "no history" message
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    fetchHistory().finally(() => setLoading(false));
  }, [fetchHistory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  }, [fetchHistory]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50 items-center justify-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <View className="px-5 pt-4 pb-2">
        <Animated.View entering={FadeInDown.duration(400)}>
          <Text className="text-2xl font-heebo font-bold text-neutral-900 text-right">
            היסטוריית הצבעות
          </Text>
          <Text className="text-neutral-500 font-assistant text-right mt-1">
            כל ההצבעות שהשתתפתם בהן
          </Text>
        </Animated.View>
      </View>

      {/* Stats Summary */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(100)}
        className="mx-5 mb-4 bg-primary-600 rounded-2xl p-4"
      >
        <View className="flex-row-reverse justify-around">
          <View className="items-center">
            <Text className="text-3xl font-heebo font-bold text-white">{history.length}</Text>
            <Text className="text-primary-200 font-assistant text-sm">הצבעות</Text>
          </View>
          <View className="w-px bg-primary-400" />
          <View className="items-center">
            <Text className="text-3xl font-heebo font-bold text-white">
              {history.filter((h) => h.vote?.status === 'active').length}
            </Text>
            <Text className="text-primary-200 font-assistant text-sm">פעילות</Text>
          </View>
          <View className="w-px bg-primary-400" />
          <View className="items-center">
            <Text className="text-3xl font-heebo font-bold text-white">{history.length}</Text>
            <Text className="text-primary-200 font-assistant text-sm">טוקנים</Text>
          </View>
        </View>
      </Animated.View>

      {history.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="time-outline" size={64} color="#D1D5DB" />
          <Text className="text-xl font-heebo font-semibold text-neutral-700 text-center mt-4">
            אין היסטוריית הצבעות
          </Text>
          <Text className="text-neutral-500 font-assistant text-center mt-2">
            כשתצביעו על נושאים, הם יופיעו כאן
          </Text>
          <Pressable
            className="mt-6 bg-primary-600 px-6 py-3 rounded-xl"
            onPress={() => router.push('/(tabs)')}
          >
            <Text className="text-white font-heebo font-medium">צפייה בהצבעות פעילות</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />
          }
        >
          <Animated.View entering={FadeInDown.duration(400).delay(200)}>
            {history.map((item, index) => (
              <HistoryItem
                key={`${item.voteId}-${index}`}
                item={item}
                onPress={() => router.push(`/vote/${item.voteId}`)}
              />
            ))}
          </Animated.View>
          <View className="h-6" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
