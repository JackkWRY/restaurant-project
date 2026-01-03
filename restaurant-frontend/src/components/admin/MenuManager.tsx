"use client";

import { API_URL, authFetch, authFetcher } from "@/lib/utils";
import { useState, type ChangeEvent } from "react";
import Image from "next/image";
import {
  Utensils,
  Plus,
  X,
  Save,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
} from "lucide-react";
import useSWR from "swr";
import type { Dictionary } from "@/locales/dictionary";

interface Category {
  id: number;
  name: string;
}

interface Menu {
  id: number;
  nameTH: string;
  price: number;
  imageUrl: string | null;
  categoryId: number;
  category?: { name: string };
  isRecommended?: boolean;
  isAvailable?: boolean;
  isVisible?: boolean;
}

interface MenuManagerProps {
  dict: Dictionary;
}

/**
 * MenuManager Component
 * Manages menu items with create, update, delete operations
 * Includes image upload and quick toggle features
 */
export default function MenuManager({ dict }: MenuManagerProps) {
  const { data: menusData, mutate: mutateMenus } = useSWR(
    `${API_URL}/api/menus?scope=all`,
    authFetcher
  );
  const { data: catsData } = useSWR(`${API_URL}/api/categories`, authFetcher);

  // Handle both grouped and paginated responses
  const menus: Menu[] =
    menusData?.status === "success"
      ? Array.isArray(menusData.data)
        ? menusData.data
        : menusData.data?.menus || []
      : [];
  const categories: Category[] =
    catsData?.status === "success" ? catsData.data : [];

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form States
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCategoryId, setNewCategoryId] = useState("");
  const [newImage, setNewImage] = useState("");
  const [isRecommended, setIsRecommended] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [uploading, setUploading] = useState(false);

  const resetForm = () => {
    setNewName("");
    setNewPrice("");
    setNewCategoryId("");
    setNewImage("");
    setIsRecommended(false);
    setIsAvailable(true);
    setIsVisible(true);
    setEditingId(null);
    setIsFormOpen(false);
    setUploading(false);
  };

  const handleStartEdit = (menu: Menu) => {
    setNewName(menu.nameTH);
    setNewPrice(menu.price.toString());
    setNewCategoryId(menu.categoryId.toString());
    setNewImage(menu.imageUrl || "");
    setIsRecommended(menu.isRecommended || false);
    setIsAvailable(menu.isAvailable !== undefined ? menu.isAvailable : true);
    setIsVisible(menu.isVisible !== undefined ? menu.isVisible : true);

    setEditingId(menu.id);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!ALLOWED_TYPES.includes(file.type)) {
      alert("Invalid file type. Only JPEG, PNG, and WebP images are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      alert(`File too large (${sizeMB}MB). Maximum size is 5MB.`);
      e.target.value = "";
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await authFetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.status === "success") {
        setNewImage(data.data?.url || data.url);
      } else {
        alert("Upload failed: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Upload error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      nameTH: newName,
      nameEN: newName,
      price: newPrice,
      categoryId: newCategoryId,
      imageUrl: newImage,
      isRecommended: isRecommended,
      isAvailable: isAvailable,
      isVisible: isVisible,
    };

    try {
      let res;
      if (editingId) {
        res = await authFetch(`${API_URL}/api/menus/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await authFetch(`${API_URL}/api/menus`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        alert(dict.admin.alertSaved);
        resetForm();
        mutateMenus();
      } else {
        alert(dict.admin.alertFailed);
      }
    } catch (error) {
      console.error("Failed to save menu:", error);
      alert(dict.common.error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(dict.admin.confirmDelete)) return;

    try {
      await authFetch(`${API_URL}/api/menus/${id}`, { method: "DELETE" });
      mutateMenus();
    } catch (error) {
      console.error("Failed to delete menu:", error);
    }
  };

  const handleQuickToggle = async (
    id: number,
    field: "isAvailable" | "isVisible",
    currentValue: boolean | undefined
  ) => {
    try {
      const newValue = !currentValue;
      const res = await authFetch(`${API_URL}/api/menus/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: newValue }),
      });
      if (res.ok) mutateMenus();
    } catch (error) {
      console.error("Failed to toggle menu:", error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Utensils className="text-purple-600" />
          {dict.admin.manageMenus} ({menus.length})
        </h2>
        <button
          onClick={() => (isFormOpen ? resetForm() : setIsFormOpen(true))}
          className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors ${
            isFormOpen
              ? "bg-slate-200 text-slate-600"
              : "bg-purple-600 text-white hover:bg-purple-700"
          }`}
        >
          {isFormOpen ? (
            <>
              <X size={18} /> {dict.admin.cancel}
            </>
          ) : (
            <>
              <Plus size={18} /> {dict.admin.add}
            </>
          )}
        </button>
      </div>

      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="bg-slate-50 p-6 rounded-xl border mb-6 animate-in fade-in slide-in-from-top-4 relative"
        >
          <div
            className={`absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded ${
              editingId
                ? "bg-blue-100 text-blue-600"
                : "bg-green-100 text-green-600"
            }`}
          >
            {editingId ? dict.admin.modeEdit : dict.admin.modeCreate}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                {dict.admin.name}
              </label>
              <input
                required
                type="text"
                className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-200 outline-none"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                {dict.admin.price}
              </label>
              <input
                required
                type="number"
                className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-200 outline-none"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                {dict.admin.category}
              </label>
              <select
                required
                className="w-full border p-2 rounded bg-white focus:ring-2 focus:ring-purple-200 outline-none"
                value={newCategoryId}
                onChange={(e) => setNewCategoryId(e.target.value)}
              >
                <option value="">-- {dict.admin.category} --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                {dict.admin.image}
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="https://..."
                  className="flex-1 border p-2 rounded focus:ring-2 focus:ring-purple-200 outline-none text-sm text-slate-500 bg-slate-100"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  readOnly
                />

                <label
                  className={`cursor-pointer bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 ${
                    uploading ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  <ImageIcon size={18} />
                  <span className="text-sm font-bold">
                    {uploading ? "Uploading..." : "Upload"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              </div>

              {newImage && (
                <div className="mt-2 relative w-full h-32 bg-slate-200 rounded-lg overflow-hidden border">
                  <Image
                    src={newImage}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-6 border-t pt-4 border-slate-200">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isRecommended"
                checked={isRecommended}
                onChange={(e) => setIsRecommended(e.target.checked)}
                className="w-5 h-5 accent-orange-500 cursor-pointer"
              />
              <label
                htmlFor="isRecommended"
                className="text-slate-700 font-bold cursor-pointer select-none"
              >
                {dict.admin.recommend} ★
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isAvailable"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-5 h-5 accent-green-600 cursor-pointer"
              />
              <label
                htmlFor="isAvailable"
                className="text-slate-700 font-bold cursor-pointer select-none"
              >
                {dict.admin.available}
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isVisible"
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
                className="w-5 h-5 accent-blue-600 cursor-pointer"
              />
              <label
                htmlFor="isVisible"
                className="text-slate-700 font-bold cursor-pointer select-none"
              >
                {dict.admin.visible}
              </label>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <button
              type="submit"
              disabled={uploading}
              className={`px-6 py-2 rounded-lg font-bold text-white flex items-center gap-2 ${
                editingId
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-green-600 hover:bg-green-700"
              } ${uploading ? "opacity-50" : ""}`}
            >
              <Save size={18} />{" "}
              {editingId ? dict.admin.save : dict.admin.add}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 rounded-lg font-bold bg-slate-200 text-slate-600 hover:bg-slate-300"
              >
                {dict.admin.cancel}
              </button>
            )}
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white">
        <table className="w-full text-left">
          <thead className="bg-slate-100 text-slate-600 font-bold text-sm">
            <tr>
              <th className="p-4">{dict.admin.image}</th>
              <th className="p-4">{dict.admin.name}</th>
              <th className="p-4">{dict.admin.price}</th>
              <th className="p-4 text-center">{dict.admin.status}</th>
              <th className="p-4 text-center">{dict.admin.visibility}</th>
              <th className="p-4 text-right">{dict.admin.action}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {menus.map((menu) => (
              <tr
                key={menu.id}
                className={`transition-colors ${
                  editingId === menu.id ? "bg-blue-50" : "hover:bg-slate-50"
                }`}
              >
                <td className="p-4 w-20">
                  <div className="w-12 h-12 bg-slate-200 rounded-lg overflow-hidden flex items-center justify-center text-slate-400 relative">
                    {menu.imageUrl ? (
                      <Image
                        src={menu.imageUrl}
                        alt={menu.nameTH}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <ImageIcon size={20} />
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="font-bold text-slate-800">{menu.nameTH}</div>
                  <div className="text-xs text-slate-500">
                    {menu.category?.name || "-"}
                  </div>
                  {menu.isRecommended && (
                    <span className="text-[10px] bg-orange-100 text-orange-600 px-1 py-0.5 rounded font-bold">
                      ★ {dict.admin.recommend}
                    </span>
                  )}
                </td>
                <td className="p-4 font-bold text-slate-900">
                  {dict.common.currency}
                  {menu.price}
                </td>

                <td className="p-4 text-center">
                  <button
                    onClick={() =>
                      handleQuickToggle(menu.id, "isAvailable", menu.isAvailable)
                    }
                    className={`px-3 py-1 rounded-full text-xs font-bold border w-24 transition-colors ${
                      menu.isAvailable
                        ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                        : "bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
                    }`}
                  >
                    {menu.isAvailable
                      ? `🟢 ${dict.admin.available}`
                      : `🔴 ${dict.admin.outOfStock}`}
                  </button>
                </td>

                <td className="p-4 text-center">
                  <button
                    onClick={() =>
                      handleQuickToggle(menu.id, "isVisible", menu.isVisible)
                    }
                    className={`px-3 py-1 rounded-full text-xs font-bold border w-24 transition-colors flex items-center justify-center gap-1 mx-auto ${
                      menu.isVisible
                        ? "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
                        : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    {menu.isVisible ? (
                      <>
                        <Eye size={12} /> {dict.admin.visible}
                      </>
                    ) : (
                      <>
                        <EyeOff size={12} /> {dict.admin.hidden}
                      </>
                    )}
                  </button>
                </td>

                <td className="p-4 text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => handleStartEdit(menu)}
                      className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
                      title={dict.admin.edit}
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(menu.id)}
                      className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                      title={dict.admin.delete}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {menus.length === 0 && (
          <div className="text-center py-10 text-slate-400">
            {dict.admin.noMenu}
          </div>
        )}
      </div>
    </div>
  );
}
