import { Share, Platform } from 'react-native';
import * as Sharing from 'expo-sharing';

export interface ShareContent {
  title: string;
  message: string;
  url?: string;
}

export async function shareVote(voteId: string, voteTitle: string): Promise<boolean> {
  const url = `https://sync.co.il/votes/${voteId}`;
  const message = `בואו להצביע על: ${voteTitle}`;

  try {
    if (Platform.OS === 'web') {
      // Web share API
      if (navigator.share) {
        await navigator.share({
          title: voteTitle,
          text: message,
          url,
        });
        return true;
      }
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(`${message}\n${url}`);
      return true;
    }

    // Native share
    const result = await Share.share({
      title: voteTitle,
      message: `${message}\n${url}`,
      url: Platform.OS === 'ios' ? url : undefined,
    });

    return result.action === Share.sharedAction;
  } catch (error) {
    console.error('Error sharing:', error);
    return false;
  }
}

export async function shareApp(): Promise<boolean> {
  const message = 'הצטרפו לסינק - פלטפורמה להצבעות קהילתיות מקומיות';
  const url = 'https://sync.co.il/download';

  try {
    const result = await Share.share({
      title: 'סינק - הצבעות קהילתיות',
      message: `${message}\n${url}`,
      url: Platform.OS === 'ios' ? url : undefined,
    });

    return result.action === Share.sharedAction;
  } catch (error) {
    console.error('Error sharing:', error);
    return false;
  }
}

export async function canShare(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return !!navigator.share;
  }
  return await Sharing.isAvailableAsync();
}
