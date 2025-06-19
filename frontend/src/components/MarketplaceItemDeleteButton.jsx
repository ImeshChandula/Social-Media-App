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
      heightAuto: false,
    });

    if (!result.isConfirmed) return;

    try {
      await axiosInstance.delete(`/marketplace/items/${itemId}`);
      toast.success("Item deleted successfully!");
      onDeleteSuccess?.(itemId);
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete item.");
    }
  };

  return (
    <button className="dropdown-item text-danger" onClick={handleDelete} type="button">
      Delete
    </button>
  );
};

export default MarketplaceItemDeleteButton;
