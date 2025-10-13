// PageManagement.jsx – Professional Light Theme + resilient endpoints
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

/* ----------------------------- Helpers ---------------------------------- */

const cx = (...c) => c.filter(Boolean).join(" ");

const card = "bg-gray-800 border border-gray-700/60 rounded-3xl shadow-lg shadow-black/50";
const headerTitle = "text-white font-bold tracking-tight";
const subText = "text-gray-400";
const inputBase =
  "w-full rounded-2xl border-0 bg-gray-900 px-4 py-3.5 text-white placeholder:text-gray-500 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-gray-800 focus:shadow-lg transition-all duration-200";
const selectBase = inputBase;
const textAreaBase = inputBase + " resize-none";
const btnBase =
  "inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none " +
  "focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
const btnPrimary = cx(
  btnBase,
  "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25 focus:ring-blue-400"
);
const btnSecondary = cx(
  btnBase,
  "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 hover:border-gray-600 shadow-sm focus:ring-gray-500"
);
const btnDanger = cx(
  btnBase,
  "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25 focus:ring-red-400"
);
const badge = (variant = "default") => {
  const variants = {
    default: "bg-gray-900 text-gray-400",
    success: "bg-emerald-900 text-emerald-400",
    warning: "bg-amber-900 text-amber-400",
    danger: "bg-red-900 text-red-400",
    info: "bg-blue-900 text-blue-400"
  };
  return cx(
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
    variants[variant]
  );
};

const spinner =
  "inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white mr-2";

/**
 * Calls the primary request; on failure, tries each fallback in order.
 * Each arg is a thunk () => axiosPromise
 */
async function requestWithFallback(primary, fallbacks = []) {
  try {
    const res = await primary();
    return res;
  } catch (e) {
    for (const fb of fallbacks) {
      try {
        const res = await fb();
        return res;
      } catch (_) {
        // try next
      }
    }
    throw e;
  }
}


const getId = (obj) => obj?.id ?? obj?._id;

/* --------------------------- Create / Edit Modals ------------------------ */

