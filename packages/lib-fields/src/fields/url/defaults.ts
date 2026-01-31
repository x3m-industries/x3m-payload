export type URLType =
  | 'facebook'
  | 'facebookAccount'
  | 'instagramAccount'
  | 'linkedin'
  | 'linkedinAccount'
  | 'url'
  | 'website'
  | 'xAccount';

export interface URLFieldDefaults {
  isUrl?: boolean;
  label: string;
  name: string;
  placeholder?: string;
  regex?: RegExp;
}

export const URLTypeDefaults: Record<URLType, URLFieldDefaults> = {
  facebook: {
    name: 'facebook',
    isUrl: true,
    label: 'Facebook URL',
    placeholder: 'https://www.facebook.com/username',
    regex: /^https?:\/\/(www\.)?facebook\.com\/.+/i,
  },
  facebookAccount: {
    name: 'facebookAccount',
    label: 'Facebook Account',
    placeholder: 'username',
    regex: /^[a-z0-9.]+$/i,
  },
  instagramAccount: {
    name: 'instagramAccount',
    label: 'Instagram Account',
    placeholder: 'username',
    regex: /^[\w.]+$/,
  },
  linkedin: {
    name: 'linkedin',
    isUrl: true,
    label: 'LinkedIn URL',
    placeholder: 'https://www.linkedin.com/in/username or /company/name',
    regex: /^https?:\/\/(www\.)?linkedin\.com\/(in|company|school)\/.+/i,
  },
  linkedinAccount: {
    name: 'linkedinAccount',
    label: 'LinkedIn Account',
    placeholder: 'username',
    regex: /^[a-z0-9-]+$/i,
  },
  url: {
    name: 'url',
    isUrl: true,
    label: 'URL',
    placeholder: 'https://example.com',
    regex: /^https?:\/\/.+/i,
  },
  website: {
    name: 'website',
    isUrl: true,
    label: 'Website',
    placeholder: 'https://example.com',
    regex: /^https?:\/\/.+/i,
  },
  xAccount: {
    name: 'xAccount',
    label: 'X Account',
    placeholder: '@username',
    regex: /^@?\w{1,15}$/,
  },
};

export const URL_LIKE_TYPES = Object.entries(URLTypeDefaults)
  .filter(([_, d]) => d.isUrl)
  .map(([k]) => k as URLType);
