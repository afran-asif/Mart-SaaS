import Redis from "ioredis";

// Redis cache — pure optimization layer. REDIS_URL না থাকলে বা Redis down হলে
// সব helper silently DB-fallback-এ চলে (app কখনো ভাঙবে না)।
let client: Redis | null = null;
let warned = false;

const warnOnce = (msg: string) => {
    if (!warned) {
        warned = true;
        console.warn(`⚠️ [CACHE] ${msg} — running without cache.`);
    }
};

export const getCache = (): Redis | null => {
    if (client) return client;
    const url = process.env.REDIS_URL;
    if (!url) return null;
    try {
        client = new Redis(url, {
            maxRetriesPerRequest: 1,
            enableReadyCheck: true,
            lazyConnect: false,
        });
        client.on("error", () => warnOnce("Redis unreachable"));
        return client;
    } catch {
        warnOnce("Redis init failed");
        return null;
    }
};

export const cacheGet = async <T>(key: string): Promise<T | null> => {
    const c = getCache();
    if (!c) return null;
    try {
        const raw = await c.get(key);
        if (!raw) return null;
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
};

export const cacheSet = async (key: string, value: unknown, ttlSeconds: number): Promise<void> => {
    const c = getCache();
    if (!c) return;
    try {
        await c.set(key, JSON.stringify(value), "EX", ttlSeconds);
    } catch {
        /* cache write fail = DB fallback, সমস্যা নেই */
    }
};

export const cacheDel = async (...keys: (string | undefined | null)[]): Promise<void> => {
    const c = getCache();
    if (!c) return;
    const valid = keys.filter((k): k is string => !!k);
    if (valid.length === 0) return;
    try {
        await c.del(...valid);
    } catch {
        /* ignore */
    }
};

export const cacheKeys = {
    tenantStore: (identifier: string) => `tenant:store:${identifier.toLowerCase()}`,
    plan: (slug: string) => `plan:${slug}`,
    tenantCategories: (storeId: string) => `tenant:cats:${storeId}`,
};

// store বদলালে তার সব tenant cache key মুছে ফেলা (subdomain + customDomain দুটোই)
export const cacheDelTenantStore = async (subdomain?: string | null, customDomain?: string | null): Promise<void> => {
    await cacheDel(
        subdomain ? cacheKeys.tenantStore(subdomain) : null,
        customDomain ? cacheKeys.tenantStore(customDomain) : null
    );
};

export const TTL = {
    TENANT_STORE: 5 * 60,
    PLAN: 60 * 60,
    TENANT_CATEGORIES: 5 * 60,
};
