/**
 * CaseSidebar Component
 * Sidebar for desktop view with location map, share buttons, and subscribe.
 */

import { View, StyleSheet, Pressable, Platform, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MapPin, MessageCircle } from 'lucide-react-native';
import { H3, Body, Caption } from '@lomito/ui/components/typography';
import {
  colors,
  spacing,
  borderRadius,
  shadowStyles,
} from '@lomito/ui/theme/tokens';

interface CaseSidebarProps {
  latitude: number;
  longitude: number;
  isSubscribed: boolean;
  subscriptionLoading: boolean;
  onSubscribeToggle: () => void;
  caseId: string;
}

export function CaseSidebar({
  latitude,
  longitude,
  isSubscribed,
  subscriptionLoading,
  onSubscribeToggle,
  caseId,
}: CaseSidebarProps) {
  const { t } = useTranslation();

  const handleWhatsAppShare = () => {
    const shareUrl = `https://lomito.org/case/${caseId}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareUrl)}`;

    if (Platform.OS === 'web') {
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleTwitterShare = () => {
    const shareUrl = `https://lomito.org/case/${caseId}`;
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`;

    if (Platform.OS === 'web') {
      window.open(twitterUrl, '_blank');
    }
  };

  const handleCopyLink = async () => {
    const shareUrl = `https://lomito.org/case/${caseId}`;

    if (Platform.OS === 'web') {
      const nav = navigator as typeof navigator & {
        clipboard?: { writeText: (text: string) => Promise<void> };
      };

      if (nav.clipboard) {
        await nav.clipboard.writeText(shareUrl);
        Alert.alert(t('case.linkCopied'));
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Location Card */}
      <View style={styles.card}>
        <H3 style={styles.cardTitle}>{t('case.location')}</H3>
        <View style={styles.mapPlaceholder}>
          <MapPin size={32} color={colors.neutral400} strokeWidth={1.5} />
          <Caption color={colors.neutral500} style={styles.mapLabel}>
            {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </Caption>
        </View>
      </View>

      {/* Share Card */}
      <View style={styles.card}>
        <H3 style={styles.cardTitle}>{t('case.shareCase')}</H3>
        <Pressable
          style={styles.shareButton}
          onPress={handleWhatsAppShare}
          accessibilityLabel={t('case.shareWhatsApp')}
          accessibilityRole="button"
        >
          <MessageCircle
            size={20}
            color={colors.neutral700}
            strokeWidth={1.5}
          />
          <Body color={colors.neutral700}>{t('case.shareWhatsApp')}</Body>
        </Pressable>
        <Pressable
          style={styles.shareButton}
          onPress={handleTwitterShare}
          accessibilityLabel={t('case.shareTwitter')}
          accessibilityRole="button"
        >
          <MessageCircle
            size={20}
            color={colors.neutral700}
            strokeWidth={1.5}
          />
          <Body color={colors.neutral700}>{t('case.shareTwitter')}</Body>
        </Pressable>
        <Pressable
          style={styles.shareButton}
          onPress={handleCopyLink}
          accessibilityLabel={t('case.copyLink')}
          accessibilityRole="button"
        >
          <MessageCircle
            size={20}
            color={colors.neutral700}
            strokeWidth={1.5}
          />
          <Body color={colors.neutral700}>{t('case.copyLink')}</Body>
        </Pressable>
      </View>

      {/* Subscribe Button */}
      <Pressable
        style={[
          styles.subscribeButton,
          isSubscribed && styles.subscribeButtonActive,
        ]}
        onPress={onSubscribeToggle}
        disabled={subscriptionLoading}
        accessibilityLabel={
          isSubscribed ? t('case.subscribed') : t('case.subscribe')
        }
        accessibilityRole="button"
      >
        <Body
          color={isSubscribed ? colors.white : colors.neutral700}
          style={styles.subscribeText}
        >
          {isSubscribed ? t('case.subscribed') : t('case.subscribe')}
        </Body>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...shadowStyles.card,
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  cardTitle: {
    marginBottom: spacing.md,
  },
  container: {
    width: '100%',
  },
  mapLabel: {
    marginTop: spacing.sm,
  },
  mapPlaceholder: {
    alignItems: 'center',
    backgroundColor: colors.neutral100,
    borderRadius: borderRadius.card,
    height: 200,
    justifyContent: 'center',
    width: '100%',
  },
  shareButton: {
    alignItems: 'center',
    backgroundColor: colors.neutral100,
    borderRadius: borderRadius.button,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  subscribeButton: {
    alignItems: 'center',
    backgroundColor: colors.neutral100,
    borderRadius: borderRadius.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  subscribeButtonActive: {
    backgroundColor: colors.primary,
  },
  subscribeText: {
    fontWeight: '600',
  },
});
