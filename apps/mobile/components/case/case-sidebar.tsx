/**
 * CaseSidebar Component
 * Sidebar for desktop view with location map, share buttons, and subscribe.
 */

import { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
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
import { isFeatureEnabled } from '@lomito/shared';
import { accessToken } from '../../lib/mapbox';
import { useCaseComments } from '../../hooks/use-case-comments';

/**
 * Converts an ISO date string to a short relative time label.
 * Examples: "3m ago", "2h ago", "5d ago"
 */
function formatRelativeTime(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = now - then;
  const diffMinutes = Math.floor(diffMs / 60_000);
  if (diffMinutes < 60) {
    return `${Math.max(diffMinutes, 1)}m ago`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

interface CaseSidebarProps {
  latitude: number;
  longitude: number;
  locationNotes?: string | null;
  isSubscribed: boolean;
  subscriptionLoading: boolean;
  onSubscribeToggle: () => void;
  caseId: string;
  isAuthenticated: boolean;
}

export function CaseSidebar({
  latitude,
  longitude,
  locationNotes,
  isSubscribed,
  subscriptionLoading,
  onSubscribeToggle,
  caseId,
  isAuthenticated,
}: CaseSidebarProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [commentText, setCommentText] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  const {
    comments,
    loading: commentsLoading,
    posting,
    postComment,
  } = useCaseComments(caseId);

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

  const handlePostComment = async () => {
    if (commentText.trim()) {
      await postComment(commentText);
      setCommentText('');
    }
  };

  return (
    <View style={styles.container}>
      {/* Community Discussion Card */}
      <View style={styles.card}>
        <H3 style={styles.cardTitle}>{t('case.communityDiscussion')}</H3>
        {commentsLoading ? (
          <View style={styles.noComments}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : comments.length === 0 ? (
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
                  <Body style={styles.commentAuthor}>
                    {comment.author.full_name ?? t('common.user')}
                  </Body>
                  <BodySmall color={colors.neutral700}>
                    {comment.body}
                  </BodySmall>
                  <Caption color={colors.neutral400} style={styles.commentTime}>
                    {formatRelativeTime(comment.created_at)}
                  </Caption>
                </View>
              </View>
            ))}
          </View>
        )}
        {isAuthenticated ? (
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
                (!commentText.trim() || posting) && styles.sendButtonDisabled,
              ]}
              onPress={handlePostComment}
              disabled={!commentText.trim() || posting}
              accessibilityLabel={t('case.postComment')}
              accessibilityRole="button"
            >
              <Send
                size={18}
                color={
                  commentText.trim() && !posting
                    ? colors.secondary
                    : colors.neutral400
                }
                strokeWidth={1.5}
              />
            </Pressable>
          </View>
        ) : (
          <View style={styles.authPrompt}>
            <Body color={colors.neutral500}>{t('case.signInToComment')}</Body>
            <Pressable
              style={styles.authPromptButton}
              onPress={() => router.push('/auth/login')}
              accessibilityLabel={t('auth.login')}
              accessibilityRole="button"
            >
              <Body color={colors.primary} style={styles.authPromptButtonText}>
                {t('auth.login')}
              </Body>
            </Pressable>
          </View>
        )}
      </View>

      {/* Donation Progress Card */}
      {isFeatureEnabled('donations') && (
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
      )}

      {/* Location Card */}
      <View style={styles.card}>
        <H3 style={styles.cardTitle}>{t('case.location')}</H3>
        <Image
          source={{
            uri: `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+13ECC8(${longitude},${latitude})/${longitude},${latitude},14/400x200@2x?access_token=${accessToken}`,
          }}
          style={styles.staticMap}
          contentFit="cover"
          accessibilityLabel={t('case.staticMapAlt')}
        />
        {locationNotes ? (
          <BodySmall color={colors.neutral700} style={styles.locationNotesText}>
            {t('case.locationNotes')}: {locationNotes}
          </BodySmall>
        ) : null}
        <Caption color={colors.neutral500} style={styles.mapCoordinates}>
          {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </Caption>
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
      {isAuthenticated ? (
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
      ) : (
        <Pressable
          style={styles.subscribeButton}
          onPress={() => router.push('/auth/login')}
          accessibilityLabel={t('case.signInToFollow')}
          accessibilityRole="button"
        >
          <Body color={colors.neutral700} style={styles.subscribeText}>
            {t('case.signInToFollow')}
          </Body>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  authPrompt: {
    alignItems: 'center',
    backgroundColor: colors.neutral100,
    borderRadius: borderRadius.card,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
  },
  authPromptButton: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  authPromptButtonText: {
    fontWeight: '600',
  },
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
  locationNotesText: {
    marginTop: spacing.sm,
  },
  mapCoordinates: {
    marginTop: spacing.xs,
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
  staticMap: {
    borderRadius: borderRadius.card,
    height: 200,
    width: '100%',
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
