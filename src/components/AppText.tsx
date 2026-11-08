import { Text, type TextProps } from 'react-native';

import { typography } from '@/theme/theme';

interface AppTextProps extends TextProps {
  variant?: keyof typeof typography;
}

export const AppText = ({ variant = 'body', style, ...props }: AppTextProps) => {
  return <Text style={[typography[variant], style]} {...props} />;
};
