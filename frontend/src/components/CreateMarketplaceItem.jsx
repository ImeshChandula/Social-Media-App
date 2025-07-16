import React, { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";

import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";
import { parsePhoneNumberFromString } from "libphonenumber-js";

const initialState = {
  category: "",
  title: "",
  description: "",
  price: "",
  currency: "USD",
  contactDetails: {
    phone: "",
    email: "",
    whatsapp: "",
  },
  location: {
    city: "",
    state: "",
    country: "",
    postalCode: "",
  },
  conditionType: "new",
  quantity: 1,
  isNegotiable: false,
  tags: [],
  expiresAt: "",
};

const CreateMarketplaceItem = () => {
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState("");

  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const [errors, setErrors] = useState({
    phone: "",
    whatsapp: "",
  });

  const validatePhoneNumber = (phone) => {
    if (!phone) return false;
    const phoneNumber = parsePhoneNumberFromString(phone);
    return phoneNumber ? phoneNumber.isValid() : false;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name.includes("contactDetails.") || name.includes("location.")) {
      const [parent, key] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [key]: value,
        },
      }));
    } else if (name === "tags") {
      setFormData((prev) => ({
        ...prev,
        tags: value.split(",").map((tag) => tag.trim()),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addTag = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = e.target.value.trim().replace(/,$/, "");
      if (value && !formData.tags.includes(value) && formData.tags.length < 20) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, value],
        }));
      }
      e.target.value = "";
    }
  };

  const removeTag = (index) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [];
    const newPreviews = [];

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`Only image files are allowed: ${file.name}`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result);
        newPreviews.push(reader.result);

        if (newImages.length === files.length) {
          setImages((prev) => [...prev, ...newImages]);
          setPreviewUrls((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get("/categories/active/marketplace");
        setCategories(res.data.data);
        setCatError("");
      } catch (err) {
        setCatError("Failed to load categories");
      } finally {
        setCatLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const dataToSend = {
      ...formData,
      images,
    };

    if (!formData.expiresAt) {
      delete dataToSend.expiresAt;
    }

    try {
      const res = await axiosInstance.post("/marketplace/createItem", dataToSend);
      toast.success(res.data.message);
      setFormData(initialState);
      setImages([]);
      setPreviewUrls([]);
      navigate(location?.state?.from || -1);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        backgroundColor: "#ffffff",
        padding: "25px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        fontFamily: "'Segoe UI', sans-serif",
        color: "#2c3e50",
        maxWidth: "1100px",
        margin: "auto",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "25px",
          color: "#2980b9",
          fontWeight: "700",
        }}
      >
        Create Marketplace Item
      </h2>

      <div className="row g-4">
        {/* General Information */}
        <div style={{ fontSize: "18px", fontWeight: "600", color: "#16a085", marginBottom: "10px" }}>
          General Information
        </div>

        {/* Title */}
        <div className="col-md-6">
          <label style={{ fontWeight: "500" }}>Title</label>
          <input
            type="text"
            name="title"
            className="form-control"
            placeholder="Enter item title"
            required
            value={formData.title}
            onChange={handleChange}
            style={{ background: "#fafafa", border: "1px solid #ccc" }}
          />
        </div>

        {/* Category */}
        <div className="col-md-6">
          <label style={{ fontWeight: "500" }}>Category</label>
          {catLoading ? (
            <div className="form-control bg-light text-dark">Loading categories...</div>
          ) : catError ? (
            <div style={{ color: "red" }}>{catError}</div>
          ) : (
            <select
              name="category"
              className="form-select"
              value={formData.category}
              required
              onChange={handleChange}
              style={{ background: "#fafafa", border: "1px solid #ccc" }}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Description */}
        <div className="col-12">
          <label style={{ fontWeight: "500" }}>Description</label>
          <textarea
            name="description"
            rows="3"
            className="form-control"
            placeholder="Enter item description"
            value={formData.description}
            onChange={handleChange}
            style={{ background: "#fafafa", border: "1px solid #ccc" }}
          />
        </div>

        {/* Price */}
        <div className="col-md-6">
          <label style={{ fontWeight: "500" }}>Price</label>
          <input
            type="number"
            name="price"
            className="form-control"
            placeholder="Price"
            required
            value={formData.price}
            onChange={handleChange}
            style={{ background: "#fafafa", border: "1px solid #ccc" }}
          />
        </div>

        {/* Currency */}
        <div className="col-md-6">
          <label style={{ fontWeight: "500" }}>Currency</label>
          <input
            type="text"
            name="currency"
            className="form-control"
            placeholder="USD"
            value={formData.currency}
            onChange={handleChange}
            style={{ background: "#fafafa", border: "1px solid #ccc" }}
          />
        </div>

        {/* ✅ Condition */}
        <div className="col-md-6">
          <label style={{ fontWeight: "500" }}>Condition</label>
          <select
            name="conditionType"
            className="form-select"
            value={formData.conditionType}
            onChange={handleChange}
            style={{ background: "#fafafa", border: "1px solid #ccc" }}
          >
            <option value="new">New</option>
            <option value="like_new">Like New</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>
        </div>

        {/* ✅ Quantity */}
        <div className="col-md-6">
          <label style={{ fontWeight: "500" }}>Quantity</label>
          <input
            type="number"
            name="quantity"
            min="1"
            className="form-control"
            value={formData.quantity}
            onChange={handleChange}
            style={{ background: "#fafafa", border: "1px solid #ccc" }}
          />
        </div>

        {/* ✅ Negotiable */}
        <div className="col-12 d-flex align-items-center mt-2">
          <input
            type="checkbox"
            name="isNegotiable"
            checked={formData.isNegotiable}
            onChange={handleChange}
            className="form-check-input me-2"
          />
          <label style={{ fontWeight: "500" }}>Price is Negotiable</label>
        </div>

        {/* ✅ Contact Details */}
        <div style={{ fontSize: "18px", fontWeight: "600", color: "#16a085", marginTop: "20px" }}>
          Contact Details
        </div>

        <div className="col-md-4">
          <label style={{ fontWeight: "500" }}>Phone</label>
          <PhoneInput
            enableSearch
            inputProps={{
              name: "contactDetails.phone",
              className: `form-control ${errors.phone ? "is-invalid" : ""}`,
            }}
            value={formData.contactDetails.phone}
            onChange={(phone) =>
              setFormData((prev) => ({
                ...prev,
                contactDetails: { ...prev.contactDetails, phone: `+${phone}` },
              }))
            }
            onBlur={() =>
              setErrors((prev) => ({
                ...prev,
                phone:
                  formData.contactDetails.phone &&
                  !validatePhoneNumber(formData.contactDetails.phone)
                    ? "Invalid phone number."
                    : "",
              }))
            }
          />
          {errors.phone && <div style={{ color: "red" }}>{errors.phone}</div>}
        </div>

        <div className="col-md-4">
          <label style={{ fontWeight: "500" }}>WhatsApp</label>
          <PhoneInput
            enableSearch
            inputProps={{
              name: "contactDetails.whatsapp",
              className: `form-control ${errors.whatsapp ? "is-invalid" : ""}`,
            }}
            value={formData.contactDetails.whatsapp}
            onChange={(whatsapp) =>
              setFormData((prev) => ({
                ...prev,
                contactDetails: { ...prev.contactDetails, whatsapp: `+${whatsapp}` },
              }))
            }
            onBlur={() =>
              setErrors((prev) => ({
                ...prev,
                whatsapp:
                  formData.contactDetails.whatsapp &&
                  !validatePhoneNumber(formData.contactDetails.whatsapp)
                    ? "Invalid WhatsApp number."
                    : "",
              }))
            }
          />
          {errors.whatsapp && <div style={{ color: "red" }}>{errors.whatsapp}</div>}
        </div>

        <div className="col-md-4">
          <label style={{ fontWeight: "500" }}>Email</label>
          <input
            type="email"
            name="contactDetails.email"
            className="form-control"
            placeholder="Email"
            value={formData.contactDetails.email}
            onChange={handleChange}
            style={{ background: "#fafafa", border: "1px solid #ccc" }}
          />
        </div>

        {/* ✅ Location Details */}
        <div style={{ fontSize: "18px", fontWeight: "600", color: "#16a085", marginTop: "20px" }}>
          Location Details
        </div>

        {["city", "state", "country", "postalCode"].map((field) => (
          <div className="col-md-6" key={field}>
            <label style={{ fontWeight: "500" }}>{field}</label>
            <input
              type="text"
              name={`location.${field}`}
              className="form-control"
              placeholder={`Enter ${field}`}
              value={formData.location[field]}
              onChange={handleChange}
              style={{ background: "#fafafa", border: "1px solid #ccc" }}
            />
          </div>
        ))}

        {/* ✅ Tags */}
        <div className="col-md-6">
          <label style={{ fontWeight: "500" }}>Tags</label>
          <input
            type="text"
            className="form-control"
            placeholder="Type tag & press Enter"
            onKeyDown={addTag}
            style={{ background: "#fafafa", border: "1px solid #ccc" }}
          />
          {formData.tags.length > 0 && (
            <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {formData.tags.map((tag, idx) => (
                <span
                  key={idx}
                  style={{
                    backgroundColor: "#3498db",
                    color: "#fff",
                    borderRadius: "15px",
                    padding: "6px 12px",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = "#2980b9")}
                  onMouseOut={(e) => (e.target.style.backgroundColor = "#3498db")}
                  onClick={() => removeTag(idx)}
                >
                  {tag} ✕
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ✅ Expiration Date */}
        <div className="col-md-6">
          <label style={{ fontWeight: "500" }}>Expiration Date</label>
          <input
            type="date"
            name="expiresAt"
            className="form-control"
            value={formData.expiresAt}
            onChange={handleChange}
            min={new Date().toISOString().split("T")[0]}
            style={{ background: "#fafafa", border: "1px solid #ccc" }}
          />
        </div>

        {/* ✅ Image Upload */}
        <div style={{ fontSize: "18px", fontWeight: "600", color: "#16a085", marginTop: "20px" }}>
          Upload Images
        </div>
        <div className="col-12">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="form-control"
          />
          {previewUrls.length > 0 && (
            <div style={{ marginTop: "15px", display: "flex", flexWrap: "wrap", gap: "15px" }}>
              {previewUrls.map((src, idx) => (
                <div
                  key={idx}
                  style={{
                    width: "120px",
                    height: "120px",
                    position: "relative",
                    borderRadius: "8px",
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  }}
                >
                  <img
                    src={src}
                    alt={`Preview ${idx}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    style={{
                      position: "absolute",
                      top: "6px",
                      right: "6px",
                      backgroundColor: "rgba(231, 76, 60, 0.9)",
                      border: "none",
                      borderRadius: "50%",
                      width: "28px",
                      height: "28px",
                      color: "#fff",
                      fontSize: "16px",
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit & Cancel */}
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: "#3498db",
              color: "#fff",
              fontWeight: "600",
              padding: "10px 22px",
              borderRadius: "8px",
              border: "none",
              marginRight: "10px",
              cursor: "pointer",
              transition: "0.3s",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#2980b9")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#3498db")}
          >
            {loading ? "Submitting..." : "Submit Item"}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              backgroundColor: "#f39c12",
              color: "#fff",
              fontWeight: "600",
              padding: "10px 22px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              transition: "0.3s",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#d68910")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#f39c12")}
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
};

export default CreateMarketplaceItem;
