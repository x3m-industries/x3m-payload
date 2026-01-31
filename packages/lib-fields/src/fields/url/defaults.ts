/**
 * Core platforms supported.
 */
export type URLType =
  | 'custom'
  | 'facebook'
  | 'instagram'
  | 'linkedin'
  | 'tiktok'
  | 'url'
  | 'website'
  | 'whatsapp'
  | 'x'
  | 'youtube';

export interface URLFieldDefaults {
  accountRegex?: RegExp; // Specific pattern if isAccount is true
  baseRegex: RegExp;
  label: string;
  name: string;
  placeholder: string;
}

/**
 * Shared regex snippets
 */
const PROTOCOL = /https?:\/\//i;
const FB_BASE = /(https?:\/\/)?(www\.|m\.)?facebook\.com\//i;
const IG_BASE = /(https?:\/\/)?(www\.)?instagram\.com\//i;
const LI_BASE = /(https?:\/\/)?(www\.)?linkedin\.com\//i;
const TT_BASE = /(https?:\/\/)?(www\.)?tiktok\.com\//i;
const WA_BASE = /(https?:\/\/)?(wa\.me|api\.whatsapp\.com\/send\?phone=)/i;
const X_BASE = /(https?:\/\/)?(www\.)?(x|twitter)\.com\//i;
const YT_BASE = /(https?:\/\/)?(www\.)?youtube\.com\//i;

export const URLTypeDefaults: Record<URLType, URLFieldDefaults> = {
  custom: {
    name: 'custom',
    baseRegex: new RegExp(`^${PROTOCOL.source}`, 'i'),
    label: 'Custom URL',
    placeholder: 'https://...',
  },
  facebook: {
    name: 'facebook',
    accountRegex: new RegExp(`^${FB_BASE.source}[\\w.]+`, 'i'),
    baseRegex: new RegExp(`^${FB_BASE.source}`, 'i'),
    label: 'Facebook',
    placeholder: 'https://www.facebook.com/...',
  },
  instagram: {
    name: 'instagram',
    accountRegex: new RegExp(`^${IG_BASE.source}[\\w.]+/?$`, 'i'),
    baseRegex: new RegExp(`^${IG_BASE.source}`, 'i'),
    label: 'Instagram',
    placeholder: 'https://www.instagram.com/...',
  },
  linkedin: {
    name: 'linkedin',
    accountRegex: new RegExp(`^${LI_BASE.source}(in|company|school|showcase)/.+`, 'i'),
    baseRegex: new RegExp(`^${LI_BASE.source}`, 'i'),
    label: 'LinkedIn',
    placeholder: 'https://www.linkedin.com/...',
  },
  tiktok: {
    name: 'tiktok',
    accountRegex: new RegExp(`^${TT_BASE.source}@[\\w.]+/?$`, 'i'),
    baseRegex: new RegExp(`^${TT_BASE.source}`, 'i'),
    label: 'TikTok',
    placeholder: 'https://www.tiktok.com/@username',
  },
  url: {
    name: 'url',
    baseRegex: new RegExp(`^${PROTOCOL.source}`, 'i'),
    label: 'URL',
    placeholder: 'https://example.com',
  },
  website: {
    name: 'website',
    baseRegex: new RegExp(`^${PROTOCOL.source}`, 'i'),
    label: 'Website',
    placeholder: 'https://example.com',
  },
  whatsapp: {
    name: 'whatsapp',
    baseRegex: new RegExp(`^${WA_BASE.source}`, 'i'),
    label: 'WhatsApp',
    placeholder: 'https://wa.me/1234567890',
  },
  x: {
    name: 'x',
    accountRegex: new RegExp(`^${X_BASE.source}\\w{1,15}/?$`, 'i'),
    baseRegex: new RegExp(`^${X_BASE.source}`, 'i'),
    label: 'X (Twitter)',
    placeholder: 'https://x.com/...',
  },
  youtube: {
    name: 'youtube',
    accountRegex: new RegExp(`^${YT_BASE.source}(@|c/|channel/|user/).+`, 'i'),
    baseRegex: new RegExp(`^${YT_BASE.source}`, 'i'),
    label: 'YouTube',
    placeholder: 'https://www.youtube.com/...',
  },
};

/**
 * Helper to get the correct config based on usage
 */
export const getURLConfig = (type: URLType, isAccount: boolean = false) => {
  const defaults = URLTypeDefaults[type];
  return {
    ...defaults,
    label: isAccount ? `${defaults.label} Profile` : defaults.label,
    regex: isAccount && defaults.accountRegex ? defaults.accountRegex : defaults.baseRegex,
  };
};
