import { API_ENDPOINTS } from '@/constants/api';

export type WalletUsdBalances = {
    ethUsd: number;
    usdcUsd: number;
    totalUsd: number;
};

const BALANCE_CACHE_TTL_MS = 30_000;
const balanceCache: Record<string, { at: number; data: WalletUsdBalances }> = {};
const inFlightByAddress: Record<string, Promise<WalletUsdBalances> | null> = {};

export async function fetchWalletUsdBalances(
    address: string
): Promise<WalletUsdBalances> {
    const checksum = address;
    const now = Date.now();

    const cached = balanceCache[checksum];
    if (cached && now - cached.at < BALANCE_CACHE_TTL_MS) {
        return cached.data;
    }

    if (inFlightByAddress[checksum]) {
        return inFlightByAddress[checksum] as Promise<WalletUsdBalances>;
    }

    const task: Promise<WalletUsdBalances> = (async () => {
        try {
            const url = `${API_ENDPOINTS.DEBANK_PORTFOLIO}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': import.meta.env.VITE_API_KEY as string,
                },
                body: JSON.stringify({ walletAddresses: [checksum] }),
            });
            if (!res.ok) {
                throw new Error(`Portfolio API failed: ${res.status}`);
            }
            const json = (await res.json()) as unknown;
            // New API shape: Array<{ walletAddress, defiBalance, stablecoinBalance, tokensBalance }>
            let totalUsd = 0;
            if (Array.isArray(json)) {
                const lower = checksum.toLowerCase();
                const item = json.find(
                    (e: any) =>
                        e &&
                        typeof e === 'object' &&
                        typeof e.walletAddress === 'string' &&
                        e.walletAddress.toLowerCase() === lower
                ) as
                    | {
                          defiBalance?: number;
                          stablecoinBalance?: number;
                          tokensBalance?: number;
                      }
                    | undefined;
                if (item) {
                    // As requested, only use tokensBalance
                    const tokens = Number(item.tokensBalance || 0);
                    totalUsd = tokens;
                }
            } else if (
                json &&
                typeof json === 'object' &&
                'total_usd_value' in (json as any)
            ) {
                // Backward compatibility with old response
                totalUsd = Number((json as any).total_usd_value || 0);
            }
            const data: WalletUsdBalances = {
                ethUsd: 0,
                usdcUsd: 0,
                totalUsd,
            };
            balanceCache[checksum] = { at: now, data };
            return data;
        } finally {
            inFlightByAddress[checksum] = null;
        }
    })();

    inFlightByAddress[checksum] = task;
    return task;
}
