// PostComment.jsx
import React, { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";
import "../styles/PostComment.css";

const PostComment = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [replyText, setReplyText] = useState({});
  const [showReplies, setShowReplies] = useState({});

  // Fetch comments from API
  const fetchComments = async () => {
    if (!postId) return;
    try {
      const res = await axiosInstance.get(`/comments/getComments/${postId}`);
      console.log("Fetched comments data:", res.data);

      // Adjust to your API response
      const commentsData = res.data.comments || res.data || [];
      setComments(commentsData);
    } catch (err) {
      console.error("Error fetching comments", err);
      setComments([]);
    }
  };

  // Add new comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await axiosInstance.post(`/comments/addComment/${postId}`, { text: newComment });
      setNewComment("");
      fetchComments();
    } catch (err) {
      console.error("Error adding comment", err);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    try {
      await axiosInstance.delete(`/comments/delete/${commentId}`);
      fetchComments();
    } catch (err) {
      console.error("Error deleting comment", err);
    }
  };

  // Edit comment save
  const handleEditComment = async () => {
    if (!editCommentText.trim()) return;
    try {
      await axiosInstance.patch(`/comments/update/${editCommentId}`, { text: editCommentText });
      setEditCommentId(null);
      setEditCommentText("");
      fetchComments();
    } catch (err) {
      console.error("Error updating comment", err);
    }
  };

  // Add reply to a comment
  const handleReply = async (commentId) => {
    const text = replyText[commentId];
    if (!text?.trim()) return;
    try {
      await axiosInstance.post(`/comments/reply/${commentId}`, { text });
      setReplyText((prev) => ({ ...prev, [commentId]: "" }));
      fetchComments();
    } catch (err) {
      console.error("Error replying to comment", err);
    }
  };

  // Toggle replies visibility
  const toggleReplies = (commentId) => {
    setShowReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  return (
    <div className="p-3 border-top bg-light text-dark" style={{ maxHeight: "400px", overflowY: "auto" }}>
      <div className="mb-3">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="form-control"
          placeholder="Write a comment..."
        />
        <button className="btn btn-primary mt-2" onClick={handleAddComment}>
          Post Comment
        </button>
      </div>

      {comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        comments.map((comment) => (
          <div key={comment._id} className="mb-3 p-2 bg-white rounded shadow-sm">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>{comment.author?.firstName || "User"}</strong>:{" "}
                {editCommentId === comment._id ? (
                  <>
                    <input
                      value={editCommentText}
                      onChange={(e) => setEditCommentText(e.target.value)}
                      className="form-control form-control-sm d-inline-block w-75"
                    />
                    <button
                      className="btn btn-success btn-sm ms-2"
                      onClick={handleEditComment}
                    >
                      Save
                    </button>
                    <button
                      className="btn btn-secondary btn-sm ms-2"
                      onClick={() => setEditCommentId(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  comment.text
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
                comment.replies?.map((reply) => (
                  <div key={reply._id} className="ms-3">
                    <strong>{reply.author?.firstName || "User"}</strong>: {reply.text}
                  </div>
                ))}

              <div className="mt-2">
                <input
                  value={replyText[comment._id] || ""}
                  onChange={(e) =>
                    setReplyText((prev) => ({
                      ...prev,
                      [comment._id]: e.target.value,
                    }))
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
        ))
      )}
    </div>
  );
};

export default PostComment;
