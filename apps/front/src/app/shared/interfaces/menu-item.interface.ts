export interface MenuItem {
  key: string;
  label: string;
  icon: string;
  badge?: number;
  disabled?: boolean;
}

export type MenuVariant = 'bottom' | 'sidebar';
