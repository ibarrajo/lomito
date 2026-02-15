/**
 * Share Button Component
 * Allows users to share case reports via native share dialog or clipboard.
 */

import { useState, useEffect } from 'react';
import { Pressable, Text, Platform, StyleSheet, Share } from 'react-native';
import { Share2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, borderRadius } from '@lomito/ui/theme/tokens';

interface ShareButtonProps {
  caseId: string;
  folio?: string | null;
}

export function ShareButton({ caseId, folio }: ShareButtonProps) {
  const { t } = useTranslation();
  const [showCopiedFeedback, setShowCopiedFeedback] = useState(false);

  const shareUrl = `https://lomito.org/case/${caseId}`;
  const shareText = t('case.shareText', { url: shareUrl });

  useEffect(() => {
    if (showCopiedFeedback) {
      const timeout = setTimeout(() => {
        setShowCopiedFeedback(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [showCopiedFeedback]);

  const handleShare = async () => {
    try {
      if (Platform.OS === 'web') {
        // Web: use navigator.share if available, otherwise clipboard
        // Type check for web APIs that may not be in all browsers
        const nav = navigator as typeof navigator & {
          share?: (data: { title?: string; text?: string; url?: string }) => Promise<void>;
          clipboard?: { writeText: (text: string) => Promise<void> };
        };

        if (nav.share) {
          await nav.share({
            title: folio ? `Lomito - ${folio}` : 'Lomito Report',
            text: shareText,
            url: shareUrl,
          });
        } else if (nav.clipboard) {
          await nav.clipboard.writeText(shareUrl);
          setShowCopiedFeedback(true);
        }
      } else {
        // Native: use React Native Share API
        await Share.share({
          message: shareText,
          url: shareUrl,
        });
      }
    } catch (error) {
      // User cancelled or error occurred
      console.log('Share error:', error);
    }
  };

  return (
    <Pressable
      onPress={handleShare}
      style={styles.button}
      accessibilityLabel={t('case.share')}
      accessibilityRole="button"
    >
      {showCopiedFeedback ? (
        <Text style={styles.copiedText}>{t('case.linkCopied')}</Text>
      ) : (
        <Share2 size={20} color={colors.neutral700} strokeWidth={1.5} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'transparent',
    borderRadius: borderRadius.button,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  copiedText: {
    color: colors.neutral700,
    fontSize: 12,
    fontWeight: '600',
  },
});
