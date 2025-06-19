import React from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

const MarketplaceItemDeleteButton = ({ itemId, onDeleteSuccess }) => {
  const MySwal = withReactContent(Swal);

  const handleDelete = async () => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "This item will be permanently removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      background: "#1f2937",
      color: "#f9fafb",
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
      const response = await axiosInstance.delete(`/marketplace/delete/${itemId}`);

      if (response.data?.success) {
        toast.success("Item deleted successfully!");
        onDeleteSuccess?.(itemId);
      } else {
        toast.error(response.data?.message || "Failed to delete item.");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      const message =
        error.response?.data?.message || "An error occurred while deleting the item.";
      toast.error(message);
    }
  };

  return (
    <button
      className="dropdown-item text-danger"
      onClick={handleDelete}
      type="button"
    >
      Delete
    </button>
  );
};

export default MarketplaceItemDeleteButton;
