import React from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { FiTrash2 } from "react-icons/fi";
import useThemeStore from "../store/themeStore";

const PostDeleteButton = ({ postId, onDeleteSuccess }) => {
  const MySwal = withReactContent(Swal);
  const { isDarkMode } = useThemeStore();

  const handleDelete = async () => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "You won't be able to undo this.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      background: isDarkMode ? "#1f2937" : "#ffffff",
      color: isDarkMode ? "#f9fafb" : "#111827",
      customClass: {
        popup: "swal2-popup-custom",
        title: "swal2-title-custom",
        htmlContainer: "swal2-html-custom",
        confirmButton: "swal2-confirm-custom",
        cancelButton: "swal2-cancel-custom",
      },
      heightAuto: false,
    });

    if (!result.isConfirmed) return;

    try {
      await axiosInstance.delete(`/posts/delete/${postId}`);
      toast.success("Post deleted successfully!");
      onDeleteSuccess?.(postId);
    } catch (error) {
      console.error("Failed to delete post:", error);
      toast.error("Failed to delete post. Please try again.");
    }
  };

  return (
    <button
      className={`dropdown-item d-flex align-items-center gap-2 ${isDarkMode ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-500"
        }`}
      onClick={handleDelete}
      type="button"
    >
      <FiTrash2 size={16} />
      Delete
    </button>
  );
};

export default PostDeleteButton;
