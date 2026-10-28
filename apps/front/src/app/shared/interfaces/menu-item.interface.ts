export interface MenuItem {
  key: string;
  label: string;
  icon: string;
  badge?: number;
  disabled?: boolean;
  /** Ruta a la que navega el item cuando está definida. */
  route?: string;
}

export type MenuVariant = 'bottom' | 'sidebar';
