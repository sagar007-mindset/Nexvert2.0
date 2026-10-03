// Privacy-Preserving Event Tracking Utility for Nexvert (https://nexvert.online)

export interface ConversionEventParams {
  toolName: string;
  inputFormat?: string;
  outputFormat?: string;
  fileSizeBytes?: number;
  durationMs?: number;
  errorMessage?: string;
}

export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

export function getTrafficSource(): string {
  if (typeof window === 'undefined') return 'direct';
  const referrer = document.referrer;
  if (!referrer) return 'direct';
  try {
    const url = new URL(referrer);
    if (url.hostname === window.location.hostname) return 'internal';
    if (url.hostname.includes('google')) return 'organic_google';
    if (url.hostname.includes('bing') || url.hostname.includes('duckduckgo') || url.hostname.includes('yahoo')) return 'organic_other';
    if (url.hostname.includes('youtube')) return 'social_youtube';
    if (url.hostname.includes('tiktok')) return 'social_tiktok';
    if (url.hostname.includes('reddit')) return 'community_reddit';
    if (url.hostname.includes('twitter') || url.hostname.includes('x.com')) return 'social_twitter';
    if (url.hostname.includes('facebook') || url.hostname.includes('instagram')) return 'social_meta';
    return url.hostname;
  } catch (e) {
    return 'referral';
  }
}

export function trackEvent(eventName: string, params: Record<string, any> = {}) {
  const payload = {
    ...params,
    deviceType: getDeviceType(),
    trafficSource: getTrafficSource(),
    timestamp: new Date().toISOString()
  };

  // Log to Google Analytics (gtag) if present
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, payload);
  }

  // Developer debug logging in non-production
  if ((import.meta as any).env?.DEV) {
    console.log(`[Analytics Event: ${eventName}]`, payload);
  }
}

// Dedicated Helper Functions for Conversion Funnel Tracking
export const Analytics = {
  toolViewed: (toolName: string, inputFormat?: string, outputFormat?: string) => {
    trackEvent('tool_page_viewed', { toolName, inputFormat, outputFormat });
  },

  uploadButtonClicked: (toolName: string) => {
    trackEvent('upload_button_clicked', { toolName });
  },

  fileSelected: (params: ConversionEventParams) => {
    trackEvent('file_selected', {
      toolName: params.toolName,
      inputFormat: params.inputFormat,
      fileSizeBytes: params.fileSizeBytes
    });
  },

  conversionStarted: (params: ConversionEventParams) => {
    trackEvent('conversion_started', {
      toolName: params.toolName,
      inputFormat: params.inputFormat,
      outputFormat: params.outputFormat,
      fileSizeBytes: params.fileSizeBytes
    });
  },

  conversionCompleted: (params: ConversionEventParams) => {
    trackEvent('conversion_completed', {
      toolName: params.toolName,
      inputFormat: params.inputFormat,
      outputFormat: params.outputFormat,
      durationMs: params.durationMs
    });
  },

  downloadClicked: (params: ConversionEventParams) => {
    trackEvent('download_clicked', {
      toolName: params.toolName,
      inputFormat: params.inputFormat,
      outputFormat: params.outputFormat
    });
  },

  conversionFailed: (params: ConversionEventParams) => {
    trackEvent('conversion_failed', {
      toolName: params.toolName,
      inputFormat: params.inputFormat,
      outputFormat: params.outputFormat,
      errorMessage: params.errorMessage
    });
  }
};

export const toolViewed = Analytics.toolViewed;
export const uploadButtonClicked = Analytics.uploadButtonClicked;
export const fileSelected = Analytics.fileSelected;
export const conversionStarted = Analytics.conversionStarted;
export const conversionCompleted = Analytics.conversionCompleted;
export const downloadClicked = Analytics.downloadClicked;
export const conversionFailed = Analytics.conversionFailed;

export default Analytics;

