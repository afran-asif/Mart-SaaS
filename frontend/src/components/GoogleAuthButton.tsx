"use client";

import { GoogleLogin } from "@react-oauth/google";

export const isGoogleAuthReady =
    typeof process !== "undefined" && !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

interface GoogleAuthButtonProps {
    onToken: (idToken: string) => void;
    onError?: (message: string) => void;
    disabled?: boolean;
}

/** Google credential → idToken parent-এ দেয়; backend /auth/google verify করে */
export default function GoogleAuthButton({ onToken, onError, disabled }: GoogleAuthButtonProps) {
    if (!isGoogleAuthReady) return null;
    return (
        <div className={disabled ? "pointer-events-none opacity-60" : ""}>
            <GoogleLogin
                onSuccess={(res) => {
                    if (res.credential) onToken(res.credential);
                    else onError?.("Google sign-in failed. Try again.");
                }}
                onError={() => onError?.("Google sign-in failed. Try again.")}
                text="continue_with"
                shape="rectangular"
                theme="outline"
                size="large"
                width="100%"
            />
        </div>
    );
}
