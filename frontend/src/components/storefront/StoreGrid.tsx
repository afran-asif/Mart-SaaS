import { ClassicTheme } from "./themes/ClassicTheme";
import { MinimalTheme } from "./themes/MinimalTheme";
import { BoldTheme } from "./themes/BoldTheme";
import { ElegantTheme } from "./themes/ElegantTheme";
import { VibrantTheme } from "./themes/VibrantTheme";
import { RetroTheme } from "./themes/RetroTheme";
import { LuxeTheme } from "./themes/LuxeTheme";
import { PastelTheme } from "./themes/PastelTheme";
import { UrbanTheme } from "./themes/UrbanTheme";

interface Product {
    _id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
    featured?: boolean;
    category?: string;
}

interface StoreGridProps {
    products: Product[];
    theme: string;
    brand: string;
}

export default function StoreGrid({ products, theme, brand }: StoreGridProps) {
    switch (theme) {
        case "minimal": return <MinimalTheme products={products} brand={brand} />;
        case "bold": return <BoldTheme products={products} brand={brand} />;
        case "elegant": return <ElegantTheme products={products} brand={brand} />;
        case "vibrant": return <VibrantTheme products={products} brand={brand} />;
        case "retro": return <RetroTheme products={products} brand={brand} />;
        case "luxe": return <LuxeTheme products={products} brand={brand} />;
        case "pastel": return <PastelTheme products={products} brand={brand} />;
        case "urban": return <UrbanTheme products={products} brand={brand} />;
        default: return <ClassicTheme products={products} brand={brand} />;
    }
}
