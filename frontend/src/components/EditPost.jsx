// src/pages/EditPost.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const EditPost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axiosInstance.get(`/posts/${postId}`);
        setContent(res.data.content);
      } catch (error) {
        toast.error("Failed to load post.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId, navigate]);

  const handleUpdate = async () => {
    try {
      await axiosInstance.patch(`/posts/update/${postId}`, { content });
      toast.success("Post updated successfully!");
      navigate("/");
    } catch (error) {
      toast.error("Update failed.");
    }
  };

  if (loading) return <div className="text-center mt-5">Loading post...</div>;

  return (
    <div className="container mt-5 text-white">
      <h2>Edit Post</h2>
      <textarea
        className="form-control bg-dark text-white border-secondary my-3"
        rows={5}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button onClick={handleUpdate} className="btn btn-success me-2">
        Update Post
      </button>
      <button onClick={() => navigate(-1)} className="btn btn-outline-light">
        Cancel
      </button>
    </div>
  );
};

export default EditPost;
