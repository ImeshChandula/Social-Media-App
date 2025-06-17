import React, { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";
import {
  FaPaperPlane,
  FaHeart,
  FaRegHeart,
  FaEdit,
  FaTrash,
  FaReply,
  FaImage,
} from "react-icons/fa";
import toast from "react-hot-toast";
import "../styles/PostComment.css";

const PostComment = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newMedia, setNewMedia] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [replyMedia, setReplyMedia] = useState({});
  const [showReplies, setShowReplies] = useState({});
  const [user, setUser] = useState(null);
  const [likedComments, setLikedComments] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get("/users/myProfile");
        setUser(res.data.user || res.data);
      } catch {
        toast.error("Login required.");
      }
    };
    fetchUser();
  }, []);

  const fetchComments = async () => {
    try {
      const res = await axiosInstance.get(`/comments/getComments/${postId}`);
      const fetched = res.data?.comments || [];
      setComments(fetched);
      const liked = fetched
        .filter((c) => c.likes?.includes(user?.id))
        .map((c) => c.id);
      setLikedComments(liked || []);
    } catch {
      toast.error("Error loading comments.");
    }
  };

  useEffect(() => {
    if (postId) fetchComments();
  }, [postId, user]);

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleAddComment = async () => {
    if (!newComment.trim() && !newMedia) {
      toast.error("Please add text or media.");
      return;
    }

    const media = newMedia ? await fileToBase64(newMedia) : null;

    try {
      const res = await axiosInstance.post(`/comments/addComment/${postId}`, {
        text: newComment || "",
        media,
      });
      setNewComment("");
      setNewMedia(null);
      const newId = res.data?.comment?.id;
      setShowReplies((prev) => ({ ...prev, [newId]: true }));
      fetchComments();
    } catch {
      toast.error("Failed to post comment.");
    }
  };

  const handleReply = async (commentId) => {
    const text = replyText[commentId];
    const file = replyMedia[commentId];

    if (!text?.trim() && !file) {
      toast.error("Please add text or media to reply.");
      return;
    }

    const media = file ? await fileToBase64(file) : null;

    try {
      await axiosInstance.post(`/comments/reply/${commentId}`, {
        text: text || "",
        media,
      });
      setReplyText((prev) => ({ ...prev, [commentId]: "" }));
      setReplyMedia((prev) => ({ ...prev, [commentId]: null }));
      setShowReplies((prev) => ({ ...prev, [commentId]: true }));
      fetchComments();
    } catch {
      toast.error("Reply failed.");
    }
  };

  const toggleLikeComment = async (commentId) => {
    try {
      await axiosInstance.post(`/likes/toComment/${commentId}`);
      fetchComments();
    } catch {
      toast.error("Failed to like comment.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axiosInstance.delete(`/comments/delete/${commentId}`);
      fetchComments();
    } catch {
      toast.error("Failed to delete comment.");
    }
  };

  const toggleReplies = (commentId) => {
    setShowReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  return (
    <div className="fb-comment-container">
      <div className="fb-comment-input-area">
        <img
          src={user?.profilePicture || "/default-profile.png"}
          alt="Profile"
          className="fb-avatar"
        />
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="fb-comment-input"
        />
        <label>
          <FaImage />
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => setNewMedia(e.target.files[0])}
          />
        </label>
        <button className="fb-send-btn" onClick={handleAddComment}>
          <FaPaperPlane />
        </button>
      </div>

      {comments.map((comment) => {
        const commentId = comment.id;
        const isLiked = likedComments.includes(commentId);
        return (
          <div key={commentId} className="fb-comment-box">
            <img
              src={comment.user?.profilePicture || "/default-profile.png"}
              alt="user"
              className="fb-avatar"
            />
            <div className="fb-comment-content">
              <div className="fb-comment-bubble">
                <strong>{comment.user?.firstName}</strong>
                {comment.text && <p>{comment.text}</p>}
                {comment.media && (
                  <img
                    src={comment.media}
                    alt="comment media"
                    className="comment-media"
                  />
                )}
              </div>
              <div className="fb-comment-actions">
                <span onClick={() => toggleLikeComment(commentId)}>
                  {isLiked ? <FaHeart color="red" /> : <FaRegHeart />}{" "}
                  {comment.likeCount || 0}
                </span>
                <span onClick={() => toggleReplies(commentId)}>
                  <FaReply /> Reply
                </span>
                {user?.id === comment.user?.id && (
                  <span onClick={() => handleDeleteComment(commentId)}>
                    <FaTrash /> Delete
                  </span>
                )}
              </div>

              {showReplies[commentId] && (
                <>
                  {(comment.replies || []).map((reply) => (
                    <div key={reply.id} className="fb-reply-box">
                      <img
                        src={
                          reply.user?.profilePicture || "/default-profile.png"
                        }
                        alt="reply user"
                        className="fb-avatar-small"
                      />
                      <div className="fb-comment-bubble">
                        <strong>{reply.user?.firstName}</strong>
                        {reply.text && <p>{reply.text}</p>}
                        {reply.media && (
                          <img
                            src={reply.media}
                            alt="reply media"
                            className="comment-media"
                          />
                        )}
                        <div className="reply-likes">
                          <FaHeart size={12} color="red" />{" "}
                          {reply.likeCount || 0}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="fb-reply-input">
                    <input
                      value={replyText[commentId] || ""}
                      onChange={(e) =>
                        setReplyText((prev) => ({
                          ...prev,
                          [commentId]: e.target.value,
                        }))
                      }
                      placeholder="Write a reply..."
                      className="form-control form-control-sm"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setReplyMedia((prev) => ({
                          ...prev,
                          [commentId]: e.target.files[0],
                        }))
                      }
                      className="form-control form-control-sm mt-1"
                    />
                    <button
                      className="btn btn-outline-primary btn-sm mt-1"
                      onClick={() => handleReply(commentId)}
                    >
                      Reply
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PostComment;
