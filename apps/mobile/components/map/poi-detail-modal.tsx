/**
 * PoiDetailModal Component
 * Displays details about a Point of Interest when tapped on the map.
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
import type { TFunction } from 'i18next';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  Heart,
  X,
} from 'lucide-react-native';
import { BodySmall } from '@lomito/ui';
import {
  colors,
  spacing,
  typography,
  iconSizes,
  shadowStyles,
  borderRadius,
} from '@lomito/ui/src/theme/tokens';
import type {
  PointOfInterest,
  PoiType,
  VetSubtype,
} from '@lomito/shared/types/database';

interface PoiDetailModalProps {
  visible: boolean;
  poi: PointOfInterest | null;
  onClose: () => void;
}

function getPoiColor(poiType: PoiType, vetSubtype: VetSubtype | null): string {
  if (poiType === 'government_office') return colors.poi.government;
  if (poiType === 'animal_shelter') return colors.poi.shelter;
  if (poiType === 'vet_clinic') {
    if (vetSubtype === 'emergency') return colors.poi.vetEmergency;
    if (vetSubtype === 'hours_24') return colors.poi.vetHours24;
    return colors.poi.vetStandard;
  }
  return colors.neutral500;
}

function getPoiTypeLabel(poiType: PoiType, t: TFunction): string {
  const map: Record<PoiType, string> = {
    government_office: t('poi.governmentOffice'),
    animal_shelter: t('poi.animalShelter'),
    vet_clinic: t('poi.vetClinic'),
  };
  return map[poiType];
}

function getVetSubtypeLabel(vetSubtype: VetSubtype, t: TFunction): string {
  const map: Record<VetSubtype, string> = {
    standard: t('poi.subtypeStandard'),
    emergency: t('poi.subtypeEmergency'),
    hours_24: t('poi.subtypeHours24'),
  };
  return map[vetSubtype];
}

function getVetSubtypeColor(vetSubtype: VetSubtype): string {
  if (vetSubtype === 'emergency') return colors.poi.vetEmergency;
  if (vetSubtype === 'hours_24') return colors.poi.vetHours24;
  return colors.poi.vetStandard;
}

export function PoiDetailModal({ visible, poi, onClose }: PoiDetailModalProps) {
  const { t } = useTranslation();

  if (!poi) {
    return null;
  }

  const poiColor = getPoiColor(poi.poi_type, poi.vet_subtype);

  const handleAddressPress = () => {
    const query = encodeURIComponent(
      `${poi.name}${poi.address ? ' ' + poi.address : ''}`,
    );
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  const handlePhonePress = () => {
    if (poi.phone) {
      Linking.openURL(`tel:${poi.phone}`);
    }
  };

  const handleEmailPress = () => {
    if (poi.email) {
      Linking.openURL(`mailto:${poi.email}`);
    }
  };

  const handleWebsitePress = () => {
    if (poi.url) {
      Linking.openURL(poi.url);
    }
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
            <View style={[styles.header, { borderBottomColor: poiColor }]}>
              <View style={styles.headerContent}>
                <View style={[styles.typeBadge, { backgroundColor: poiColor }]}>
                  <Text style={styles.typeBadgeText}>
                    {getPoiTypeLabel(poi.poi_type, t)}
                  </Text>
                </View>
                <Text style={styles.title}>{poi.name}</Text>

                {poi.poi_type === 'vet_clinic' && poi.vet_subtype && (
                  <View
                    style={[
                      styles.subtypeBadge,
                      {
                        backgroundColor: getVetSubtypeColor(poi.vet_subtype),
                      },
                    ]}
                  >
                    <Text style={styles.subtypeBadgeText}>
                      {getVetSubtypeLabel(poi.vet_subtype, t)}
                    </Text>
                  </View>
                )}
              </View>

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
              {/* Address row — clickable, opens Google Maps */}
              {poi.address && (
                <Pressable
                  style={styles.infoRow}
                  onPress={handleAddressPress}
                  accessibilityLabel={t('poi.openInMaps')}
                  accessibilityRole="link"
                >
                  <MapPin
                    size={iconSizes.inline}
                    color={poiColor}
                    strokeWidth={2}
                  />
                  <BodySmall color={colors.neutral700} style={styles.infoText}>
                    {poi.address}
                  </BodySmall>
                </Pressable>
              )}

              {/* Phone row */}
              {poi.phone && (
                <Pressable
                  style={styles.infoRow}
                  onPress={handlePhonePress}
                  accessibilityLabel={t('poi.callPhone')}
                  accessibilityRole="link"
                >
                  <Phone
                    size={iconSizes.inline}
                    color={colors.success}
                    strokeWidth={2}
                  />
                  <BodySmall color={colors.neutral700} style={styles.infoText}>
                    {poi.phone}
                  </BodySmall>
                </Pressable>
              )}

              {/* Email row */}
              {poi.email && (
                <Pressable
                  style={styles.infoRow}
                  onPress={handleEmailPress}
                  accessibilityLabel={t('poi.sendEmail')}
                  accessibilityRole="link"
                >
                  <Mail
                    size={iconSizes.inline}
                    color={colors.info}
                    strokeWidth={2}
                  />
                  <BodySmall color={colors.neutral700} style={styles.infoText}>
                    {poi.email}
                  </BodySmall>
                </Pressable>
              )}

              {/* Hours row — display only */}
              {poi.hours && (
                <View style={styles.infoRow}>
                  <Clock
                    size={iconSizes.inline}
                    color={colors.neutral500}
                    strokeWidth={2}
                  />
                  <BodySmall color={colors.neutral700} style={styles.infoText}>
                    {poi.hours}
                  </BodySmall>
                </View>
              )}

              {/* Website row */}
              {poi.url && (
                <Pressable
                  style={styles.infoRow}
                  onPress={handleWebsitePress}
                  accessibilityLabel={t('poi.openWebsite')}
                  accessibilityRole="link"
                >
                  <ExternalLink
                    size={iconSizes.inline}
                    color={colors.primary}
                    strokeWidth={2}
                  />
                  <BodySmall color={colors.neutral700} style={styles.infoText}>
                    {t('poi.website')}
                  </BodySmall>
                </Pressable>
              )}

              {/* Capacity row — for shelters */}
              {poi.poi_type === 'animal_shelter' && poi.capacity !== null && (
                <View style={styles.infoRow}>
                  <Heart
                    size={iconSizes.inline}
                    color={colors.poi.shelter}
                    strokeWidth={2}
                  />
                  <BodySmall color={colors.neutral700} style={styles.infoText}>
                    {t('poi.capacityAnimals', { count: poi.capacity })}
                  </BodySmall>
                </View>
              )}
            </ScrollView>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    maxHeight: '80%',
    maxWidth: 600,
    width: '90%',
    ...shadowStyles.elevated,
  },
  closeButton: {
    padding: spacing.xs,
  },
  header: {
    alignItems: 'flex-start',
    borderBottomColor: colors.neutral200,
    borderBottomWidth: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerContent: {
    flex: 1,
    gap: spacing.sm,
    marginRight: spacing.sm,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    minHeight: 44,
  },
  infoText: {
    flex: 1,
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
  subtypeBadge: {
    alignSelf: 'flex-start',
    borderRadius: borderRadius.tag,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  subtypeBadgeText: {
    color: colors.white,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  title: {
    color: colors.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.h2.fontSize,
    fontWeight: '700',
  },
  typeBadge: {
    alignSelf: 'flex-start',
    borderRadius: borderRadius.tag,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  typeBadgeText: {
    color: colors.white,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
});
