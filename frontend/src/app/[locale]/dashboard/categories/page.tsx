"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { useCategories } from "@/hooks/useCategories";
import { createCategory, updateCategory, deleteCategory, type Category } from "@/services/categoryService";
import { useTranslation } from "@/hooks/useTranslation";

export default function LocalizedCategoriesPage() {
    const { t } = useTranslation();
    const { categories, loading, refresh } = useCategories();

    const [newName, setNewName] = useState("");
    const [creating, setCreating] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const name = newName.trim();
        if (!name) return;

        setCreating(true);
        try {
            await createCategory(name);
            toast.success(t("dashboard.categoriesPage.createdSuccess"));
            setNewName("");
            setIsAddModalOpen(false);
            refresh();
        } catch (err: any) {
            toast.error(err.message || "Failed to create category.");
        } finally {
            setCreating(false);
        }
    };

    const startEdit = (cat: Category) => {
        setEditingId(cat._id);
        setEditingName(cat.name);
    };

    const handleRename = async (id: string) => {
        const name = editingName.trim();
        if (!name) return;

        setSaving(true);
        try {
            await updateCategory(id, name);
            toast.success(t("dashboard.categoriesPage.saved"));
            setEditingId(null);
            refresh();
        } catch (err: any) {
            toast.error(err.message || "Failed to rename category.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (cat: Category) => {
        const moved = cat.productCount || 0;
        const confirmed = window.confirm(
            (moved > 0
                ? t("dashboard.categoriesPage.deleteConfirmWithProducts").replace("{count}", String(moved))
                : t("dashboard.categoriesPage.deleteConfirm")) + "\n\n" + cat.name
        );
        if (!confirmed) return;

        setDeletingId(cat._id);
        try {
            const res = await deleteCategory(cat._id);
            const movedCount = res.data?.movedProducts || 0;
            toast.success(
                movedCount > 0
                    ? t("dashboard.categoriesPage.deletedWithMoved").replace("{count}", String(movedCount))
                    : t("dashboard.categoriesPage.deleted")
            );
            refresh();
        } catch (err: any) {
            toast.error(err.message || "Failed to delete category.");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-5 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("dashboard.categoriesPage.title")}</h1>
                    <p className="text-gray-500 mt-1 text-sm">{t("dashboard.categoriesPage.subtitle")}</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow-sm shrink-0"
                >
                    + {t("dashboard.categoriesPage.addButton")}
                </button>
            </div>

            {/* Add Category Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl p-5 sm:p-8 w-full sm:max-w-md shadow-xl border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">🏷️ {t("dashboard.categoriesPage.modalTitle")}</h2>
                        <p className="text-sm text-gray-500 mb-6">{t("dashboard.categoriesPage.modalSubtitle")}</p>

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                    {t("dashboard.categoriesPage.categoryName")}
                                </label>
                                <input
                                    type="text"
                                    autoFocus
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder={t("dashboard.categoriesPage.addPlaceholder")}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-sm text-gray-900"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsAddModalOpen(false);
                                        setNewName("");
                                    }}
                                    className="px-5 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
                                >
                                    {t("dashboard.categoriesPage.cancel")}
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating || !newName.trim()}
                                    className="px-5 py-2.5 text-sm font-medium bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-colors shadow-sm disabled:bg-orange-300"
                                >
                                    {creating ? t("dashboard.categoriesPage.creating") : t("dashboard.categoriesPage.addButton")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* List */}
            {loading ? (
                <p className="text-gray-600 font-medium p-4 bg-white rounded-2xl border border-gray-100">
                    {t("dashboard.categoriesPage.loading")}
                </p>
            ) : categories.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-400">{t("dashboard.categoriesPage.listEmpty")}</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[480px]">
                        <thead>
                            <tr className="border-b border-gray-100 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                                <th className="py-3 px-5">{t("dashboard.categoriesPage.categoryName")}</th>
                                <th className="py-3 px-5">{t("dashboard.categoriesPage.productCount")}</th>
                                <th className="py-3 px-5">{t("dashboard.categoriesPage.created")}</th>
                                <th className="py-3 px-5 text-right">{t("dashboard.categoriesPage.actions")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {categories.map((cat) => (
                                <tr key={cat._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-3.5 px-5">
                                        {editingId === cat._id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    value={editingName}
                                                    onChange={(e) => setEditingName(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault();
                                                            handleRename(cat._id);
                                                        }
                                                        if (e.key === "Escape") setEditingId(null);
                                                    }}
                                                    className="w-full max-w-[220px] px-3 py-1.5 border border-orange-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm text-gray-900"
                                                />
                                                <button
                                                    onClick={() => handleRename(cat._id)}
                                                    disabled={saving || !editingName.trim()}
                                                    className="px-3 py-1.5 text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-lg disabled:bg-orange-300"
                                                >
                                                    {t("dashboard.categoriesPage.save")}
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-lg"
                                                >
                                                    {t("dashboard.categoriesPage.cancel")}
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="font-medium text-gray-900">{cat.name}</span>
                                        )}
                                    </td>
                                    <td className="py-3.5 px-5">
                                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-orange-50 text-orange-700">
                                            {cat.productCount ?? 0}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-5 text-xs text-gray-500">
                                        {cat.createdAt ? new Date(cat.createdAt).toLocaleDateString() : "—"}
                                    </td>
                                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                                        <button
                                            onClick={() => startEdit(cat)}
                                            className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            {t("dashboard.categoriesPage.edit")}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat)}
                                            disabled={deletingId === cat._id}
                                            className="ml-2 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {deletingId === cat._id ? t("dashboard.categoriesPage.deleting") : t("dashboard.categoriesPage.delete")}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}