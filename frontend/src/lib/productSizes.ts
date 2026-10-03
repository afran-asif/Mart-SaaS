export interface SizeGroup {
    id: string;
    label: string;
    sizes: string[];
}

// প্রোডাক্টে ব্যবহারযোগ্য size pre-set গ্রুপসমূহ
export const SIZE_GROUPS: SizeGroup[] = [
    { id: "clothing", label: "Clothing (XS–XXXL)", sizes: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"] },
    { id: "shoes-in", label: "Shoes (Inch)", sizes: ["7", "8", "9", "10", "11", "12"] },
    { id: "shoes-eu", label: "Shoes (EU)", sizes: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"] },
    { id: "waist", label: "Waist (Inch)", sizes: ["28", "30", "32", "34", "36", "38", "40"] },
    { id: "num", label: "Numeric (2–20)", sizes: ["2", "4", "6", "8", "10", "12", "14", "16", "18", "20"] },
    { id: "kids", label: "Kids (2Y–14Y)", sizes: ["2Y", "3Y", "4Y", "5Y", "6Y", "7Y", "8Y", "10Y", "12Y", "14Y"] },
    { id: "one-size", label: "One Size", sizes: ["One Size"] },
];

export const customGroupId = "custom";