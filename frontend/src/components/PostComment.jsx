import React, { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";
import { FaPaperPlane } from "react-icons/fa";
import "../styles/PostComment.css";
import toast from "react-hot-toast";

const PostComment = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [replyText, setReplyText] = useState({});
  const [showReplies, setShowReplies] = useState({});
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get("/users/myProfile");
        setUser(res.data.user || res.data);
      } catch (err) {
        toast.error("Failed to load profile. Please login.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const fetchComments = async () => {
    if (!postId) return;
    try {
      const res = await axiosInstance.get(`/comments/getComments/${postId}`);
      setComments(res.data?.comments || []);
    } catch (err) {
      toast.error("Error fetching comments");
      console.error(err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await axiosInstance.post(`/comments/addComment/${postId}`, {
        text: newComment,
      });
      setNewComment("");
      fetchComments();
    } catch (err) {
      toast.error("Could not add comment");
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axiosInstance.delete(`/comments/delete/${commentId}`);
      fetchComments();
    } catch (err) {
      toast.error("Could not delete comment");
      console.error(err);
    }
  };

  const handleEditComment = async () => {
    if (!editCommentText.trim()) return;
    try {
      await axiosInstance.patch(`/comments/update/${editCommentId}`, {
        text: editCommentText,
      });
      setEditCommentId(null);
      setEditCommentText("");
      fetchComments();
    } catch (err) {
      toast.error("Could not edit comment");
      console.error(err);
    }
  };

  const handleReply = async (commentId) => {
    const text = replyText[commentId];
    if (!commentId || !text?.trim()) {
      toast.error("Reply is empty or comment ID missing");
      return;
    }
    try {
      await axiosInstance.post(`/comments/reply/${commentId}`, { text });
      setReplyText((prev) => ({ ...prev, [commentId]: "" }));
      fetchComments();
    } catch (err) {
      toast.error("Could not post reply");
      console.error(err);
    }
  };

  const toggleReplies = (commentId) => {
    setShowReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

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
          onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
        />
        <button className="fb-send-btn" onClick={handleAddComment}>
          <FaPaperPlane size={16} />
        </button>
      </div>

      {comments.length === 0 ? (
        <p className="text-muted mt-3">No comments yet.</p>
      ) : (
        comments.map((comment) => {
          const commentId = comment._id;

          return (
            <div key={commentId} className="fb-comment-box">
              <img
                src={comment.user?.profilePicture || "/default-profile.png"}
                alt="user"
                className="fb-avatar"
              />
              <div className="fb-comment-content">
                <div className="fb-comment-bubble">
                  <strong>
                    {comment.user?.firstName || "User"} {comment.user?.lastName || ""}
                  </strong>

                  {editCommentId === commentId ? (
                    <>
                      <input
                        value={editCommentText}
                        onChange={(e) => setEditCommentText(e.target.value)}
                        className="form-control form-control-sm mt-1"
                      />
                      <div className="mt-2">
                        <button className="btn btn-success btn-sm" onClick={handleEditComment}>
                          Save
                        </button>
                        <button
                          className="btn btn-secondary btn-sm ms-2"
                          onClick={() => {
                            setEditCommentId(null);
                            setEditCommentText("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <p>{comment.text}</p>
                  )}
                </div>

                <div className="fb-comment-actions">
                  {editCommentId !== commentId && (
                    <>
                      <span onClick={() => toggleReplies(commentId)}>Reply</span>
                      <span
                        onClick={() => {
                          setEditCommentId(commentId);
                          setEditCommentText(comment.text);
                        }}
                      >
                        Edit
                      </span>
                      <span
                        className="text-danger"
                        onClick={() => handleDeleteComment(commentId)}
                      >
                        Delete
                      </span>
                    </>
                  )}
                </div>

                {/* Replies */}
                {showReplies[commentId] &&
                  (comment.replies || []).map((reply) => (
                    <div key={reply._id} className="fb-reply-box">
                      <img
                        src={reply.author?.profilePicture || "/default-profile.png"}
                        alt="reply user"
                        className="fb-avatar-small"
                      />
                      <div className="fb-comment-bubble">
                        <strong>{reply.author?.firstName || "User"}</strong>
                        <p>{reply.text}</p>
                      </div>
                    </div>
                  ))}

                {/* Reply input */}
                {showReplies[commentId] && (
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
                    <button
                      className="btn btn-outline-primary btn-sm mt-1"
                      onClick={() => handleReply(commentId)}
                    >
                      Reply
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default PostComment;
