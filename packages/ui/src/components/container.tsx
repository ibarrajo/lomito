import {
  View,
  StyleSheet,
  useWindowDimensions,
  type ViewStyle,
} from 'react-native';
import { layout, breakpoints } from '../theme/tokens';

interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: number;
  style?: ViewStyle;
}

export function Container({
  children,
  maxWidth = layout.maxContentWidth,
  style,
}: ContainerProps) {
  const { width } = useWindowDimensions();

  const paddingHorizontal =
    width >= breakpoints.desktop
      ? layout.containerPadding.desktop
      : width >= breakpoints.tablet
        ? layout.containerPadding.tablet
        : layout.containerPadding.mobile;

  return (
    <View style={[styles.container, { maxWidth, paddingHorizontal }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    width: '100%',
  },
});
