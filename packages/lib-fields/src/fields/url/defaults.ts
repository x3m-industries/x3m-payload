export type URLType =
  | 'facebook'
  | 'facebookAccount'
  | 'instagram'
  | 'instagramAccount'
  | 'linkedin'
  | 'linkedinAccount'
  | 'url'
  | 'website'
  | 'x'
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
    label: 'Facebook Page URL',
    placeholder: 'https://www.facebook.com/...',
    regex: /^https?:\/\/(www\.)?facebook\.com\/.+/i,
  },
  facebookAccount: {
    name: 'facebookAccount',
    isUrl: true,
    label: 'Facebook Profile URL',
    placeholder: 'https://www.facebook.com/...',
    regex: /^https?:\/\/(www\.)?facebook\.com\/.+/i,
  },
  instagram: {
    name: 'instagram',
    isUrl: true,
    label: 'Instagram Page URL',
    placeholder: 'https://www.instagram.com/...',
    regex: /^https?:\/\/(www\.)?instagram\.com\/.+/i,
  },
  instagramAccount: {
    name: 'instagramAccount',
    isUrl: true,
    label: 'Instagram Profile URL',
    placeholder: 'https://www.instagram.com/...',
    regex: /^https?:\/\/(www\.)?instagram\.com\/.+/i,
  },
  linkedin: {
    name: 'linkedin',
    isUrl: true,
    label: 'LinkedIn Page URL',
    placeholder: 'https://www.linkedin.com/...',
    regex: /^https?:\/\/(www\.)?linkedin\.com\/.+/i,
  },
  linkedinAccount: {
    name: 'linkedinAccount',
    isUrl: true,
    label: 'LinkedIn Profile URL',
    placeholder: 'https://www.linkedin.com/...',
    regex: /^https?:\/\/(www\.)?linkedin\.com\/(in|company|school)\/.+/i,
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
  x: {
    name: 'x',
    isUrl: true,
    label: 'X Page URL',
    placeholder: 'https://x.com/...',
    regex: /^https?:\/\/(www\.)?(x|twitter)\.com\/.+/i,
  },
  xAccount: {
    name: 'xAccount',
    isUrl: true,
    label: 'X Profile URL',
    placeholder: 'https://x.com/...',
    regex: /^https?:\/\/(www\.)?(x|twitter)\.com\/\w+$/i,
  },
};

export const URL_LIKE_TYPES = Object.entries(URLTypeDefaults)
  .filter(([_, d]) => d.isUrl)
  .map(([k]) => k as URLType);
