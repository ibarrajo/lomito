/**
 * CaseSidebar Component
 * Sidebar for desktop view with location map, share buttons, and subscribe.
 */

import { useState } from 'react';
import { View, StyleSheet, Pressable, Platform, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  MessageCircle,
  Send,
  Twitter,
  Link as LinkIcon,
} from 'lucide-react-native';
import { H3, Body, Caption, BodySmall } from '@lomito/ui/components/typography';
import {
  colors,
  spacing,
  borderRadius,
  shadowStyles,
  typography,
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
  const [commentText, setCommentText] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  // Mock comments data (UI only for now)
  const comments: Array<{
    id: string;
    author: string;
    text: string;
    timestamp: string;
  }> = [];

  // Mock donation data (UI only for now)
  const donationGoal = 2500;
  const donationRaised = 0;
  const donationProgress = (donationRaised / donationGoal) * 100;

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
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      }
    }
  };

  const handlePostComment = () => {
    if (commentText.trim()) {
      // TODO: Implement backend comment posting
      setCommentText('');
    }
  };

  return (
    <View style={styles.container}>
      {/* Community Discussion Card */}
      <View style={styles.card}>
        <H3 style={styles.cardTitle}>{t('case.communityDiscussion')}</H3>
        {comments.length === 0 ? (
          <View style={styles.noComments}>
            <Caption color={colors.neutral500}>{t('case.noComments')}</Caption>
            <BodySmall color={colors.neutral400} style={styles.beFirstText}>
              {t('case.beFirstComment')}
            </BodySmall>
          </View>
        ) : (
          <View style={styles.commentsList}>
            {comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <View style={styles.commentAvatar} />
                <View style={styles.commentContent}>
                  <Body style={styles.commentAuthor}>{comment.author}</Body>
                  <BodySmall color={colors.neutral700}>
                    {comment.text}
                  </BodySmall>
                  <Caption color={colors.neutral400} style={styles.commentTime}>
                    {comment.timestamp}
                  </Caption>
                </View>
              </View>
            ))}
          </View>
        )}
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder={t('case.writeComment')}
            placeholderTextColor={colors.neutral400}
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={500}
            accessibilityLabel={t('case.writeComment')}
          />
          <Pressable
            style={[
              styles.sendButton,
              !commentText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handlePostComment}
            disabled={!commentText.trim()}
            accessibilityLabel={t('case.postComment')}
            accessibilityRole="button"
          >
            <Send
              size={18}
              color={commentText.trim() ? colors.secondary : colors.neutral400}
              strokeWidth={1.5}
            />
          </Pressable>
        </View>
      </View>

      {/* Donation Progress Card */}
      <View style={styles.card}>
        <H3 style={styles.cardTitle}>{t('case.donationProgress')}</H3>
        <View style={styles.donationContent}>
          <View style={styles.donationStats}>
            <Body style={styles.donationRaised}>
              {t('case.donationRaised', { amount: donationRaised })}
            </Body>
            <Caption color={colors.neutral500}>
              {t('case.donationGoal', { amount: donationGoal })}
            </Caption>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${donationProgress}%` },
                ]}
              />
            </View>
          </View>
          <BodySmall
            color={colors.neutral500}
            style={styles.donationDescription}
          >
            {t('case.donationDescription')}
          </BodySmall>
          <Pressable
            style={styles.contributeButton}
            accessibilityLabel={t('case.contribute')}
            accessibilityRole="button"
          >
            <Body color={colors.secondary} style={styles.contributeText}>
              {t('case.contribute')}
            </Body>
          </Pressable>
        </View>
      </View>

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
          <Twitter size={20} color={colors.neutral700} strokeWidth={1.5} />
          <Body color={colors.neutral700}>{t('case.shareTwitter')}</Body>
        </Pressable>
        <Pressable
          style={styles.shareButton}
          onPress={handleCopyLink}
          accessibilityLabel={t('case.copyLink')}
          accessibilityRole="button"
        >
          <LinkIcon size={20} color={colors.neutral700} strokeWidth={1.5} />
          <Body color={colors.neutral700}>
            {linkCopied ? t('case.linkCopied') : t('case.copyLink')}
          </Body>
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
          color={isSubscribed ? colors.secondary : colors.neutral700}
          style={styles.subscribeText}
        >
          {isSubscribed ? t('case.subscribed') : t('case.subscribe')}
        </Body>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  beFirstText: {
    marginTop: spacing.xs,
  },
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
  commentAuthor: {
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  commentAvatar: {
    backgroundColor: colors.neutral200,
    borderRadius: borderRadius.avatar,
    height: 32,
    marginRight: spacing.sm,
    width: 32,
  },
  commentContent: {
    flex: 1,
  },
  commentInput: {
    ...typography.body,
    borderColor: colors.neutral200,
    borderRadius: borderRadius.input,
    borderWidth: 1,
    color: colors.neutral900,
    flex: 1,
    maxHeight: 80,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  commentInputContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  commentTime: {
    marginTop: spacing.xs,
  },
  commentsList: {
    marginBottom: spacing.sm,
  },
  container: {
    width: '100%',
  },
  contributeButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.button,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  contributeText: {
    fontWeight: '600',
  },
  donationContent: {
    width: '100%',
  },
  donationDescription: {
    marginTop: spacing.sm,
  },
  donationRaised: {
    fontWeight: '600',
  },
  donationStats: {
    marginBottom: spacing.md,
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
  noComments: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  progressBarBackground: {
    backgroundColor: colors.neutral200,
    borderRadius: borderRadius.pill,
    height: 8,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarContainer: {
    marginBottom: spacing.sm,
    width: '100%',
  },
  progressBarFill: {
    backgroundColor: colors.primary,
    height: '100%',
  },
  sendButton: {
    alignItems: 'center',
    borderColor: colors.neutral200,
    borderRadius: borderRadius.button,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  sendButtonDisabled: {
    opacity: 0.5,
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
