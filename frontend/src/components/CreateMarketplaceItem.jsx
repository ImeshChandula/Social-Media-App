import React, { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";

const initialState = {
    category: "",
    title: "",
    description: "",
    price: "",
    currency: "USD",
    contactDetails: {
        phone: "",
        email: "",
        whatsapp: ""
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
    expiresAt: "", // ISO string or date string
};

const CreateMarketplaceItem = () => {
    const [formData, setFormData] = useState(initialState);
    const [images, setImages] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const [categories, setCategories] = useState([]);
    const [catLoading, setCatLoading] = useState(true);
    const [catError, setCatError] = useState("");

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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setImages(file);
        setPreviewUrl(URL.createObjectURL(file));
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

        const dataToSend = { ...formData, images };

        try {
            const res = await axiosInstance.post("/marketplace/createItem", dataToSend);
            toast.success(res.data.message);
            setFormData(initialState);
            setImages(null);
            setPreviewUrl("");
            navigate(location?.state?.from || -1);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to create item");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="marketplace-form container p-4 bg-white shadow rounded mt-4">
            <h2 className="text-center mb-4 fw-bold text-primary">Create Marketplace Item</h2>
            <div className="row g-4">
                {/* Category */}
                <div className="col-md-6">
                    <label className="text-black">Category</label>
                    {catLoading ? (
                        <div className="form-control bg-light text-muted">Loading categories...</div>
                    ) : catError ? (
                        <div className="text-danger">{catError}</div>
                    ) : (
                        <select name="category" className="form-select" value={formData.category} required onChange={handleChange}>
                            <option value="">Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.name}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Title */}
                <div className="col-md-6">
                    <label className="text-black">Title</label>
                    <input type="text" name="title" className="form-control" placeholder="Enter item title" required value={formData.title} onChange={handleChange} />
                </div>

                {/* Description */}
                <div className="col-12">
                    <label className="text-black">Description</label>
                    <textarea name="description" rows="4" className="form-control" placeholder="Enter a brief description" value={formData.description} onChange={handleChange}></textarea>
                </div>

                {/* Price & Currency */}
                <div className="col-md-6">
                    <label className="text-black">Price</label>
                    <input type="number" name="price" className="form-control" placeholder="Enter item price" required value={formData.price} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                    <label className="text-black">Currency</label>
                    <input type="text" name="currency" className="form-control" placeholder="USD, EUR" value={formData.currency} onChange={handleChange} />
                </div>

                {/* Contact Info */}
                <div className="col-md-4">
                    <label className="text-black">Phone</label>
                    <input type="text" name="contactDetails.phone" className="form-control" placeholder="Phone number" value={formData.contactDetails.phone} onChange={handleChange} />
                </div>
                <div className="col-md-4">
                    <label className="text-black">Email</label>
                    <input type="email" name="contactDetails.email" className="form-control" placeholder="Email address" value={formData.contactDetails.email} onChange={handleChange} />
                </div>
                <div className="col-md-4">
                    <label className="text-black">WhatsApp</label>
                    <input type="text" name="contactDetails.whatsapp" className="form-control" placeholder="WhatsApp number" value={formData.contactDetails.whatsapp} onChange={handleChange} />
                </div>

                {/* Location */}
                {["city", "state", "country", "postalCode"].map((field) => (
                    <div className="col-md-6" key={field}>
                        <label className="text-black text-capitalize">{field.replace(/([A-Z])/g, " $1")}</label>
                        <input type="text" name={`location.${field}`} className="form-control" placeholder={`Enter ${field}`} value={formData.location[field]} onChange={handleChange} />
                    </div>
                ))}

                {/* Condition & Quantity */}
                <div className="col-md-6">
                    <label className="text-black">Condition</label>
                    <select name="conditionType" className="form-select" value={formData.conditionType} onChange={handleChange}>
                        <option value="new">New</option>
                        <option value="like_new">Like New</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                    </select>
                </div>
                <div className="col-md-6">
                    <label className="text-black">Quantity</label>
                    <input type="number" name="quantity" min="1" className="form-control" value={formData.quantity} onChange={handleChange} />
                </div>

                {/* Negotiable */}
                <div className="col-md-6 d-flex align-items-center">
                    <input type="checkbox" name="isNegotiable" checked={formData.isNegotiable} onChange={handleChange} className="form-check-input me-2" />
                    <label className="form-check-label text-dark">Price is Negotiable</label>
                </div>

                {/* Tags */}
                <div className="col-md-6">
                    <label className="text-black">Tags</label>
                    <input type="text" name="tags" className="form-control" placeholder="Comma-separated tags" value={formData.tags.join(", ")} onChange={handleChange} />
                </div>

                {/* Expiration Date */}
                <div className="col-md-6">
                    <label className="text-black">Expiration Date</label>
                    <input
                        type="date"
                        name="expiresAt"
                        className="form-control"
                        value={formData.expiresAt}
                        onChange={handleChange}
                    />
                </div>

                {/* Image Upload */}
                <div className="col-12">
                    <label className="text-black">Upload Image</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="form-control" />
                    {previewUrl && (
                        <div className="mt-3">
                            <img src={previewUrl} alt="Preview" className="img-thumbnail" style={{ maxWidth: "250px" }} />
                        </div>
                    )}
                </div>

                {/* Submit */}
                <div className="col-12 text-center mt-4">
                    <button type="submit" className="btn btn-primary px-4 py-2 fw-semibold" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Submitting...
                            </>
                        ) : (
                            "Submit Item"
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default CreateMarketplaceItem;
