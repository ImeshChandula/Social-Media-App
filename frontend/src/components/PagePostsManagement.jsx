// PagePostsManagement.jsx – Professional Light Theme + resilient endpoints
import React, { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
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
const spinner = "inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white mr-2";

async function requestWithFallback(primary, fallbacks = []) {
  try {
    return await primary();
  } catch (e) {
    for (const fb of fallbacks) {
      try {
        return await fb();
      } catch (_) {}
    }
    throw e;
  }
}


/* ----------------------------- Create Modal ------------------------------ */

const PostCreationModal = ({ show, onClose, pageId, onPostCreated }) => {
  const [formData, setFormData] = useState({
    content: "",
    media: "",
    mediaType: "text",
    tags: "",
    privacy: "public",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [mediaPreview, setMediaPreview] = useState(null);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));

    if (name === "media") {
      setMediaPreview(formData.mediaType === "image" && value ? value : null);
    }
  };

  const handleSubmit = async () => {
    if (!formData.content && !formData.media) {
      toast.error("Please add content or media");
      return;
    }
    setLoading(true);
    try {
      const res = await requestWithFallback(
        () => axiosInstance.post(`/pages/${pageId}/posts`, formData),
        [() => axiosInstance.put(`/pages/${pageId}/posts`, formData)]
      );
      if (res?.data?.success) {
        toast.success("Post created successfully");
        onPostCreated?.(res.data.post);
        onClose();
        setFormData({
          content: "",
          media: "",
          mediaType: "text",
          tags: "",
          privacy: "public",
          location: "",
        });
        setMediaPreview(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

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
              <i className="fas fa-plus text-white text-xl" />
            </div>
            <div>
              <h4 className={cx(headerTitle, "text-2xl")}>Create New Post</h4>
              <p className={subText}>Share content with your audience</p>
            </div>
          </div>
          <button className={btnSecondary + " !p-3"} onClick={onClose} type="button">
            <i className="fas fa-times text-lg" />
          </button>
        </div>

        <div className="p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                className={textAreaBase}
                rows={5}
                name="content"
                value={formData.content}
                onChange={onChange}
                placeholder="What's happening? Share your thoughts..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Media Type
                </label>
                <select
                  className={selectBase}
                  name="mediaType"
                  value={formData.mediaType}
                  onChange={onChange}
                >
                  <option value="text">Text Only</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Privacy Settings
                </label>
                <select
                  className={selectBase}
                  name="privacy"
                  value={formData.privacy}
                  onChange={onChange}
                >
                  <option value="public">Public</option>
                  <option value="followers">Followers Only</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>

            {formData.mediaType !== "text" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Media URL
                </label>
                <input
                  className={inputBase}
                  name="media"
                  value={formData.media}
                  onChange={onChange}
                  placeholder="https://example.com/media..."
                  type="url"
                />
                {mediaPreview && formData.mediaType === "image" && (
                  <div className="mt-4">
                    <img
                      src={mediaPreview}
                      alt="Preview"
                      className="h-48 w-full object-cover rounded-2xl border border-gray-200"
                      onError={() => setMediaPreview(null)}
                    />
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Tags</label>
              <input
                className={inputBase}
                name="tags"
                value={formData.tags}
                onChange={onChange}
                placeholder="technology, business, lifestyle (comma separated)"
              />
              <p className="text-xs text-gray-500 mt-2">Separate multiple tags with commas</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Location <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                className={inputBase}
                name="location"
                value={formData.location}
                onChange={onChange}
                placeholder="Add location..."
              />
            </div>
          </div>
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
            Publish Post
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* ------------------------------ Post Card -------------------------------- */

const PostCard = ({ post, onPostDelete }) => {
  const [liked, setLiked] = useState(!!post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [showComments, setShowComments] = useState(false);

  const toggleLike = async () => {
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!prevLiked);
    setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const res = await requestWithFallback(
        () => axiosInstance.post(`/posts/${post.id}/like`),
        [
          () => axiosInstance.put(`/posts/${post.id}/like`),
          () => axiosInstance.post(`/posts/like`, { id: post.id }),
        ]
      );
      if (!res?.data?.success) {
        setLiked(prevLiked);
        setLikeCount(prevCount);
        toast.error("Failed to update like");
      }
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
      toast.error("Failed to update like");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this post? This action cannot be undone.")) return;
    try {
      const res = await requestWithFallback(
        () => axiosInstance.delete(`/posts/${post.id}`),
        [() => axiosInstance.post(`/posts/${post.id}/delete`)]
      );
      if (res?.data?.success) {
        toast.success("Post deleted");
        onPostDelete?.(post.id);
      }
    } catch {
      toast.error("Failed to delete post");
    }
  };

  const formatDate = (s) => {
    const d = new Date(s);
    const now = new Date();
    const diffH = (now - d) / 36e5;
    if (diffH < 1) return `${Math.floor((now - d) / 6e4)}m ago`;
    if (diffH < 24) return `${Math.floor(diffH)}h ago`;
    return d.toLocaleDateString();
  };

  const privacyIcon = () => {
    switch (post.privacy) {
      case "followers":
        return <i className="fas fa-users text-blue-600" title="Followers only" />;
      case "private":
        return <i className="fas fa-lock text-gray-400" title="Private" />;
      default:
        return <i className="fas fa-globe text-emerald-600" title="Public" />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cx(card, "p-6 mb-6 hover:shadow-xl hover:shadow-gray-900/10 transition-all duration-300")}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center flex-1 min-w-0">
          <img
            src={post.author?.profilePicture || "/default-page-avatar.png"}
            alt={post.author?.name}
            className="h-14 w-14 rounded-2xl object-cover mr-4 border-2 border-white shadow-sm"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h6 className="text-gray-900 font-bold text-lg truncate">
                {post.author?.name}
              </h6>
              {post.author?.type === "page" && (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  Page
                </span>
              )}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <span className="font-medium">{formatDate(post.createdAt)}</span>
              {post.location && (
                <>
                  <span className="mx-2">•</span>
                  <i className="fas fa-map-marker-alt mr-1" />
                  <span className="truncate">{post.location}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {privacyIcon()}
          <div className="relative">
            <button className={btnSecondary + " !p-3"} title="More options">
              <i className="fas fa-ellipsis-h" />
            </button>
          </div>
        </div>
      </div>

      {post.content && (
        <div className="mb-4">
          <p className="text-gray-700 text-lg leading-relaxed">{post.content}</p>
        </div>
      )}

      {post.media && (
        <div className="mb-4">
          {post.mediaType === "image" ? (
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 cursor-pointer group">
              <img
                src={post.media}
                alt="Post media"
                className="w-full max-h-[500px] object-cover group-hover:scale-105 transition-transform duration-300"
                onClick={() => window.open(post.media, "_blank")}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
          ) : post.mediaType === "video" ? (
            <div className="rounded-2xl overflow-hidden border border-gray-200">
              <video
                controls
                className="w-full rounded-2xl"
                poster={post.thumbnail}
              >
                <source src={post.media} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          ) : null}
        </div>
      )}

      {post.tags && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {post.tags.split(",").map((t, i) => (
              <span
                key={i}
                className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 cursor-pointer transition-colors"
              >
                #{t.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-8">
          <button
            className={cx(
              "flex items-center gap-2 transition-all duration-200",
              liked
                ? "text-red-500 hover:text-red-600"
                : "text-gray-500 hover:text-red-500"
            )}
            onClick={toggleLike}
          >
            <div className="w-10 h-10 rounded-full bg-gray-50 hover:bg-red-50 flex items-center justify-center transition-colors">
              <i className={cx("fas fa-heart", liked && "animate-pulse")} />
            </div>
            <span className="font-semibold">{likeCount.toLocaleString()}</span>
          </button>

          <button
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors"
            onClick={() => setShowComments((s) => !s)}
          >
            <div className="w-10 h-10 rounded-full bg-gray-50 hover:bg-blue-50 flex items-center justify-center transition-colors">
              <i className="fas fa-comment" />
            </div>
            <span className="font-semibold">{(post.commentCount || 0).toLocaleString()}</span>
          </button>

          <button className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition-colors">
            <div className="w-10 h-10 rounded-full bg-gray-50 hover:bg-emerald-50 flex items-center justify-center transition-colors">
              <i className="fas fa-share" />
            </div>
            <span className="font-semibold">{(post.shareCount || 0).toLocaleString()}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button className={btnSecondary + " !px-4 !py-2"} title="Edit post">
            <i className="fas fa-edit mr-1" />
            Edit
          </button>
          <button
            className={btnDanger + " !px-4 !py-2"}
            onClick={handleDelete}
            title="Delete post"
          >
            <i className="fas fa-trash mr-1" />
            Delete
          </button>
        </div>
      </div>

      {showComments && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="mt-6 pt-6 border-t border-gray-100"
        >
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-comments text-blue-600 text-2xl" />
            </div>
            <h6 className="text-gray-900 font-bold text-lg mb-2">Comments Coming Soon!</h6>
            <p className="text-gray-500">We're working on bringing you an amazing commenting experience.</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

/* ------------------------------ Main View -------------------------------- */

const PagePostsManagement = ({ pageId, pageName, isOwner = false }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filters, setFilters] = useState({
    sortBy: "newest",
    mediaType: "all",
  });

  useEffect(() => {
    if (pageId) fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId, filters]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await requestWithFallback(
        () => axiosInstance.get(`/pages/${pageId}/posts`),
        [() => axiosInstance.get(`/pages/${pageId}/feed`)]
      );
      if (res?.data?.success) {
        let data = res.data.posts || [];
        if (filters.mediaType !== "all") {
          data = data.filter((p) => p.mediaType === filters.mediaType);
        }
        if (filters.sortBy === "newest")
          data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        else if (filters.sortBy === "oldest")
          data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        else if (filters.sortBy === "popular")
          data.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
        setPosts(data);
      }
    } catch (err) {
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const onPostCreated = (p) => setPosts((prev) => [p, ...prev]);
  const onPostDeleted = (id) =>
    setPosts((prev) => prev.filter((p) => p.id !== id));

  const onFilterChange = (e) =>
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className={cx(card, "p-8")}>
          <div className="flex flex-wrap items-center justify-between gap-6 mb-6">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mr-6">
                <i className="fas fa-newspaper text-white text-2xl" />
              </div>
              <div>
                <h1 className={cx(headerTitle, "text-3xl mb-2")}>{pageName} Posts</h1>
                <p className={cx(subText, "text-lg")}>
                  {posts.length} {posts.length === 1 ? "post" : "posts"} published
                </p>
              </div>
            </div>
            {isOwner && (
              <button className={btnPrimary} onClick={() => setShowCreate(true)}>
                <i className="fas fa-plus mr-2" />
                Create New Post
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-700">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Sort Posts
              </label>
              <select
                className={selectBase}
                name="sortBy"
                value={filters.sortBy}
                onChange={onFilterChange}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Filter by Media
              </label>
              <select
                className={selectBase}
                name="mediaType"
                value={filters.mediaType}
                onChange={onFilterChange}
              >
                <option value="all">All Posts</option>
                <option value="text">Text Only</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className={cx(card, "p-16 text-center")}>
            <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-700 border-t-blue-400" />
            </div>
            <p className={subText}>Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className={cx(card, "p-16 text-center")}>
            <div className="w-20 h-20 bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-newspaper text-purple-400 text-3xl" />
            </div>
            <h3 className="text-white text-2xl font-bold mb-3">
              No Posts Yet
            </h3>
            <p className={cx(subText, "text-lg mb-8 max-w-md mx-auto")}>
              {isOwner
                ? "Start engaging with your audience by creating your first post!"
                : "This page hasn't shared any posts yet. Check back later!"}
            </p>
            {isOwner && (
              <button className={btnPrimary} onClick={() => setShowCreate(true)}>
                <i className="fas fa-plus mr-2" />
                Create Your First Post
              </button>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm font-semibold text-gray-400">
                Showing {posts.length} {posts.length === 1 ? "post" : "posts"}
              </div>
            </div>
            <div className="space-y-6">
              {posts.map((p) => (
                <PostCard key={p.id} post={p} onPostDelete={onPostDeleted} />
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {showCreate && (
            <PostCreationModal
              show={showCreate}
              onClose={() => setShowCreate(false)}
              pageId={pageId}
              onPostCreated={onPostCreated}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PagePostsManagement;