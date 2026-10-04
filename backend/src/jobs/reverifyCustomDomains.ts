import { Store } from "../models/Store";
import { checkTxtVerification } from "../utils/dnsVerify";
import { cacheDelTenantStore } from "../utils/cache";
import { refreshCustomDomainCache } from "../utils/customDomainCache";
import { removeDomainFromVercel } from "../utils/vercel";

// কতবার পরপর TXT miss হলে domain revoke হবে (transient DNS blip-এ সাইট ডাউন হবে না)
export const REVERIFY_FAIL_LIMIT = 3;

export interface ReverifySummary {
    checked: number;
    stillOk: number;
    failedOnce: number;
    revoked: number;
    skipped: number;
}

type TxtCheck = (domain: string, code: string) => Promise<boolean>;

// Daily job — verified custom domain-গুলোর DNS ownership এখনো আছে কিনা দেখে।
// TXT পরপর ৩ দিন missing থাকলে status → "failed" (tenant resolve বন্ধ), Vercel থেকে সরানো হয়।
// check param শুধু test-এর জন্য inject করা যায়; production-এ real DNS check চলে।
export const reverifyCustomDomains = async (check: TxtCheck = checkTxtVerification): Promise<ReverifySummary> => {
    const summary: ReverifySummary = { checked: 0, stillOk: 0, failedOnce: 0, revoked: 0, skipped: 0 };

    const stores = await Store.find({
        customDomainStatus: "verified",
        customDomain: { $ne: null },
    }).select("_id subdomain customDomain customDomainVerificationCode customDomainFailedChecks customDomainStatus");

    for (const store of stores) {
        const domain = store.customDomain as unknown as string;
        const code = store.customDomainVerificationCode as unknown as string;
        // legacy verified entry-তে code না থাকলে re-check সম্ভব না — skip (grandfathered)
        if (!domain || !code) {
            summary.skipped++;
            continue;
        }
        summary.checked++;

        let ok = false;
        try {
            ok = await check(domain, code);
        } catch {
            ok = false;
        }

        if (ok) {
            if ((store.customDomainFailedChecks || 0) > 0) {
                store.customDomainFailedChecks = 0;
                await store.save();
            }
            summary.stillOk++;
            continue;
        }

        const fails = (store.customDomainFailedChecks || 0) + 1;
        store.customDomainFailedChecks = fails;

        if (fails >= REVERIFY_FAIL_LIMIT) {
            store.customDomainStatus = "failed";
            store.customDomainFailedChecks = 0;
            await store.save();
            await cacheDelTenantStore(store.subdomain, domain);
            await refreshCustomDomainCache();
            // Vercel থেকে সরানো (non-blocking — fail হলেও revoke বহাল)
            try {
                const vercel = await removeDomainFromVercel(domain);
                if (!vercel.ok && !vercel.skipped) {
                    console.error(`[REVERIFY] Vercel remove failed for ${domain}: ${vercel.message}`);
                }
            } catch (error) {
                console.error(`[REVERIFY] Vercel remove threw for ${domain}: ${(error as Error).message}`);
            }
            console.warn(`[REVERIFY] Revoked custom domain ${domain} (TXT missing ${fails}x)`);
            summary.revoked++;
        } else {
            await store.save();
            console.warn(`[REVERIFY] TXT missing for ${domain} (${fails}/${REVERIFY_FAIL_LIMIT})`);
            summary.failedOnce++;
        }
    }

    return summary;
};
