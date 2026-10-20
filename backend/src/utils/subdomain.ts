import { Store } from "../models/Store";

export const RESERVED_SUBDOMAINS = new Set([
    "www", "api", "admin", "app", "mail", "dashboard",
    "store", "shopilika", "mart", "ftp", "blog", "cdn", "static",
]);

export const SUBDOMAIN_REGEX = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;

export const normalizeSubdomain = (value: string): string =>
    String(value || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 30);

export const validateSubdomain = (value: string): string | null => {
    if (!SUBDOMAIN_REGEX.test(value)) {
        return "Subdomain must be 3-30 chars, lowercase letters, numbers or hyphens.";
    }
    if (RESERVED_SUBDOMAINS.has(value)) {
        return "This subdomain is reserved. Please choose another one.";
    }
    return null;
};

export const generateUniqueSubdomain = async (seed: string): Promise<string> => {
    let base = normalizeSubdomain(seed).slice(0, 24);
    while (base.length < 3) base = `store-${base || "shop"}`.slice(0, 24);
    if (RESERVED_SUBDOMAINS.has(base)) base = `${base}-shop`.slice(0, 24);

    let candidate = base;
    let index = 1;
    while (await Store.findOne({ subdomain: candidate })) {
        const suffix = `-${++index}`;
        candidate = `${base.slice(0, 30 - suffix.length)}${suffix}`;
    }
    return candidate;
};
