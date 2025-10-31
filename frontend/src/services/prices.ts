type PriceMap = Record<string, number>;

type CoinbaseSpotResponse = {
    data?: {
        base?: string;
        currency?: string;
        amount?: string;
    };
};

type JsonWithOptionalError = {
    result?: unknown;
    error?: { code: number; message: string };
};

const cache: {
    prices: PriceMap | null;
    updatedAt: number | null;
} = {
    prices: null,
    updatedAt: null,
};

const CACHE_TTL_MS = 60_000;

let inFlight: Promise<PriceMap> | null = null;
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;
const timestamps: number[] = [];
async function enforceRateLimit(): Promise<void> {
    const now = Date.now();
    while (
        timestamps.length > 0 &&
        now - timestamps[0] >= RATE_LIMIT_WINDOW_MS
    ) {
        timestamps.shift();
    }
    if (timestamps.length >= RATE_LIMIT_MAX) {
        const waitMs = RATE_LIMIT_WINDOW_MS - (now - timestamps[0]);
        await new Promise((r) => setTimeout(r, waitMs + 25));
        const after = Date.now();
        while (
            timestamps.length > 0 &&
            after - timestamps[0] >= RATE_LIMIT_WINDOW_MS
        ) {
            timestamps.shift();
        }
    }
    timestamps.push(Date.now());
}

async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry<T>(
    fn: () => Promise<T>,
    retries: number,
    baseDelayMs = 500
): Promise<T> {
    try {
        return await fn();
    } catch (e) {
        if (retries <= 0) throw e;
        const message = e instanceof Error ? e.message : String(e);
        const is429 = message.includes('429');
        const delay =
            baseDelayMs * Math.pow(2, 2 - retries) + Math.random() * 200;
        if (is429) await sleep(delay);
        return fetchWithRetry(fn, retries - 1, baseDelayMs);
    }
}

export async function fetchUsdPrices(): Promise<PriceMap> {
    const now = Date.now();
    if (
        cache.prices &&
        cache.updatedAt &&
        now - cache.updatedAt < CACHE_TTL_MS
    ) {
        return cache.prices;
    }

    if (inFlight) return inFlight;

    inFlight = (async () => {
        try {
            const fetchFn = async () => {
                await enforceRateLimit();
                const res = await fetch(
                    'https://api.coinbase.com/v2/prices/ETH-USD/spot'
                );
                if (!res.ok) throw new Error(`Coinbase error: ${res.status}`);
                const data = (await res.json()) as CoinbaseSpotResponse;
                const ethUsd = Number(data?.data?.amount ?? 0);
                const prices: PriceMap = {
                    ETH: ethUsd,
                    USDC: 1,
                };
                return prices;
            };

            const prices = await fetchWithRetry(fetchFn, 2);
            cache.prices = prices;
            cache.updatedAt = now;
            return prices;
        } catch (_e) {
            return (
                cache.prices || {
                    ETH: 0,
                    USDC: 1,
                }
            );
        } finally {
            inFlight = null;
        }
    })();

    return inFlight;
}

export async function getUsdPrice(symbol: 'ETH' | 'USDC'): Promise<number> {
    const prices = await fetchUsdPrices();
    return prices[symbol];
}
