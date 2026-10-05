// Steadfast courier client — https://portal.packzy.com/api/v1
// Auth: Api-Key + Secret-Key headers (vendor-এর নিজের key, Store-এ encrypted থাকে)।

const BASE_URL = process.env.STEADFAST_BASE_URL || "https://portal.packzy.com/api/v1";
const TIMEOUT_MS = 15000;

export interface SteadfastCreds {
    apiKey: string;
    secretKey: string;
}

export interface ConsignmentInput {
    invoice: string;
    recipientName: string;
    recipientPhone: string;
    recipientAddress: string;
    codAmount: number;
    note?: string;
}

export interface ConsignmentResult {
    consignmentId: string;
    trackingCode: string;
    invoice: string;
    raw: unknown;
}

type FetchFn = typeof fetch;

const callApi = async (
    creds: SteadfastCreds,
    path: string,
    init: RequestInit = {},
    doFetch: FetchFn = fetch
): Promise<any> => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
        const res = await doFetch(`${BASE_URL}${path}`, {
            ...init,
            headers: {
                "Content-Type": "application/json",
                "Api-Key": creds.apiKey,
                "Secret-Key": creds.secretKey,
                ...(init.headers || {}),
            },
            signal: ctrl.signal,
        });
        const body = (await res.json().catch(() => ({}))) as any;
        if (!res.ok || (body.status !== undefined && body.status !== 200 && body.status !== "success")) {
            throw new Error(body.message || `Steadfast API error (${res.status})`);
        }
        return body;
    } catch (error: any) {
        if (error?.name === "AbortError") throw new Error("Steadfast request timed out");
        throw error;
    } finally {
        clearTimeout(timer);
    }
};

// Consignment তৈরি — COD order Steadfast-এ পাঠানো
export const createConsignment = async (
    creds: SteadfastCreds,
    input: ConsignmentInput,
    doFetch: FetchFn = fetch
): Promise<ConsignmentResult> => {
    const body = await callApi(
        creds,
        "/create_order",
        {
            method: "POST",
            body: JSON.stringify({
                invoice: input.invoice,
                recipient_name: input.recipientName,
                recipient_phone: input.recipientPhone,
                recipient_address: input.recipientAddress,
                cod_amount: input.codAmount,
                ...(input.note ? { note: input.note } : {}),
            }),
        },
        doFetch
    );
    const c = body.consignment || body.data || body;
    const consignmentId = String(c.consignment_id || c.consignmentId || "");
    const trackingCode = String(c.tracking_code || c.trackingCode || "");
    if (!consignmentId) throw new Error(body.message || "Steadfast consignment failed (no consignment_id)");
    return { consignmentId, trackingCode, invoice: input.invoice, raw: body };
};

// Consignment status — consignment_id দিয়ে
export const getConsignmentStatus = async (
    creds: SteadfastCreds,
    consignmentId: string,
    doFetch: FetchFn = fetch
): Promise<{ status: string; raw: unknown }> => {
    const body = await callApi(creds, `/order_status_by_cid/${encodeURIComponent(consignmentId)}`, {}, doFetch);
    const status = String(
        body.delivery_status || body.status_text || body.deliveryStatus || body.status || "unknown"
    );
    return { status, raw: body };
};

// Merchant balance check (key valid কিনা যাচাইতেও ব্যবহার হয়)
export const checkSteadfastBalance = async (
    creds: SteadfastCreds,
    doFetch: FetchFn = fetch
): Promise<{ balance: number; raw: unknown }> => {
    const body = await callApi(creds, "/check_balance", {}, doFetch);
    return { balance: Number(body.balance ?? body.current_balance ?? 0), raw: body };
};
