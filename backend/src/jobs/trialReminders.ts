import { Store } from "../models/Store";
import { User } from "../models/User";
import { Subscription } from "../models/Subscription";
import { sendTrialReminderEmail, type TrialReminderData } from "../utils/sendEmail";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface TrialReminderSummary {
    checked: number;
    sent3d: number;
    sent1d: number;
    sentExpired: number;
    skipped: number;
}

type SendFn = (data: TrialReminderData) => Promise<void>;

// Daily job — trial (pro plan, paid subscription নেই) store-গুলোকে মেয়াদ শেষের আগে মনে করানো।
// ৩ দিন + ১ দিন + expired — প্রতিটা একবারই যায় (Store marker), renew হলে reset হয়।
// sendFn শুধু test-এর জন্য inject করা যায়; production-এ real Resend email যায়।
export const sendTrialReminders = async (send: SendFn = sendTrialReminderEmail): Promise<TrialReminderSummary> => {
    const summary: TrialReminderSummary = { checked: 0, sent3d: 0, sent1d: 0, sentExpired: 0, skipped: 0 };
    const now = new Date();
    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/+$/, "");

    const stores = await Store.find({
        plan: "pro",
        status: "active",
        planExpiresAt: { $ne: null },
    }).select("_id vendorId storeName planExpiresAt trialReminder3dSentAt trialReminder1dSentAt trialExpiredSentAt");

    for (const store of stores) {
        // paid subscription থাকলে trial না — reminder দরকার নেই
        const paid = await Subscription.exists({ storeId: store._id, status: "active" });
        if (paid) {
            summary.skipped++;
            continue;
        }
        const expiresAt = store.planExpiresAt as unknown as Date;
        if (!expiresAt) {
            summary.skipped++;
            continue;
        }
        summary.checked++;
        const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / DAY_MS);

        const vendor = await User.findById(store.vendorId).select("name email").lean();
        if (!vendor?.email) {
            summary.skipped++;
            continue;
        }

        const payload = {
            to: vendor.email,
            name: vendor.name || "Vendor",
            storeName: store.storeName,
            billingUrl: `${frontendUrl}/dashboard/billing`,
        };

        try {
            if (daysLeft <= 0) {
                if (!store.trialExpiredSentAt) {
                    await send({ ...payload, daysLeft: 0 });
                    store.trialExpiredSentAt = now;
                    await store.save();
                    summary.sentExpired++;
                }
            } else if (daysLeft <= 1) {
                if (!store.trialReminder1dSentAt) {
                    await send({ ...payload, daysLeft });
                    store.trialReminder1dSentAt = now;
                    await store.save();
                    summary.sent1d++;
                }
            } else if (daysLeft <= 3) {
                if (!store.trialReminder3dSentAt) {
                    await send({ ...payload, daysLeft });
                    store.trialReminder3dSentAt = now;
                    await store.save();
                    summary.sent3d++;
                }
            }
        } catch (error) {
            console.error(`[TRIAL] failed for ${store.storeName}: ${(error as Error).message}`);
        }
    }

    return summary;
};
