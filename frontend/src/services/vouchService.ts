// Vouch service helper
import { Vouch } from '@getvouch/sdk';

export type VouchConfig = {
  requestId: string;
  datasourceId: string;
  customerId: string;
  inputs?: Record<string, unknown>;
  redirectBackUrl: string;
  webhookUrl?: string;
};

export const launchVouch = async (config: VouchConfig): Promise<void> => {
  try {
    const vouch = new Vouch();
    const payload: Record<string, unknown> = {
      requestId: config.requestId,
      datasourceId: config.datasourceId,
      customerId: config.customerId,
      redirectBackUrl: config.redirectBackUrl,
      webhookUrl: config.webhookUrl,
    };
    if (config.inputs && Object.keys(config.inputs).length > 0) {
      payload.inputs = config.inputs;
    }
    const verificationUrl = vouch.getStartUrl(payload as any);
    window.location.href = verificationUrl.toString();
  } catch (error) {
    console.error('Error launching vouch:', error);
    throw error;
  }
};

