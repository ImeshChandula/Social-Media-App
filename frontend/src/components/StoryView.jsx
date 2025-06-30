import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';
import Stories from '../components/Stories';
import toast from 'react-hot-toast';

/**
 * Full‑screen Facebook‑style story viewer.
 * Route:  /stories/:id
 */
const StoryView = () => {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [story, setStory]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  /** fetch story once (and mark as viewed) */
  const fetchStory = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      // 1) get story + user
      const { data } = await axiosInstance.get(`/stories/${id}`);
      const { story: s, user } = data;

      setStory({
        ...s,
        _id : s._id || s.id,
        user: {
          id: user.id,
          username: user.username,
          profilePicture: user.profilePicture,
          firstName : user.firstName  ?? '',
          lastName  : user.lastName   ?? ''
        }
      });

      // 2) mark viewed (best‑effort)
      axiosInstance.put(`/stories/${id}/view`).catch(() => {});
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to load story';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchStory(); }, [fetchStory]);

  /* ─── render ───────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="d-flex vh-100 justify-content-center align-items-center text-white">
        <div className="spinner-border me-2" role="status" />
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="vh-100 d-flex flex-column justify-content-center align-items-center">
        <p className="alert alert-danger">{error}</p>
        <button className="btn btn-secondary mt-2" onClick={() => navigate(-1)}>
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: 600 }}>
      <button className="btn btn-link text-white mb-3" onClick={() => navigate(-1)}>
        <i className="bi bi-arrow-left" /> Back
      </button>

      {/* reuse <Stories/> in non‑preview mode */}
      <Stories
        post={story}
        isUserPost={story.user?.id === story.userId}
        onDelete={() => navigate(-1)}
        onStoriesUpdate={setStory}
        isPreview={false}
      />
    </div>
  );
};

export default StoryView;
