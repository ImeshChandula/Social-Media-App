// src/components/StoryViewEdit.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../lib/axios";

const StoryViewEdit = () => {
    const { id } = useParams();
    const [story, setStory] = useState(null);
    const [media, setMedia] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
    const fetchStory = async () => {
        try {
            const res = await axiosInstance.get(`/stories/${id}`);
            setStory(res.data);
            setMedia(res.data.media || "");

            // Mark story as viewed
            await axiosInstance.put(`/stories/${id}/view`);
        } catch (err) {
            setError("Failed to load story");
        } finally {
            setLoading(false);
        }
    };

    fetchStory();
}, [id]);

    const handleUpdate = async () => {
        try {
            await axiosInstance.patch(`/stories/update/${id}`, { media });
            alert("Story updated!");
            setStory((prev) => ({ ...prev, media }));
            setEditMode(false);
        } catch (err) {
            alert("Failed to update: " + (err.response?.data?.msg || err.message));
        }
    };

    if (loading) return <div className="text-white">Loading story...</div>;
    if (error) return <div className="text-danger">{error}</div>;
    if (!story) return null;

    return (
        <div className="text-white p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>{story.user?.username}'s Story</h3>
                <button
                    onClick={() => setEditMode(!editMode)}
                    className="btn btn-sm btn-secondary"
                >
                    {editMode ? "Cancel Edit" : "Edit Story"}
                </button>
            </div>

            {editMode ? (
                <>
                    <label className="form-label">Media URL</label>
                    <input
                        value={media}
                        onChange={(e) => setMedia(e.target.value)}
                        className="form-control mb-3"
                        placeholder="Enter new media URL"
                    />
                    <button onClick={handleUpdate} className="btn btn-primary">
                        Save Changes
                    </button>
                </>
            ) : (
                <>
                    <img
                        src={story.media}
                        alt="Story"
                        style={{ maxWidth: "100%", borderRadius: "10px" }}
                        className="mb-3"
                    />
                    <p>Views: {story.viewers?.length || 0}</p>
                </>
            )}
        </div>
    );
};

export default StoryViewEdit;
