export const themeBgMap: Record<string, string> = {
    classic: "bg-[#FFFDF7]",
    minimal: "bg-white",
    bold: "bg-[#0a0a0a]",
    elegant: "bg-[#fdfbf7]",
    vibrant: "bg-gradient-to-b from-white to-[#fff7ed]",
    retro: "bg-[#fff8dc]",
    luxe: "bg-[#0a0a0a]",
    pastel: "bg-[#fdf2f8]",
    urban: "bg-[#f3f4f6]",
};

export const isDarkTheme = (theme?: string | null) => theme === "bold" || theme === "luxe";
export const isLuxeTheme = (theme?: string | null) => theme === "luxe";