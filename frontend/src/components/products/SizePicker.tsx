"use client";

import { useEffect, useState } from "react";
import { SIZE_GROUPS } from "@/lib/productSizes";

interface SizePickerProps {
    selected: string[];
    onChange: (sizes: string[]) => void;
}

// উপলব্ধ size-এর chips মাল্টি-সিলেক্ট — group বাছলে সেই group-এর size-গুলো দেখায়
export default function SizePicker({ selected, onChange }: SizePickerProps) {
    const [pool, setPool] = useState<string[]>([]);

    // edit-এ product-এর আগের sizes থাকলে — union pool দেখাও যেন সব toggle করা যায়
    useEffect(() => {
        if (selected.length > 0) {
            setPool((prev) => [...new Set([...prev, ...selected])]);
        }
    }, [selected]);

    const toggle = (s: string) => {
        onChange(selected.includes(s) ? selected.filter((x) => x !== s) : [...selected, s]);
    };

    return (
        <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Size Group (ঐচ্ছিক)
            </label>
            <select
                value=""
                onChange={(e) => {
                    const g = SIZE_GROUPS.find((x) => x.id === e.target.value);
                    if (g) setPool([...g.sizes]);
                }}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-orange-500 transition-colors text-sm text-gray-900"
            >
                <option value="" disabled>Select size group…</option>
                {SIZE_GROUPS.map((g) => (
                    <option key={g.id} value={g.id}>{g.label}</option>
                ))}
            </select>

            {pool.length > 0 ? (
                <>
                    <p className="text-xs text-gray-500 mt-2 mb-2">
                        কোন size-গুলো এই product-এ available হবে সেগুলো বাছুন:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {pool.map((s) => {
                            const active = selected.includes(s);
                            return (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => toggle(s)}
                                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all active:scale-95 ${
                                        active
                                            ? "bg-orange-600 text-white border-orange-600 shadow-sm"
                                            : "bg-white text-gray-600 border-gray-300 hover:border-orange-400"
                                    }`}
                                >
                                    {s}
                                </button>
                            );
                        })}
                    </div>
                </>
            ) : (
                selected.length === 0 && (
                    <p className="text-xs text-gray-400 mt-2">
                        Group select করলে size chips দেখাবে।
                    </p>
                )
            )}

            {selected.length > 0 && (
                <div className="flex items-center gap-2 mt-2.5">
                    <span className="text-xs text-gray-500">Selected:</span>
                    <span className="font-mono text-xs text-gray-700 truncate">
                        {selected.join(", ")}
                    </span>
                </div>
            )}
        </div>
    );
}