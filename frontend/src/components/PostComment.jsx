import React, { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";
import { FaPaperPlane } from "react-icons/fa";
import "../styles/PostComment.css";

const PostComment = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [replyText, setReplyText] = useState({});
  const [showReplies, setShowReplies] = useState({});

  const fetchComments = async () => {
    if (!postId) return;
    try {
      const res = await axiosInstance.get(`/comments/getComments/${postId}`);
      setComments(res.data?.comments || []);
    } catch (err) {
      console.error("Error fetching comments", err);
      setComments([]);
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
      console.error("Error adding comment", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axiosInstance.delete(`/comments/delete/${commentId}`);
      fetchComments();
    } catch (err) {
      console.error("Error deleting comment", err);
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
      console.error("Error editing comment", err);
    }
  };

  const handleReply = async (commentId) => {
    const text = replyText[commentId];
    if (!text?.trim()) return;
    try {
      await axiosInstance.post(`/comments/reply/${commentId}`, { text });
      setReplyText((prev) => ({ ...prev, [commentId]: "" }));
      fetchComments();
    } catch (err) {
      console.error("Error replying", err);
    }
  };

  const toggleReplies = (commentId) => {
    setShowReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  return (
    <div className="p-3 border-top bg-light text-dark" style={{ maxHeight: "400px", overflowY: "auto" }}>
      <div className="mb-3 d-flex align-items-center">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="form-control me-2"
          placeholder="Write a comment..."
          onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
        />
        <button
          className="bg-primary text-white border-0 d-flex align-items-center justify-content-center"
          style={{ width: "40px", height: "40px", borderRadius: "50%" }}
          onClick={handleAddComment}
          title="Post"
        >
          <FaPaperPlane size={16} />
        </button>
      </div>

      {comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        comments.map((comment) => (
          <div key={comment._id} className="mb-3 p-2 bg-white rounded shadow-sm">
            <div className="d-flex align-items-start">
              <img
                src={comment.author?.profilePicture || "/default-profile.png"}
                alt="User"
                className="me-2 rounded-circle"
                style={{ width: "40px", height: "40px", objectFit: "cover" }}
              />
              <div className="flex-grow-1">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <strong>
                      {comment.author?.firstName || "User"} {comment.author?.lastName || ""}
                    </strong>
                    {editCommentId === comment._id ? (
                      <>
                        <input
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          className="form-control form-control-sm mt-1"
                        />
                        <div className="mt-2">
                          <button className="btn btn-success btn-sm" onClick={handleEditComment}>Save</button>
                          <button className="btn btn-secondary btn-sm ms-2" onClick={() => setEditCommentId(null)}>Cancel</button>
                        </div>
                      </>
                    ) : (
                      <p className="mb-1">{comment.text}</p>
                    )}
                  </div>
                  {editCommentId !== comment._id && (
                    <div>
                      <button
                        className="btn btn-link btn-sm text-primary"
                        onClick={() => {
                          setEditCommentId(comment._id);
                          setEditCommentText(comment.text);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-link btn-sm text-danger"
                        onClick={() => handleDeleteComment(comment._id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-2 ms-4">
                  <button
                    className="btn btn-link btn-sm"
                    onClick={() => toggleReplies(comment._id)}
                  >
                    {showReplies[comment._id] ? "Hide Replies" : "View Replies"}
                  </button>

                  {showReplies[comment._id] &&
                    (comment.replies || []).map((reply) => (
                      <div key={reply._id} className="d-flex align-items-start mt-2 ms-3">
                        <img
                          src={reply.author?.profilePicture || "/default-profile.png"}
                          alt="User"
                          className="me-2 rounded-circle"
                          style={{ width: "30px", height: "30px", objectFit: "cover" }}
                        />
                        <div>
                          <strong>
                            {reply.author?.firstName || "User"} {reply.author?.lastName || ""}
                          </strong>
                          <p className="mb-1">{reply.text}</p>
                        </div>
                      </div>
                    ))}

                  <div className="mt-2">
                    <input
                      value={replyText[comment._id] || ""}
                      onChange={(e) =>
                        setReplyText((prev) => ({ ...prev, [comment._id]: e.target.value }))
                      }
                      placeholder="Write a reply..."
                      className="form-control form-control-sm"
                    />
                    <button
                      className="btn btn-outline-primary btn-sm mt-1"
                      onClick={() => handleReply(comment._id)}
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PostComment;
