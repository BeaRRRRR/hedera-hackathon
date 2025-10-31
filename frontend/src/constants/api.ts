const BASE = String(import.meta.env.VITE_YUMI_BACKEND_URL || '').replace(/\/$/, '');

export const API_ENDPOINTS = {
    ZK_ME_ACCESS_TOKEN: `${BASE}/zkme/access-token`,
    DEBANK_PORTFOLIO: `${BASE}/debank/portfolio`,
} as const;
