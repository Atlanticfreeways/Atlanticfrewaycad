const ALLOWED_HOSTS = [
  'localhost',
  'api.atlanticfrewaycard.com',
  'sandbox-api.marqeta.com',
  'api.marqeta.com'
];

const BLOCKED_IPS = [
  '0.0.0.0',
  '169.254.169.254'
];

export const isValidUrl = (urlString: string): boolean => {
  try {
    const url = new URL(urlString);
    
    if (!['http:', 'https:'].includes(url.protocol)) {
      return false;
    }

    if (BLOCKED_IPS.includes(url.hostname)) {
      return false;
    }

    return ALLOWED_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
};

export const getApiUrl = (path: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3000/api/v1';
  return `${baseUrl}${path}`;
};
