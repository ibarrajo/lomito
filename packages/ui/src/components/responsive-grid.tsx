import {
  View,
  StyleSheet,
  useWindowDimensions,
  type ViewStyle,
} from 'react-native';
import { spacing } from '../theme/tokens';

interface ResponsiveGridProps {
  children: React.ReactNode;
  minColumnWidth?: number;
  gap?: number;
  style?: ViewStyle;
}

export function ResponsiveGrid({
  children,
  minColumnWidth = 300,
  gap = spacing.md,
  style,
}: ResponsiveGridProps) {
  const { width } = useWindowDimensions();

  // Calculate column count based on available width
  const columns = Math.max(1, Math.floor(width / minColumnWidth));
  const childWidth = `${100 / columns}%` as const;

  return (
    <View style={[styles.grid, { gap }, style]}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <View
              key={index}
              style={{ width: childWidth, paddingHorizontal: gap / 2 }}
            >
              {child}
            </View>
          ))
        : children}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
