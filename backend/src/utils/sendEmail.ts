import { Resend } from "resend";

interface OrderEmailData {
    customerEmail: string;
    customerName: string;
    orderId: string;
    storeName: string;
    totalAmount: number;
    shippingAddress: string;
    paymentMethod: string;
    items: Array<{ name: string; quantity: number; price: number }>;
}

export const sendOrderConfirmationEmail = async (data: OrderEmailData) => {
    try {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            console.error("❌ [EMAIL] RESEND_API_KEY is not configured in environment variables!");
            return;
        }

        const resend = new Resend(apiKey);

        const itemRows = data.items
            .map(
                (item) => `
                <tr>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #1a1a1a;">${item.name}</td>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #555555; text-align: center;">${item.quantity}</td>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #1a1a1a; text-align: right;">৳${(item.price * item.quantity).toFixed(2)}</td>
                </tr>`
            )
            .join("");

        const paymentBadgeBg = data.paymentMethod === "COD" ? "#16a34a" : "#2563eb";
        const paymentLabel = data.paymentMethod === "COD" ? "ক্যাশ অন ডেলিভারি (COD)" : "অনলাইন পেমেন্ট (SSLCommerz)";

        const html = `
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>অর্ডার কনফার্মেশন</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: Arial, Helvetica, sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <tr>
        <td style="background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); padding: 36px 40px; text-align: center;">
            <p style="margin: 0 0 4px 0; font-size: 12px; color: rgba(255,255,255,0.75); text-transform: uppercase; letter-spacing: 1.5px;">অর্ডার কনফার্মেশন</p>
            <h1 style="margin: 0; font-size: 26px; color: #ffffff; font-weight: 700;">${data.storeName}</h1>
        </td>
    </tr>

    <!-- Success Badge -->
    <tr>
        <td style="padding: 28px 40px 0 40px; text-align: center;">
            <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                    <td style="background-color: #dcfce7; border-radius: 50px; padding: 8px 20px;">
                        <p style="margin: 0; color: #16a34a; font-size: 14px; font-weight: 600;">✓ আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে!</p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>

    <!-- Greeting -->
    <tr>
        <td style="padding: 24px 40px 0 40px;">
            <p style="margin: 0; font-size: 15px; color: #374151;">প্রিয় <strong>${data.customerName}</strong>,</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280; line-height: 1.7;">আপনার অর্ডারটি গ্রহণ করা হয়েছে। আমরা শীঘ্রই আপনার কাছে পৌঁছে দেওয়ার ব্যবস্থা করব। ধন্যবাদ আমাদের সাথে কেনাকাটা করার জন্য!</p>
        </td>
    </tr>

    <!-- Order ID + Payment Method side by side -->
    <tr>
        <td style="padding: 24px 40px 0 40px;">
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td width="48%" valign="top" style="background-color: #f9fafb; border-radius: 8px; padding: 14px 16px; border: 1px solid #e5e7eb;">
                        <p style="margin: 0 0 4px 0; font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">অর্ডার আইডি</p>
                        <p style="margin: 0; font-family: 'Courier New', Courier, monospace; font-size: 11px; font-weight: 700; color: #111827; word-break: break-all;">${data.orderId}</p>
                    </td>
                    <td width="4%"></td>
                    <td width="48%" valign="top" style="background-color: #f9fafb; border-radius: 8px; padding: 14px 16px; border: 1px solid #e5e7eb;">
                        <p style="margin: 0 0 8px 0; font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">পেমেন্ট পদ্ধতি</p>
                        <table cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="background-color: ${paymentBadgeBg}; border-radius: 50px; padding: 4px 12px;">
                                    <span style="color: #ffffff; font-size: 11px; font-weight: 600;">${paymentLabel}</span>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </td>
    </tr>

    <!-- Items Table -->
    <tr>
        <td style="padding: 24px 40px 0 40px;">
            <p style="margin: 0 0 12px 0; font-size: 12px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">অর্ডারকৃত পণ্যসমূহ</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <thead>
                    <tr style="background-color: #f9fafb;">
                        <th style="padding: 10px 16px; text-align: left; font-size: 11px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">পণ্যের নাম</th>
                        <th style="padding: 10px 16px; text-align: center; font-size: 11px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">পরিমাণ</th>
                        <th style="padding: 10px 16px; text-align: right; font-size: 11px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">সাবটোটাল</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemRows}
                </tbody>
            </table>
        </td>
    </tr>

    <!-- Total Amount -->
    <tr>
        <td style="padding: 16px 40px 0 40px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff7ed; border-radius: 8px; border: 1px solid #fed7aa;">
                <tr>
                    <td style="padding: 14px 16px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="font-size: 15px; font-weight: 700; color: #ea580c;">সর্বমোট পরিশোধযোগ্য</td>
                                <td style="font-size: 22px; font-weight: 800; color: #ea580c; text-align: right;">৳${data.totalAmount.toFixed(2)}</td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </td>
    </tr>

    <!-- Shipping Address -->
    <tr>
        <td style="padding: 24px 40px 0 40px;">
            <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">ডেলিভারি ঠিকানা</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                <tr>
                    <td style="padding: 14px 16px; font-size: 14px; color: #374151; line-height: 1.6;">📍 ${data.shippingAddress}</td>
                </tr>
            </table>
        </td>
    </tr>

    <!-- Divider -->
    <tr>
        <td style="padding: 32px 40px 0 40px;">
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="border-top: 1px solid #e5e7eb; font-size: 0;">&nbsp;</td></tr>
            </table>
        </td>
    </tr>

    <!-- Footer -->
    <tr>
        <td style="padding: 24px 40px 36px 40px; text-align: center;">
            <p style="margin: 0 0 6px 0; font-size: 14px; color: #374151; font-weight: 600;">কোনো সমস্যা হলে আমাদের সাথে যোগাযোগ করুন।</p>
            <p style="margin: 0; font-size: 12px; color: #9ca3af;">এই ইমেইলটি স্বয়ংক্রিয়ভাবে পাঠানো হয়েছে। অনুগ্রহ করে সরাসরি রিপ্লাই করবেন না।</p>
            <p style="margin: 16px 0 0 0; font-size: 12px; color: #d1d5db;">Powered by <strong style="color: #ea580c;">Mart-SaaS</strong></p>
        </td>
    </tr>

</table>
</td></tr>
</table>
</body>
</html>`;

        const response = await resend.emails.send({
            from: "Mart-SaaS <onboarding@resend.dev>",
            to: data.customerEmail,
            subject: `✅ অর্ডার কনফার্ম — ${data.storeName} (#${data.orderId.slice(-8).toUpperCase()})`,
            html,
        });

        if (response.error) {
            console.error("❌ [RESEND API ERROR]:", {
                message: response.error.message,
                name: response.error.name,
                to: data.customerEmail,
            });
        } else {
            console.log("✅ [RESEND SUCCESS] Email sent to", data.customerEmail, "ID:", response.data?.id);
        }
    } catch (error) {
        console.error("❌ [EMAIL EXCEPTION]:", error);
    }
};