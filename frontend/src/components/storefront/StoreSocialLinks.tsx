interface StoreSocialLinksProps {
    facebookUrl?: string | null;
    instagramUrl?: string | null;
    whatsappNumber?: string | null;
}

export default function StoreSocialLinks({ facebookUrl, instagramUrl, whatsappNumber }: StoreSocialLinksProps) {
    const links: { href: string; label: string; icon: React.ReactNode; iconClass: string; hoverClass: string }[] = [];

    if (facebookUrl) {
        links.push({
            href: facebookUrl,
            label: "Facebook",
            icon: (
                <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-current" aria-hidden="true">
                    <path d="M13.5 21v-7h2.4l.36-2.8H13.5V9.4c0-.81.22-1.36 1.39-1.36h1.49V5.55c-.26-.03-1.14-.11-2.17-.11-2.15 0-3.63 1.31-3.63 3.72v2.04H8.4V14H10.5v7h3z" />
                </svg>
            ),
            iconClass: "bg-[#1877F2]/10 text-[#1877F2]",
            hoverClass: "hover:bg-[#1877F2] hover:text-white",
        });
    }

    if (instagramUrl) {
        links.push({
            href: instagramUrl,
            label: "Instagram",
            icon: (
                <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-none stroke-current" strokeWidth="1.8" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
            ),
            iconClass: "bg-[#E4405F]/10 text-[#E4405F]",
            hoverClass: "hover:bg-[#E4405F] hover:text-white",
        });
    }

    if (whatsappNumber) {
        const cleanNumber = whatsappNumber.replace(/[^\d]/g, "");
        links.push({
            href: `https://wa.me/${cleanNumber}`,
            label: "WhatsApp",
            icon: (
                <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-current" aria-hidden="true">
                    <path d="M12 2a10 10 0 0 0-8.66 15l-1.29 4.7 4.83-1.26A10 10 0 1 0 12 2zm5.4 14.13c-.23.65-1.34 1.27-1.86 1.32-.5.05-1.04.23-3.5-.72-2.95-1.16-4.83-4.17-4.97-4.37-.14-.19-1.18-1.58-1.18-3 0-1.42.74-2.11 1-2.4.26-.3.57-.37.76-.37h.55c.18 0 .42-.07.65.5.23.58.8 2 .87 2.14.07.14.12.3.02.49-.09.19-.14.3-.28.46-.14.16-.3.35-.42.47-.14.14-.29.29-.13.58.16.28.73 1.2 1.57 1.95 1.08.96 1.98 1.26 2.26 1.4.28.14.44.12.6-.07.16-.19.7-.81.88-1.09.19-.28.37-.23.62-.14.26.09 1.63.77 1.91.9.28.14.47.21.54.32.07.12.07.68-.16 1.32z" />
                </svg>
            ),
            iconClass: "bg-[#25D366]/10 text-[#25D366]",
            hoverClass: "hover:bg-[#25D366] hover:text-white",
        });
    }

    if (links.length === 0) return null;

    return (
        <div className="flex items-center gap-2.5" aria-label="Social links">
            {links.map((link) => (
                <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${link.iconClass} ${link.hoverClass}`}
                >
                    {link.icon}
                </a>
            ))}
        </div>
    );
}