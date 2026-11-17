export type PublicPageId =
  | 'home'
  | 'about'
  | 'vision-mission'
  | 'beliefs'
  | 'ministries'
  | 'life-groups'
  | 'prayer'
  | 'events'
  | 'first-time'
  | 'contact';

export interface PublicNavRoute {
  id: PublicPageId;
  label: string;
  badge?: string;
}
