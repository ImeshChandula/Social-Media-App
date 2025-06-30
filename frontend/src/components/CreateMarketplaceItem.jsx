import React, { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";

import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/bootstrap.css';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

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
    expiresAt: "",
};

const CreateMarketplaceItem = () => {
    const [formData, setFormData] = useState(initialState);
    const [previewUrl, setPreviewUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const [categories, setCategories] = useState([]);
    const [catLoading, setCatLoading] = useState(true);
    const [catError, setCatError] = useState("");

    const [images, setImages] = useState([]); // now an array
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

                // Once all files are processed, update the state
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
        <form onSubmit={handleSubmit} className="marketplace-form container p-4 bg-dark shadow rounded mt-4">
            <h2 className="text-center mb-4 fw-bold text-primary">Create Marketplace Item</h2>
            <div className="row g-4">

                {/* ────── Section: General Info ────── */}
                <div className="section-title mb-0">General Information</div>

                <div className="col-md-6">
                    <label className="form-label">Title</label>
                    <input type="text" name="title" className="form-control" placeholder="Item title" required value={formData.title} onChange={handleChange} />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Category</label>
                    {catLoading ? (
                        <div className="form-control bg-light text-muted">Loading categories...</div>
                    ) : catError ? (
                        <div className="text-danger">{catError}</div>
                    ) : (
                        <select name="category" className="form-select" value={formData.category} required onChange={handleChange}>
                            <option value="">Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="col-12">
                    <label className="form-label">Description</label>
                    <textarea name="description" rows="4" className="form-control" placeholder="Item description" value={formData.description} onChange={handleChange}></textarea>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Price</label>
                    <input type="number" name="price" className="form-control" placeholder="Price" required value={formData.price} onChange={handleChange} />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Currency</label>
                    <input type="text" name="currency" className="form-control" placeholder="USD, EUR..." value={formData.currency} onChange={handleChange} />
                </div>

                {/* ────── Section: Contact Details ────── */}
                <div className="section-title mt-4 mb-0">Contact Details</div>

                <div className="col-md-4">
                    <label className="form-label">Phone</label>
                    <PhoneInput
                        enableSearch={true}
                        searchPlaceholder="Search country"
                        inputProps={{
                            name: 'contactDetails.phone',
                            required: false,
                            className: `form-control ${errors.phone ? 'is-invalid' : ''}`
                        }}
                        value={formData.contactDetails.phone}
                        onChange={(phone) =>
                            setFormData((prev) => ({
                                ...prev,
                                contactDetails: {
                                    ...prev.contactDetails,
                                    phone: `+${phone}`
                                }
                            }))
                        }
                        onBlur={() => {
                            setErrors((prev) => ({
                                ...prev,
                                phone:
                                    formData.contactDetails.phone &&
                                        !validatePhoneNumber(formData.contactDetails.phone)
                                        ? 'Invalid phone number. Please enter a valid number for the selected country.'
                                        : ''
                            }));
                        }}
                    />
                    {errors.phone && <div className="invalid-feedback d-block">{errors.phone}</div>}
                </div>

                <div className="col-md-4">
                    <label className="form-label">WhatsApp</label>
                    <PhoneInput
                        enableSearch={true}
                        searchPlaceholder="Search country"
                        inputProps={{
                            name: 'contactDetails.whatsapp',
                            required: false,
                            className: `form-control ${errors.whatsapp ? 'is-invalid' : ''}`
                        }}
                        value={formData.contactDetails.whatsapp}
                        onChange={(whatsapp) =>
                            setFormData((prev) => ({
                                ...prev,
                                contactDetails: {
                                    ...prev.contactDetails,
                                    whatsapp: `+${whatsapp}`
                                }
                            }))
                        }
                        onBlur={() => {
                            setErrors((prev) => ({
                                ...prev,
                                whatsapp:
                                    formData.contactDetails.whatsapp &&
                                        !validatePhoneNumber(formData.contactDetails.whatsapp)
                                        ? 'Invalid WhatsApp number. Use international format.'
                                        : ''
                            }));
                        }}
                    />
                    {errors.whatsapp && <div className="invalid-feedback d-block">{errors.whatsapp}</div>}
                </div>

                <div className="col-md-4">
                    <label className="form-label">Email</label>
                    <input type="email" name="contactDetails.email" className="form-control" placeholder="Email address" value={formData.contactDetails.email} onChange={handleChange} />
                </div>

                {/* ────── Section: Location ────── */}
                <div className="section-title mt-4 mb-0">Location Details</div>

                {["city", "state", "country", "postalCode"].map((field) => (
                    <div className="col-md-6" key={field}>
                        <label className="form-label text-capitalize">{field.replace(/([A-Z])/g, " $1")}</label>
                        <input type="text" name={`location.${field}`} className="form-control" placeholder={`Enter ${field}`} value={formData.location[field]} onChange={handleChange} />
                    </div>
                ))}

                {/* ────── Section: Product Details ────── */}
                <div className="section-title mt-4 mb-0">Product Details</div>

                <div className="col-md-6">
                    <label className="form-label">Condition</label>
                    <select name="conditionType" className="form-select" value={formData.conditionType} onChange={handleChange}>
                        <option value="new">New</option>
                        <option value="like_new">Like New</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Quantity</label>
                    <input type="number" name="quantity" min="1" className="form-control" value={formData.quantity} onChange={handleChange} />
                </div>

                <div className="col-md-6 d-flex align-items-center">
                    <input type="checkbox" name="isNegotiable" checked={formData.isNegotiable} onChange={handleChange} className="form-check-input me-2" />
                    <label className="form-check-label text-white">Price is Negotiable</label>
                </div>

                {/* ────── Section: Extra ────── */}
                <div className="section-title mt-4 mb-0 ">Extra Information</div>

                <div className="col-md-6">
                    <label className="form-label">
                        Tags <small className="text-white-50">(optional)</small>
                    </label>
                    <input type="text" name="tags" className="form-control" placeholder="Comma-separated tags" value={formData.tags.join(", ")} onChange={handleChange} />
                </div>

                <div className="col-md-6">
                    <label className="form-label">
                        Expiration Date <small className="text-white-50">(optional, defaults to 30 days)</small>
                    </label>
                    <input
                        type="date"
                        name="expiresAt"
                        className="form-control"
                        value={formData.expiresAt}
                        onChange={handleChange}
                        min={new Date().toISOString().split("T")[0]}
                    />
                </div>

                {/* ────── Section: Media ────── */}
                <div className="section-title mt-4 mb-0 ">Upload Image</div>

                <div className="col-12">
                    <input type="file" accept="image/*" multiple onChange={handleFileChange} className="form-control" />

                    {previewUrls.length > 0 && (
                        <div className="mt-3 d-flex flex-wrap gap-3">
                            {previewUrls.map((src, idx) => (
                                <div key={idx} className="position-relative" style={{ width: '120px', height: '120px' }}>
                                    <img
                                        src={src}
                                        alt={`Preview ${idx}`}
                                        className="rounded border w-100 h-100"
                                        style={{ objectFit: 'contain' }}
                                    />
                                    <button
                                        type="button"
                                        className="bg-danger text-white rounded-circle position-absolute"
                                        onClick={() => removeImage(idx)}
                                        style={{
                                            top: '4px',
                                            right: '4px',
                                            zIndex: 10,
                                            width: '28px',
                                            height: '28px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: 0,
                                        }}
                                        title="Remove Image"
                                    >
                                        <i className="bi bi-trash" style={{ fontSize: '16px' }}></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ────── Submit & Cancel Button ────── */}
                <div className="col-12 text-center mt-4 d-flex justify-content-center gap-3">
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

                    <button
                        type="button"
                        className="btn btn-warning px-4 py-2 fw-semibold"
                        onClick={() => navigate(-1)}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </form>

    );
};

export default CreateMarketplaceItem;
