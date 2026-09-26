// Vercel Domains API automation — vendor verify সফল হলেই platform প্রজেক্টে
// custom domain auto-add হবে, vendor-কে Vercel ড্যাশবোর্ডে ঢুকতে হবে না।
// Env: VERCEL_TOKEN, VERCEL_PROJECT_ID, VERCEL_TEAM_ID (optional), VERCEL_AUTO_ADD_DOMAIN (default: true)

export interface VercelResult {
    ok: boolean;
    skipped?: boolean;
    message?: string;
}

const isEnabled = (): boolean => {
    if ((process.env.VERCEL_AUTO_ADD_DOMAIN || "true").toLowerCase() === "false") return false;
    return !!(process.env.VERCEL_TOKEN && process.env.VERCEL_PROJECT_ID);
};

const teamQuery = (): string => {
    const teamId = process.env.VERCEL_TEAM_ID;
    return teamId ? `?teamId=${encodeURIComponent(teamId)}` : "";
};

export const addDomainToVercel = async (domain: string): Promise<VercelResult> => {
    if (!isEnabled()) {
        return { ok: false, skipped: true, message: "Vercel automation not configured (missing token/project)." };
    }

    try {
        const projectId = process.env.VERCEL_PROJECT_ID as string;
        const res = await fetch(`https://api.vercel.com/v10/projects/${projectId}/domains${teamQuery()}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: domain }),
        });

        const data = (await res.json().catch(() => ({}))) as { name?: string; error?: { message?: string; code?: string } };

        if (res.ok) {
            return { ok: true, message: `Domain ${data.name || domain} added to Vercel.` };
        }

        // domain আগে থেকেই প্রজেক্টে থাকলে — এটাকে failure ধরবো না
        if (data?.error?.code === "domain_already_in_use" || /already/i.test(data?.error?.message || "")) {
            return { ok: true, message: "Domain already present on Vercel." };
        }

        return { ok: false, message: data?.error?.message || `Vercel API error (${res.status}).` };
    } catch (error) {
        return { ok: false, message: (error as Error).message || "Vercel API call failed." };
    }
};

export const removeDomainFromVercel = async (domain: string): Promise<VercelResult> => {
    if (!isEnabled()) {
        return { ok: false, skipped: true, message: "Vercel automation not configured (missing token/project)." };
    }

    try {
        const projectId = process.env.VERCEL_PROJECT_ID as string;
        const res = await fetch(
            `https://api.vercel.com/v9/projects/${projectId}/domains/${encodeURIComponent(domain)}${teamQuery()}`,
            {
                method: "DELETE",
                headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` },
            }
        );

        if (res.ok || res.status === 404) {
            return { ok: true, message: "Domain removed from Vercel." };
        }

        const data = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
        return { ok: false, message: data?.error?.message || `Vercel API error (${res.status}).` };
    } catch (error) {
        return { ok: false, message: (error as Error).message || "Vercel API call failed." };
    }
};