const PageCreationModal = ({ show, onClose, onPageCreated }) => {
  const [formData, setFormData] = useState({
    pageName: "",
    username: "",
    description: "",
    category: "",
    phone: "",
    email: "",
    address: "",
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    if (show) fetchCategories();
  }, [show]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await requestWithFallback(
        () => axiosInstance.get("/pages/categories"),
        [() => axiosInstance.get("/pages/categories/list")]
      );
      if (res?.data?.success) setCategories(res.data.categories || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  const onChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!formData.pageName || !formData.description || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      const res = await requestWithFallback(
        () => axiosInstance.post("/pages", formData),
        [() => axiosInstance.put("/pages", formData)]
      );
      if (res?.data?.success) {
        toast.success("Page created successfully");
        onPageCreated?.(res.data.page);
        onClose();
        setFormData({
          pageName: "",
          username: "",
          description: "",
          category: "",
          phone: "",
          email: "",
          address: "",
        });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create page");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ y: 32, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 32, opacity: 0, scale: 0.95 }}
        className={cx(card, "w-full max-w-3xl max-h-[90vh] overflow-y-auto")}
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-700">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center mr-4">
              <i className="fas fa-plus text-white text-xl" />
            </div>
            <div>
              <h4 className={cx(headerTitle, "text-2xl")}>Create New Page</h4>
              <p className={subText}>Build your brand presence</p>
            </div>
          </div>
          <button className={btnSecondary + " !p-3"} onClick={onClose} type="button">
            <i className="fas fa-times text-lg" />
          </button>
        </div>

        <div className="p-8">
          {loadingCategories ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-700 border-t-blue-400" />
              </div>
              <p className={subText}>Loading categories...</p>
            </div>
          ) : (
            <div className="space-y-8">
              <section>
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-blue-900 flex items-center justify-center mr-4">
                    <i className="fas fa-info-circle text-blue-400" />
                  </div>
                  <h6 className="text-white font-bold text-lg">Basic Information</h6>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Page Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      className={inputBase}
                      name="pageName"
                      value={formData.pageName}
                      onChange={onChange}
                      placeholder="Enter your page name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Username
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center rounded-l-2xl border-r border-gray-200 bg-gray-100 px-4 text-gray-600 font-medium">
                        @
                      </span>
                      <input
                        className={cx(inputBase, "rounded-l-none border-l-0")}
                        name="username"
                        value={formData.username}
                        onChange={onChange}
                        placeholder="optional-username"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className={textAreaBase}
                      name="description"
                      value={formData.description}
                      onChange={onChange}
                      rows={4}
                      placeholder="Tell people what your page is about..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      className={selectBase}
                      name="category"
                      value={formData.category}
                      onChange={onChange}
                    >
                      <option value="">Choose category</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c.charAt(0).toUpperCase() + c.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center mr-4">
                    <i className="fas fa-address-book text-emerald-600" />
                  </div>
                  <h6 className="text-gray-900 font-bold text-lg">Contact Information</h6>
                  <span className="ml-3 text-sm text-gray-500">(Optional)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Phone Number
                    </label>
                    <input
                      className={inputBase}
                      name="phone"
                      value={formData.phone}
                      onChange={onChange}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Email Address
                    </label>
                    <input
                      className={inputBase}
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={onChange}
                      placeholder="contact@example.com"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Business Address
                    </label>
                    <input
                      className={inputBase}
                      name="address"
                      value={formData.address}
                      onChange={onChange}
                      placeholder="123 Business Street, City, State 12345"
                    />
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-4 px-8 py-6 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl">
          <button className={btnSecondary} onClick={onClose} type="button">
            Cancel
          </button>
          <button
            className={btnPrimary}
            onClick={handleSubmit}
            type="button"
            disabled={loading}
          >
            {loading && <span className={spinner} />}
            Create Page
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const PageEditModal = ({ show, onClose, page, onPageUpdated }) => {
  const [formData, setFormData] = useState({
    pageName: "",
    username: "",
    description: "",
    category: "",
    phone: "",
    email: "",
    address: "",
  });
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    if (show && page) {
      setFormData({
        pageName: page?.pageName || "",
        username: page?.username || "",
        description: page?.description || "",
        category: page?.category || "",
        phone: page?.phone || "",
        email: page?.email || "",
        address: page?.address || "",
      });
      fetchCategories();
    }
  }, [show, page]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await requestWithFallback(
        () => axiosInstance.get("/pages/categories"),
        [() => axiosInstance.get("/pages/categories/list")]
      );
      if (res?.data?.success) setCategories(res.data.categories || []);
    } catch (err) {
      toast.error("Failed to load categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  const onChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!formData.pageName || !formData.description || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSaving(true);
    const id = getId(page);
    try {
      const res = await requestWithFallback(
        () => axiosInstance.put(`/pages/${id}`, formData),
        [() => axiosInstance.patch(`/pages/${id}`, formData)]
      );
      if (res?.data?.success) {
        toast.success(res.data.message || "Page updated");
        onPageUpdated?.(res.data.page);
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update page");
    } finally {
      setSaving(false);
    }
  };

  if (!show || !page) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-gray-900/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ y: 32, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 32, opacity: 0, scale: 0.95 }}
        className={cx(card, "w-full max-w-3xl max-h-[90vh] overflow-y-auto")}
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mr-4">
              <i className="fas fa-edit text-white text-xl" />
            </div>
            <div>
              <h4 className={cx(headerTitle, "text-2xl")}>Edit Page</h4>
              <p className={subText}>Update your page information</p>
            </div>
          </div>
          <button className={btnSecondary + " !p-3"} onClick={onClose} type="button">
            <i className="fas fa-times text-lg" />
          </button>
        </div>

        <div className="p-8">
          {loadingCategories ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
              </div>
              <p className={subText}>Loading data...</p>
            </div>
          ) : (
            <div className="space-y-8">
              <section>
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center mr-4">
                    <i className="fas fa-info-circle text-blue-600" />
                  </div>
                  <h6 className="text-gray-900 font-bold text-lg">Basic Information</h6>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Page Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      className={inputBase}
                      name="pageName"
                      value={formData.pageName}
                      onChange={onChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Username
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center rounded-l-2xl border-r border-gray-200 bg-gray-100 px-4 text-gray-600 font-medium">
                        @
                      </span>
                      <input
                        className={cx(inputBase, "rounded-l-none border-l-0")}
                        name="username"
                        value={formData.username}
                        onChange={onChange}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className={textAreaBase}
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={onChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      className={selectBase}
                      name="category"
                      value={formData.category}
                      onChange={onChange}
                    >
                      <option value="">Choose category</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c.charAt(0).toUpperCase() + c.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center mr-4">
                    <i className="fas fa-address-book text-emerald-600" />
                  </div>
                  <h6 className="text-gray-900 font-bold text-lg">Contact Information</h6>
                  <span className="ml-3 text-sm text-gray-500">(Optional)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Phone Number
                    </label>
                    <input
                      className={inputBase}
                      name="phone"
                      value={formData.phone}
                      onChange={onChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Email Address
                    </label>
                    <input
                      className={inputBase}
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={onChange}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Business Address
                    </label>
                    <input
                      className={inputBase}
                      name="address"
                      value={formData.address}
                      onChange={onChange}
                    />
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-4 px-8 py-6 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl">
          <button className={btnSecondary} onClick={onClose} type="button">
            Cancel
          </button>
          <button
            className={btnPrimary}
            onClick={handleSubmit}
            type="button"
            disabled={saving}
          >
            {saving && <span className={spinner} />}
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* ----------------------------- Detail View ------------------------------- */

const PageDetailView = ({ show, onClose, pageId }) => {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (show && pageId) fetchPageDetails();
  }, [show, pageId]);

  const fetchPageDetails = async () => {
    setLoading(true);
    try {
      const res = await requestWithFallback(
        () => axiosInstance.get(`/pages/${pageId}`),
        [() => axiosInstance.get(`/pages/detail/${pageId}`)]
      );
      if (res?.data?.success) setPage(res.data.page || null);
    } catch (err) {
      toast.error("Failed to load page details");
    } finally {
      setLoading(false);
    }
  };

  const doFollow = async (verb) => {
    setFollowLoading(true);
    try {
      const res = await requestWithFallback(
        () => axiosInstance.post(`/pages/${pageId}/${verb}`),
        [
          () => axiosInstance.put(`/pages/${pageId}/${verb}`),
          () => axiosInstance.post(`/pages/${verb}`, { id: pageId }),
        ]
      );
      if (res?.data?.success) {
        const isFollowing = verb === "follow";
        toast.success(isFollowing ? "Followed" : "Unfollowed");
        setPage((prev) =>
          prev
            ? {
              ...prev,
              isFollowing,
              followersCount: Math.max(
                0,
                (prev.followersCount || 0) + (isFollowing ? 1 : -1)
              ),
            }
            : prev
        );
      }
    } catch (err) {
      toast.error("Action failed");
    } finally {
      setFollowLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-gray-900/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ y: 32, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 32, opacity: 0, scale: 0.95 }}
        className={cx(card, "w-full max-w-5xl max-h-[90vh] overflow-y-auto")}
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mr-4">
              <i className="fas fa-eye text-white text-xl" />
            </div>
            <div>
              <h4 className={cx(headerTitle, "text-2xl")}>Page Details</h4>
              <p className={subText}>View complete page information</p>
            </div>
          </div>
          <button className={btnSecondary + " !p-3"} onClick={onClose} type="button">
            <i className="fas fa-times text-lg" />
          </button>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
              </div>
              <p className={subText}>Loading page...</p>
            </div>
          ) : page ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="text-center mb-8">
                  <div className="relative inline-block mb-6">
                    <img
                      src={page.profilePicture || "/default-page-avatar.png"}
                      alt={page.pageName}
                      className="h-32 w-32 rounded-3xl border-4 border-white shadow-lg object-cover"
                    />
                    {page.isVerified && (
                      <span className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <i className="fas fa-check text-white text-sm" />
                      </span>
                    )}
                  </div>
                  <h5 className="text-gray-900 text-2xl font-bold mb-2">
                    {page.pageName}
                  </h5>
                  {page.username && (
                    <p className="text-blue-600 font-semibold mb-6">@{page.username}</p>
                  )}

                  <div className="flex justify-center gap-8 mb-8">
                    <div className="text-center">
                      <div className="text-gray-900 font-bold text-2xl">
                        {(page.followersCount ?? 0).toLocaleString()}
                      </div>
                      <div className={subText}>Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-900 font-bold text-2xl">
                        {(page.postsCount ?? 0).toLocaleString()}
                      </div>
                      <div className={subText}>Posts</div>
                    </div>
                  </div>

                  {!page.isOwner && (
                    <button
                      className={cx(
                        btnBase,
                        page.isFollowing
                          ? "bg-gray-800 text-gray-700 border border-gray-300 hover:bg-gray-50"
                          : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-600/25",
                        "w-full"
                      )}
                      onClick={() =>
                        page.isFollowing ? doFollow("unfollow") : doFollow("follow")
                      }
                      disabled={followLoading}
                    >
                      {followLoading && <span className={spinner} />}
                      <i
                        className={cx(
                          "mr-2",
                          page.isFollowing ? "fas fa-user-minus" : "fas fa-user-plus"
                        )}
                      />
                      {page.isFollowing ? "Unfollow" : "Follow"}
                    </button>
                  )}
                </div>
              </div>

              <div className="lg:col-span-2 space-y-8">
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center mr-3">
                      <i className="fas fa-info-circle text-emerald-600" />
                    </div>
                    <h6 className="text-gray-900 font-bold text-lg">About</h6>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {page.description || "No description available"}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center mr-3">
                      <i className="fas fa-address-card text-blue-600" />
                    </div>
                    <h6 className="text-gray-900 font-bold text-lg">Details</h6>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-gray-50 rounded-2xl p-4 flex items-center">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mr-4">
                        <i className="fas fa-tag text-amber-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Category</div>
                        <div className="font-semibold text-gray-900">
                          {page.category
                            ? page.category[0].toUpperCase() + page.category.slice(1)
                            : "Uncategorized"}
                        </div>
                      </div>
                    </div>
                    {page.phone && (
                      <div className="bg-gray-50 rounded-2xl p-4 flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mr-4">
                          <i className="fas fa-phone text-emerald-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Phone</div>
                          <div className="font-semibold text-gray-900">{page.phone}</div>
                        </div>
                      </div>
                    )}
                    {page.email && (
                      <div className="bg-gray-50 rounded-2xl p-4 flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mr-4">
                          <i className="fas fa-envelope text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Email</div>
                          <div className="font-semibold text-gray-900">{page.email}</div>
                        </div>
                      </div>
                    )}
                    {page.address && (
                      <div className="bg-gray-50 rounded-2xl p-4 flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center mr-4">
                          <i className="fas fa-map-marker-alt text-red-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Address</div>
                          <div className="font-semibold text-gray-900">{page.address}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {page.owner && (
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center mr-3">
                        <i className="fas fa-user-circle text-purple-600" />
                      </div>
                      <h6 className="text-gray-900 font-bold text-lg">Page Owner</h6>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <div className="flex items-center">
                        <img
                          src={page.owner.profilePicture || "/default-avatar.png"}
                          alt={`${page.owner.firstName} ${page.owner.lastName}`}
                          className="h-16 w-16 rounded-2xl object-cover mr-4 border-2 border-white shadow-sm"
                        />
                        <div>
                          <div className="text-gray-900 font-bold text-lg">
                            {page.owner.firstName} {page.owner.lastName}
                          </div>
                          {page.owner.username && (
                            <div className="text-blue-600 font-medium">
                              @{page.owner.username}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-exclamation-circle text-red-500 text-2xl" />
              </div>
              <h5 className="text-gray-900 font-bold text-xl mb-2">Page Not Found</h5>
              <p className={subText}>The page you're looking for could not be loaded</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

/* ------------------------------ All Pages -------------------------------- */

const AllPagesBrowser = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: "", search: "" });
  const [categories, setCategories] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [showPageDetail, setShowPageDetail] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchAllPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchAllPages(), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const res = await requestWithFallback(
        () => axiosInstance.get("/pages/categories"),
        [() => axiosInstance.get("/pages/categories/list")]
      );
      if (res?.data?.success) setCategories(res.data.categories || []);
    } catch (err) {
      // silent
    }
  };

  const fetchAllPages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.set("category", filters.category);
      if (filters.search) params.set("search", filters.search);

      const res = await requestWithFallback(
        () => axiosInstance.get(`/pages?${params.toString()}`),
        [() => axiosInstance.get(`/pages/list?${params.toString()}`)]
      );
      if (res?.data?.success) setPages(res.data.pages || []);
    } catch (err) {
      toast.error("Failed to load pages");
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) =>
    setFilters((p) => ({ ...p, [e.target.name]: e.target.value }));

  const view = (page) => {
    setSelectedPage(page);
    setShowPageDetail(true);
  };

  return (
    <>
      <div className={cx(card, "p-8")}>
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mr-4">
              <i className="fas fa-search text-white text-xl" />
            </div>
            <div>
              <h4 className={cx(headerTitle, "text-2xl")}>Discover Pages</h4>
              <p className={subText}>Find brands, communities, and creators to follow</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Search Pages
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="fas fa-search text-gray-400" />
              </div>
              <input
                className={cx(inputBase, "pl-11")}
                name="search"
                value={filters.search}
                onChange={onChange}
                placeholder="Search pages..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Filter by Category
            </label>
            <select
              className={selectBase}
              name="category"
              value={filters.category}
              onChange={onChange}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
            </div>
            <p className={subText}>Loading pages...</p>
          </div>
        ) : pages.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-layer-group text-gray-400 text-2xl" />
            </div>
            <h5 className="text-gray-900 font-bold text-xl mb-2">No Pages Found</h5>
            <p className={subText}>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {pages.map((p) => (
              <motion.div
                key={getId(p)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cx(
                  "bg-gray-800 rounded-3xl border border-gray-200/60 p-6 hover:shadow-xl hover:shadow-gray-900/10 transition-all duration-300 cursor-pointer group"
                )}
                onClick={() => view(p)}
              >
                <div className="flex items-center mb-4">
                  <img
                    src={p.profilePicture || "/default-page-avatar.png"}
                    alt={p.pageName}
                    className="h-16 w-16 rounded-2xl object-cover mr-4 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="flex-1 min-w-0">
                    <h6 className="text-gray-900 font-bold text-lg truncate group-hover:text-blue-600 transition-colors">
                      {p.pageName}
                    </h6>
                    {p.username && (
                      <p className="text-blue-600 font-medium text-sm truncate">
                        @{p.username}
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                  {p.description || "No description available"}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <span className={badge("info")}>
                    {p.category
                      ? p.category[0].toUpperCase() + p.category.slice(1)
                      : "Uncategorized"}
                  </span>
                  <span className="text-sm font-semibold text-gray-500">
                    {(p.followersCount ?? 0).toLocaleString()} followers
                  </span>
                </div>

                <button className={cx(btnPrimary, "w-full group-hover:shadow-lg transition-all")}>
                  <i className="fas fa-eye mr-2" />
                  View Page
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showPageDetail && (
          <PageDetailView
            show={showPageDetail}
            onClose={() => setShowPageDetail(false)}
            pageId={getId(selectedPage)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

/* ------------------------------ Main Shell -------------------------------- */

const PageManagement = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("my-pages");

  const fetchUserPages = async () => {
    setLoading(true);
    try {
      const res = await requestWithFallback(
        () => axiosInstance.get("/pages/my-pages"),
        [() => axiosInstance.get("/pages/my")]
      );
      if (res?.data?.success) setPages(res.data.pages || []);
    } catch (err) {
      toast.error("Failed to load pages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (expanded && activeTab === "my-pages") fetchUserPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded, activeTab]);

  const onPageCreated = (page) => setPages((p) => [page, ...p]);
  const onPageUpdated = (updated) =>
    setPages((p) => p.map((x) => (getId(x) === getId(updated) ? updated : x)));

  const handlePublish = async (id) => {
    try {
      const res = await requestWithFallback(
        () => axiosInstance.put(`/pages/${id}/publish`),
        [() => axiosInstance.post(`/pages/${id}/publish`)]
      );
      if (res?.data?.success) {
        toast.success("Page published");
        fetchUserPages();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to publish");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this page? This action cannot be undone.")) return;
    try {
      const res = await requestWithFallback(
        () => axiosInstance.delete(`/pages/${id}`),
        [() => axiosInstance.post(`/pages/${id}/delete`)]
      );
      if (res?.data?.success) {
        toast.success("Page deleted");
        fetchUserPages();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  const statusInfo = (page) => {
    if (!page?.isPublished) {
      return { node: <span className={badge("warning")}>Draft</span> };
    }
    switch (page?.approvalStatus) {
      case "approved":
        return { node: <span className={badge("success")}>Live</span> };
      case "pending":
        return { node: <span className={badge("info")}>Under Review</span> };
      case "rejected":
        return { node: <span className={badge("danger")}>Rejected</span> };
      default:
        return { node: <span className={badge("default")}>Unknown</span> };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className={cx(card, "p-8")}>
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mr-6">
                <i className="fas fa-layer-group text-white text-2xl" />
              </div>
              <div>
                <h1 className={cx(headerTitle, "text-3xl mb-2")}>Page Management</h1>
                <p className={cx(subText, "text-lg")}>Create and manage your brand presence</p>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                className={cx(
                  btnBase,
                  activeTab === "my-pages"
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
                    : "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700"
                )}
                onClick={() => {
                  setActiveTab("my-pages");
                  setExpanded(true);
                }}
              >
                <i className="fas fa-user mr-2" />
                My Pages ({pages.length})
              </button>
              <button
                className={cx(
                  btnBase,
                  activeTab === "all-pages"
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
                    : "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700"
                )}
                onClick={() => {
                  setActiveTab("all-pages");
                  setExpanded(true);
                }}
              >
                <i className="fas fa-search mr-2" />
                Browse All
              </button>
              <button className={btnPrimary} onClick={() => setShowCreateModal(true)}>
                <i className="fas fa-plus mr-2" />
                Create New Page
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {activeTab === "my-pages" ? (
                loading ? (
                  <div className={cx(card, "p-16 text-center")}>
                    <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-700 border-t-blue-400" />
                    </div>
                    <p className={subText}>Loading your pages...</p>
                  </div>
                ) : pages.length === 0 ? (
                  <div className={cx(card, "p-16 text-center")}>
                    <div className="w-20 h-20 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                      <i className="fas fa-layer-group text-blue-400 text-3xl" />
                    </div>
                    <h3 className="text-white text-2xl font-bold mb-3">
                      No Pages Yet
                    </h3>
                    <p className={cx(subText, "text-lg mb-8 max-w-md mx-auto")}>
                      Create your first page to start building your brand presence and connecting with your audience.
                    </p>
                    <button className={btnPrimary} onClick={() => setShowCreateModal(true)}>
                      <i className="fas fa-plus mr-2" />
                      Create Your First Page
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {pages.map((p, i) => {
                      const id = getId(p);
                      return (
                        <motion.div
                          key={id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className={cx(card, "p-6 hover:shadow-xl hover:shadow-black/20 transition-all duration-300")}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center flex-1 min-w-0">
                              <img
                                src={p.profilePicture || "/default-page-avatar.png"}
                                alt={p.pageName}
                                className="h-16 w-16 rounded-2xl object-cover mr-4 border-2 border-gray-900 shadow-sm"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <h6 className="text-white font-bold text-lg truncate">
                                    {p.pageName}
                                  </h6>
                                  {statusInfo(p).node}
                                </div>
                                {p.username && (
                                  <p className="text-blue-400 font-medium text-sm truncate">@{p.username}</p>
                                )}
                              </div>
                            </div>
                            <button
                              className={btnSecondary + " !p-3"}
                              onClick={() => {
                                setSelectedPage(p);
                                setShowEditModal(true);
                              }}
                              title="Edit page"
                            >
                              <i className="fas fa-edit" />
                            </button>
                          </div>

                          <p className="text-sm text-gray-400 line-clamp-3 mb-4 leading-relaxed">
                            {p.description || "No description available"}
                          </p>

                          <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                            <div className="text-sm font-semibold text-gray-400">
                              {(p.followersCount ?? 0).toLocaleString()} followers
                            </div>
                            <div className="flex gap-2">
                              {!p.isPublished && (
                                <button
                                  className={btnPrimary + " !px-4 !py-2 !text-xs"}
                                  onClick={() => handlePublish(id)}
                                >
                                  Publish
                                </button>
                              )}
                              <button
                                className={btnDanger + " !px-4 !py-2 !text-xs"}
                                onClick={() => handleDelete(id)}
                              >
                                <i className="fas fa-trash mr-1" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )
              ) : (
                <AllPagesBrowser />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showCreateModal && (
            <PageCreationModal
              show={showCreateModal}
              onClose={() => setShowCreateModal(false)}
              onPageCreated={onPageCreated}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showEditModal && (
            <PageEditModal
              show={showEditModal}
              page={selectedPage}
              onClose={() => setShowEditModal(false)}
              onPageUpdated={onPageUpdated}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PageManagement;