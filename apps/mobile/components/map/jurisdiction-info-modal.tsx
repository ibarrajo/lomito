/**
 * JurisdictionInfoModal Component
 * Displays jurisdiction details including authority contact information.
 */

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
  Modal,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Mail, Phone, ExternalLink, X } from 'lucide-react-native';
import { BodySmall } from '@lomito/ui';
import {
  colors,
  spacing,
  typography,
  iconSizes,
  shadowStyles,
  borderRadius,
} from '@lomito/ui/src/theme/tokens';
import { supabase } from '../../lib/supabase';
import type { JurisdictionAuthority } from '@lomito/shared/types/database';

interface JurisdictionInfoModalProps {
  visible: boolean;
  jurisdictionId: string;
  jurisdictionName: string;
  onClose: () => void;
}

export function JurisdictionInfoModal({
  visible,
  jurisdictionId,
  jurisdictionName,
  onClose,
}: JurisdictionInfoModalProps) {
  const { t } = useTranslation();
  const [authorities, setAuthorities] = useState<JurisdictionAuthority[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible || !jurisdictionId) {
      return;
    }

    const fetchAuthorities = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('jurisdiction_authorities')
          .select('*')
          .eq('jurisdiction_id', jurisdictionId)
          .order('authority_type', { ascending: true });

        if (error) {
          console.error('Error fetching authorities:', error);
          return;
        }

        setAuthorities(data ?? []);
      } catch (err) {
        console.error('Unexpected error fetching authorities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorities();
  }, [visible, jurisdictionId]);

  const handleEmailPress = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handlePhonePress = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleUrlPress = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.overlay}
        onPress={onClose}
        accessibilityLabel={t('common.close')}
        accessibilityRole="button"
      >
        <View style={styles.card}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{jurisdictionName}</Text>
              <Pressable
                onPress={onClose}
                style={styles.closeButton}
                accessibilityLabel={t('common.close')}
                accessibilityRole="button"
              >
                <X size={iconSizes.default} color={colors.neutral500} />
              </Pressable>
            </View>

            {/* Content */}
            <ScrollView style={styles.scrollView}>
              {loading ? (
                <BodySmall color={colors.neutral500}>
                  {t('common.loading')}
                </BodySmall>
              ) : authorities.length === 0 ? (
                <BodySmall color={colors.neutral500}>
                  {t('map.noAuthorityInfo')}
                </BodySmall>
              ) : (
                authorities.map((authority) => (
                  <View key={authority.id} style={styles.authorityCard}>
                    <Text style={styles.authorityName}>
                      {authority.dependency_name}
                    </Text>

                    {authority.department_name && (
                      <BodySmall
                        color={colors.neutral700}
                        style={styles.department}
                      >
                        {authority.department_name}
                      </BodySmall>
                    )}

                    <View style={styles.typeRow}>
                      <View
                        style={[
                          styles.typeBadge,
                          authority.authority_type === 'primary' &&
                            styles.typeBadgePrimary,
                        ]}
                      >
                        <Text style={styles.typeText}>
                          {t(`authority.type.${authority.authority_type}`)}
                        </Text>
                      </View>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>
                          {t(
                            `authority.category.${authority.dependency_category}`,
                          )}
                        </Text>
                      </View>
                    </View>

                    {authority.contact_name && (
                      <BodySmall
                        color={colors.neutral700}
                        style={styles.contact}
                      >
                        {authority.contact_name}
                        {authority.contact_title &&
                          ` · ${authority.contact_title}`}
                      </BodySmall>
                    )}

                    <View style={styles.contactActions}>
                      {authority.email && (
                        <Pressable
                          style={styles.contactButton}
                          onPress={() => handleEmailPress(authority.email!)}
                          accessibilityLabel={t('map.emailAuthority')}
                          accessibilityRole="button"
                        >
                          <Mail
                            size={iconSizes.inline}
                            color={colors.info}
                            strokeWidth={2}
                          />
                          <Text style={styles.contactButtonText}>
                            {authority.email}
                          </Text>
                        </Pressable>
                      )}

                      {authority.phone && (
                        <Pressable
                          style={styles.contactButton}
                          onPress={() => handlePhonePress(authority.phone!)}
                          accessibilityLabel={t('map.callAuthority')}
                          accessibilityRole="button"
                        >
                          <Phone
                            size={iconSizes.inline}
                            color={colors.success}
                            strokeWidth={2}
                          />
                          <Text style={styles.contactButtonText}>
                            {authority.phone}
                          </Text>
                        </Pressable>
                      )}

                      {authority.url && (
                        <Pressable
                          style={styles.contactButton}
                          onPress={() => handleUrlPress(authority.url!)}
                          accessibilityLabel={t('map.visitWebsite')}
                          accessibilityRole="button"
                        >
                          <ExternalLink
                            size={iconSizes.inline}
                            color={colors.primary}
                            strokeWidth={2}
                          />
                          <Text style={styles.contactButtonText}>
                            {t('map.website')}
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  authorityCard: {
    borderBottomColor: colors.neutral200,
    borderBottomWidth: 1,
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
  },
  authorityName: {
    color: colors.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.h3.fontSize,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    maxHeight: '80%',
    maxWidth: 600,
    width: '90%',
    ...shadowStyles.elevated,
  },
  categoryBadge: {
    backgroundColor: colors.neutral100,
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  categoryText: {
    color: colors.neutral700,
    fontSize: 11,
    fontWeight: '600',
  },
  closeButton: {
    padding: spacing.xs,
  },
  contact: {
    marginTop: spacing.sm,
  },
  contactActions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  contactButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  contactButtonText: {
    color: colors.neutral700,
    fontSize: typography.small.fontSize,
    fontWeight: '500',
  },
  department: {
    marginBottom: spacing.xs,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: colors.neutral200,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(31, 35, 40, 0.5)',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  scrollView: {
    maxHeight: 400,
    padding: spacing.lg,
  },
  title: {
    color: colors.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.h2.fontSize,
    fontWeight: '700',
  },
  typeBadge: {
    backgroundColor: colors.infoBackground,
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  typeBadgePrimary: {
    backgroundColor: colors.primaryLight,
  },
  typeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  typeText: {
    color: colors.info,
    fontSize: 11,
    fontWeight: '600',
  },
});
