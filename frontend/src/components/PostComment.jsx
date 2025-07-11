import React, { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";
import {
  FaPaperPlane,
  FaHeart,
  FaRegHeart,
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
    if (postId && user) fetchComments();
  }, [postId, user]);

  const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });


  const handleAddComment = async () => {
  const trimmedText = newComment.trim();

  if (!trimmedText && !newMedia) {
    toast.error("Please add text or select an image.");
    return;
  }

  let payload = {
    text: trimmedText || ""
  };

  if (newMedia) {
    try {
      const base64Media = await fileToBase64(newMedia);

      if (!base64Media.startsWith("data:image/")) {
        toast.error("Only image files are allowed.");
        return;
      }

      payload.media = base64Media;
      
    } catch {
      toast.error("Failed to read image file.");
      return;
    }
  }

  try {
    await axiosInstance.post(`/comments/addComment/${postId}`, payload);

    
    setNewComment("");
    setNewMedia(null);
    fetchComments();
  } catch (error) {
    const message =
      error.response?.data?.message || "Failed to post comment.";
    toast.error(message);
    console.error("Add comment error:", error.response || error.message);
  }
};

  const handleReply = async (commentId) => {
  const text = replyText[commentId]?.trim();
  const file = replyMedia[commentId];

  if (!text && !file) {
    toast.error("Please add text or media to reply.");
    return;
  }

  let media = null;
  if (file) {
    try {
      media = await fileToBase64(file);
    } catch {
      toast.error("Failed to read reply media.");
      return;
    }
  }

  try {
    await axiosInstance.post(`/comments/reply/${commentId}`, {
      text: text || "",
      media,
    });
    setReplyText((prev) => ({ ...prev, [commentId]: "" }));
    setReplyMedia((prev) => ({ ...prev, [commentId]: null }));
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
          <FaImage size="20" />
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

      {newMedia && (
        <div className="comment-preview">
          <img
            src={URL.createObjectURL(newMedia)}
            alt="Preview"
            className="comment-media"
          />
          <button onClick={() => setNewMedia(null)}>Remove</button>
        </div>
      )}

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
                    {replyMedia[commentId] && (
                      <div className="reply-preview">
                        <img
                          src={URL.createObjectURL(replyMedia[commentId])}
                          alt="Reply Preview"
                          className="comment-media"
                        />
                        <button
                          onClick={() =>
                            setReplyMedia((prev) => ({
                              ...prev,
                              [commentId]: null,
                            }))
                          }
                        >
                          Remove
                        </button>
                      </div>
                    )}
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