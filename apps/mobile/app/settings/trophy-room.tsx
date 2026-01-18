import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Image,
  Share,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { nftApi } from '@sync/api-client';
import { formatDate } from '@sync/shared';
import type { VoteNftDisplay, NftType } from '@sync/shared';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with 16px padding and 16px gap

type FilterType = 'all' | 'verified_voter' | 'civic_patron';

interface FilterOption {
  key: FilterType;
  label: string;
}

const FILTERS: FilterOption[] = [
  { key: 'all', label: 'הכל' },
  { key: 'verified_voter', label: 'תושב מאומת' },
  { key: 'civic_patron', label: 'תומך אזרחי' },
];

function NftCard({
  nft,
  onPress,
  onShare,
}: {
  nft: VoteNftDisplay;
  onPress: () => void;
  onShare: () => void;
}) {
  const isVerifiedVoter = nft.type === 'verified_voter';

  return (
    <Pressable
      className="bg-white rounded-2xl border border-neutral-100 overflow-hidden active:bg-neutral-50"
      style={{ width: CARD_WIDTH }}
      onPress={onPress}
    >
      {/* NFT Image */}
      <View className="aspect-square bg-neutral-100 items-center justify-center">
        {nft.imageUrl ? (
          <Image
            source={{ uri: nft.imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center bg-primary-50">
            <Ionicons
              name={isVerifiedVoter ? 'checkmark-circle' : 'heart'}
              size={48}
              color="#2563EB"
            />
          </View>
        )}
      </View>

      {/* NFT Info */}
      <View className="p-3">
        <Text
          className="text-sm font-heebo font-semibold text-neutral-900 text-right"
          numberOfLines={2}
        >
          {nft.displayName || nft.voteTitle}
        </Text>

        <Text className="text-xs text-neutral-500 font-assistant text-right mt-1">
          {nft.municipality}
        </Text>

        {/* Type Badge & Share */}
        <View className="flex-row-reverse justify-between items-center mt-2">
          <View
            className={`px-2 py-1 rounded-full ${
              isVerifiedVoter ? 'bg-primary-100' : 'bg-secondary-100'
            }`}
          >
            <Text
              className={`text-xs font-heebo ${
                isVerifiedVoter ? 'text-primary-600' : 'text-secondary-600'
              }`}
            >
              {isVerifiedVoter ? 'תושב' : 'תומך'}
            </Text>
          </View>

          <Pressable
            className="w-8 h-8 rounded-full bg-neutral-100 items-center justify-center active:bg-neutral-200"
            onPress={onShare}
          >
            <Ionicons name="share-outline" size={16} color="#6B7280" />
          </Pressable>
        </View>

        {/* Minted Date */}
        {nft.mintedAt && (
          <Text className="text-xs text-neutral-400 font-assistant text-right mt-2">
            {formatDate(nft.mintedAt)}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

function NftDetailModal({
  nft,
  visible,
  onClose,
  onShare,
}: {
  nft: VoteNftDisplay | null;
  visible: boolean;
  onClose: () => void;
  onShare: () => void;
}) {
  if (!visible || !nft) return null;

  const isVerifiedVoter = nft.type === 'verified_voter';

  return (
    <Pressable
      className="absolute inset-0 bg-black/50 items-center justify-center z-50"
      onPress={onClose}
    >
      <Pressable
        className="bg-white rounded-3xl w-11/12 max-h-5/6 overflow-hidden"
        onPress={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <View className="flex-row-reverse justify-between items-center p-4 border-b border-neutral-100">
          <Text className="text-lg font-heebo font-bold text-neutral-900">פרטי NFT</Text>
          <Pressable
            className="w-8 h-8 rounded-full bg-neutral-100 items-center justify-center"
            onPress={onClose}
          >
            <Ionicons name="close" size={20} color="#6B7280" />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* NFT Image */}
          <View className="aspect-square bg-neutral-100 items-center justify-center">
            {nft.imageUrl ? (
              <Image
                source={{ uri: nft.imageUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full items-center justify-center bg-primary-50">
                <Ionicons
                  name={isVerifiedVoter ? 'checkmark-circle' : 'heart'}
                  size={80}
                  color="#2563EB"
                />
              </View>
            )}
          </View>

          {/* NFT Details */}
          <View className="p-4">
            <Text className="text-xl font-heebo font-bold text-neutral-900 text-right">
              {nft.displayName || nft.voteTitle}
            </Text>

            <View className="flex-row-reverse items-center mt-2">
              <Ionicons name="location" size={14} color="#9CA3AF" />
              <Text className="text-neutral-500 font-assistant text-right mr-1">
                {nft.municipality}
              </Text>
            </View>

            {/* Type Badge */}
            <View className="mt-4">
              <View
                className={`self-end px-3 py-1.5 rounded-full ${
                  isVerifiedVoter ? 'bg-primary-100' : 'bg-secondary-100'
                }`}
              >
                <Text
                  className={`text-sm font-heebo ${
                    isVerifiedVoter ? 'text-primary-600' : 'text-secondary-600'
                  }`}
                >
                  {isVerifiedVoter ? 'תושב מאומת' : 'תומך אזרחי'}
                </Text>
              </View>
            </View>

            {/* Metadata */}
            <View className="mt-4 bg-neutral-50 rounded-xl p-4">
              <Text className="text-sm font-heebo font-semibold text-neutral-700 text-right mb-3">
                מידע נוסף
              </Text>

              {nft.mintAddress && (
                <View className="flex-row-reverse justify-between py-2 border-b border-neutral-200">
                  <Text className="text-sm text-neutral-500 font-assistant">כתובת מנטה</Text>
                  <Text className="text-sm text-neutral-900 font-assistant" numberOfLines={1}>
                    {nft.mintAddress.slice(0, 8)}...{nft.mintAddress.slice(-8)}
                  </Text>
                </View>
              )}

              {nft.mintedAt && (
                <View className="flex-row-reverse justify-between py-2 border-b border-neutral-200">
                  <Text className="text-sm text-neutral-500 font-assistant">תאריך הנפקה</Text>
                  <Text className="text-sm text-neutral-900 font-assistant">
                    {formatDate(nft.mintedAt)}
                  </Text>
                </View>
              )}

              <View className="flex-row-reverse justify-between py-2">
                <Text className="text-sm text-neutral-500 font-assistant">מזהה הצבעה</Text>
                <Text className="text-sm text-neutral-900 font-assistant" numberOfLines={1}>
                  {nft.voteId.slice(0, 8)}...
                </Text>
              </View>
            </View>

            {/* Share Button */}
            <Pressable
              className="mt-4 bg-primary-600 rounded-xl py-4 flex-row-reverse items-center justify-center active:bg-primary-700"
              onPress={onShare}
            >
              <Ionicons name="share-social" size={20} color="white" />
              <Text className="text-white font-heebo font-medium mr-2">שתף ברשתות</Text>
            </Pressable>
          </View>
        </ScrollView>
      </Pressable>
    </Pressable>
  );
}

export default function TrophyRoomScreen() {
  const router = useRouter();
  const [nfts, setNfts] = useState<VoteNftDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [selectedNft, setSelectedNft] = useState<VoteNftDisplay | null>(null);

  const fetchNfts = useCallback(async () => {
    try {
      const params =
        selectedFilter === 'all'
          ? {}
          : { type: selectedFilter as NftType };

      const response = await nftApi.getUserNfts(params);
      setNfts(response.nfts);
    } catch (err) {
      console.error('Error fetching NFTs:', err);
      setNfts([]);
    }
  }, [selectedFilter]);

  useEffect(() => {
    setLoading(true);
    fetchNfts().finally(() => setLoading(false));
  }, [fetchNfts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNfts();
    setRefreshing(false);
  }, [fetchNfts]);

  const handleShare = async (nft: VoteNftDisplay) => {
    try {
      await Share.share({
        message: `הצבעתי על "${nft.voteTitle}" ב${nft.municipality} וקיבלתי NFT! #Taruu #CivicEngagement`,
        url: nft.imageUrl || undefined,
      });
    } catch (err) {
      console.error('Error sharing NFT:', err);
    }
  };

  const filteredNfts = nfts;
  const verifiedVoterCount = nfts.filter((n) => n.type === 'verified_voter').length;
  const civicPatronCount = nfts.filter((n) => n.type === 'civic_patron').length;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50 items-center justify-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      {/* Header */}
      <View className="px-5 pt-4 pb-2 flex-row-reverse items-center">
        <Pressable
          className="w-10 h-10 rounded-full bg-white border border-neutral-100 items-center justify-center active:bg-neutral-50"
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-forward" size={24} color="#374151" />
        </Pressable>
        <View className="flex-1 mr-3">
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text className="text-2xl font-heebo font-bold text-neutral-900 text-right">
              חדר הגביעים
            </Text>
            <Text className="text-neutral-500 font-assistant text-right">
              אוסף ה-NFT שלך
            </Text>
          </Animated.View>
        </View>
      </View>

      {/* Stats Summary */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(100)}
        className="mx-5 mb-4 bg-primary-600 rounded-2xl p-4"
      >
        <View className="flex-row-reverse justify-around">
          <View className="items-center">
            <Text className="text-3xl font-heebo font-bold text-white">{nfts.length}</Text>
            <Text className="text-primary-200 font-assistant text-sm">סה"כ NFTs</Text>
          </View>
          <View className="w-px bg-primary-400" />
          <View className="items-center">
            <Text className="text-3xl font-heebo font-bold text-white">{verifiedVoterCount}</Text>
            <Text className="text-primary-200 font-assistant text-sm">תושב מאומת</Text>
          </View>
          <View className="w-px bg-primary-400" />
          <View className="items-center">
            <Text className="text-3xl font-heebo font-bold text-white">{civicPatronCount}</Text>
            <Text className="text-primary-200 font-assistant text-sm">תומך אזרחי</Text>
          </View>
        </View>
      </Animated.View>

      {/* Filter Pills */}
      <Animated.View entering={FadeInDown.duration(400).delay(150)} className="px-5 mb-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row-reverse gap-2">
            {FILTERS.map((filter) => (
              <Pressable
                key={filter.key}
                className={`px-4 py-2 rounded-full border ${
                  selectedFilter === filter.key
                    ? 'bg-primary-600 border-primary-600'
                    : 'bg-white border-neutral-200'
                }`}
                onPress={() => setSelectedFilter(filter.key)}
              >
                <Text
                  className={`font-heebo text-sm ${
                    selectedFilter === filter.key ? 'text-white' : 'text-neutral-600'
                  }`}
                >
                  {filter.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </Animated.View>

      {filteredNfts.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="trophy-outline" size={64} color="#D1D5DB" />
          <Text className="text-xl font-heebo font-semibold text-neutral-700 text-center mt-4">
            אין NFTs עדיין
          </Text>
          <Text className="text-neutral-500 font-assistant text-center mt-2">
            כשתצביעו על נושאים ויסתיימו, תקבלו NFT לזכר השתתפותכם
          </Text>
          <Pressable
            className="mt-6 bg-primary-600 px-6 py-3 rounded-xl active:bg-primary-700"
            onPress={() => router.push('/(tabs)/votes')}
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
          <Animated.View
            entering={FadeInDown.duration(400).delay(200)}
            className="flex-row flex-wrap justify-between"
          >
            {filteredNfts.map((nft, index) => (
              <View key={nft.id} className="mb-4">
                <NftCard
                  nft={nft}
                  onPress={() => setSelectedNft(nft)}
                  onShare={() => handleShare(nft)}
                />
              </View>
            ))}
          </Animated.View>
          <View className="h-6" />
        </ScrollView>
      )}

      {/* Detail Modal */}
      <NftDetailModal
        nft={selectedNft}
        visible={!!selectedNft}
        onClose={() => setSelectedNft(null)}
        onShare={() => selectedNft && handleShare(selectedNft)}
      />
    </SafeAreaView>
  );
}
