export const Platform = {
  OS: 'web' as string,
  select: (options: Record<string, unknown>) => options.web ?? options.default,
};

export const StyleSheet = {
  create: <T extends Record<string, unknown>>(styles: T): T => styles,
};

export const View = 'View';
export const Text = 'Text';
export const Pressable = 'Pressable';
export const ScrollView = 'ScrollView';
export const TouchableOpacity = 'TouchableOpacity';
export const Modal = 'Modal';
