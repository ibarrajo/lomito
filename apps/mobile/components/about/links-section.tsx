import { View, Pressable, StyleSheet, Text, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { H2 } from '@lomito/ui/src/components/typography';
import {
  colors,
  spacing,
  borderRadius,
  shadowStyles,
  typography,
} from '@lomito/ui/src/theme/tokens';
import { ExternalLink, Github, Mail, Globe } from 'lucide-react-native';

interface LinkItemProps {
  icon: React.ReactNode;
  label: string;
  url: string;
  accessibilityLabel: string;
}

function LinkItem({ icon, label, url, accessibilityLabel }: LinkItemProps) {
  const handlePress = async () => {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.linkRow,
        pressed && styles.linkRowPressed,
      ]}
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.linkIconContainer}>{icon}</View>
      <Text style={styles.linkLabel}>{label}</Text>
      <ExternalLink
        size={20}
        color={colors.neutral500}
        strokeWidth={1.5}
        accessibilityLabel=""
      />
    </Pressable>
  );
}

export function LinksSection() {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <H2 accessibilityLabel={t('about.contact')}>{t('about.contact')}</H2>
      </View>

      <LinkItem
        icon={
          <Globe
            size={24}
            color={colors.primary}
            strokeWidth={1.5}
            accessibilityLabel=""
          />
        }
        label={t('about.website')}
        url="https://lomito.org"
        accessibilityLabel={`${t('about.website')} - lomito.org`}
      />

      <LinkItem
        icon={
          <Github
            size={24}
            color={colors.primary}
            strokeWidth={1.5}
            accessibilityLabel=""
          />
        }
        label={t('about.github')}
        url="https://github.com/lomito-org/lomito"
        accessibilityLabel={`${t('about.github')} - github.com/lomito-org/lomito`}
      />

      <LinkItem
        icon={
          <Mail
            size={24}
            color={colors.primary}
            strokeWidth={1.5}
            accessibilityLabel=""
          />
        }
        label={t('about.contact')}
        url="mailto:hello@lomito.org"
        accessibilityLabel={`${t('about.contact')} - hello@lomito.org`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    marginBottom: spacing.md,
    padding: spacing.md,
    ...shadowStyles.card,
  },
  header: {
    marginBottom: spacing.sm,
  },
  linkIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 24,
  },
  linkLabel: {
    ...typography.body,
    color: colors.neutral900,
    flex: 1,
  },
  linkRow: {
    alignItems: 'center',
    borderBottomColor: colors.neutral200,
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 56,
    paddingVertical: spacing.md,
  },
  linkRowPressed: {
    backgroundColor: colors.primaryLight,
  },
});
