import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/bootstrap.css';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

const EditMarketPlaceItem = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        category: '',
        title: '',
        description: '',
        price: '',
        currency: 'USD',
        contactDetails: { phone: '', email: '', whatsapp: '' },
        location: { city: '', state: '', country: '', postalCode: '' },
        conditionType: '',
        status: 'active',
        images: null,
        isNegotiable: false,
        expiresAt: '',
        tags: [],
    });

    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [catLoading, setCatLoading] = useState(true);
    const [catError, setCatError] = useState("");
    const [previewImages, setPreviewImages] = useState([]);

    const [errors, setErrors] = useState({
        phone: "",
        whatsapp: "",
    });

    const validatePhoneNumber = (phone) => {
        if (!phone) return false;
        const phoneNumber = parsePhoneNumberFromString(phone);
        return phoneNumber ? phoneNumber.isValid() : false;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [itemRes, categoryRes] = await Promise.all([
                    axiosInstance.get("/marketplace/myItems"),
                    axiosInstance.get("/categories/active/marketplace"),
                ]);

                const item = itemRes.data.data.find((itm) => itm.id === id);
                if (!item) {
                    toast.error("Item not found");
                    return navigate(-1);
                }

                setFormData({
                    ...item,
                    contactDetails: {
                        phone: item.contactDetails?.phone || '',
                        email: item.contactDetails?.email || '',
                        whatsapp: item.contactDetails?.whatsapp || '',
                    },
                    location: item.location || { city: "", state: "", country: "", postalCode: "" },
                    images: null,
                    isNegotiable: item.isNegotiable || false,
                    expiresAt: item.expiresAt || '',
                    tags: item.tags || [],
                });

                setPreviewImages(Array.isArray(item.images) ? item.images : [item.images]);

                setCategories(categoryRes.data.data);
                setCatError("");
            } catch (error) {
                setCatError("Failed to load categories");
                toast.error(error?.response?.data?.message || "Update failed");
            } finally {
                setCatLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes("contactDetails.")) {
            const key = name.split(".")[1];
            setFormData((prev) => ({
                ...prev,
                contactDetails: {
                    ...prev.contactDetails,
                    [key]: value,
                },
            }));
        } else if (name.includes("location.")) {
            const key = name.split(".")[1];
            setFormData((prev) => ({
                ...prev,
                location: {
                    ...prev.location,
                    [key]: value,
                },
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        // Append new files
        setFormData((prev) => ({
            ...prev,
            images: [...(prev.images || []), ...files]
        }));

        // Generate and append new previews
        const newPreviews = files.map((file) => URL.createObjectURL(file));
        setPreviewImages((prev) => [...prev, ...newPreviews]);
    };

    const removeImage = (indexToRemove) => {
        setPreviewImages((prev) => prev.filter((_, i) => i !== indexToRemove));
        setFormData((prev) => ({
            ...prev,
            images: (prev.images || []).filter((_, i) => i !== indexToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const {
                id, createdAt, updatedAt, author,
                ...dataToSend
            } = formData;

            delete dataToSend.isAccept;

            // Convert images to base64
            if (formData.images && formData.images.length > 0) {
                const base64Images = await Promise.all(
                    formData.images.map((file) =>
                        new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () => resolve(reader.result);
                            reader.onerror = reject;
                            reader.readAsDataURL(file);
                        })
                    )
                );
                dataToSend.images = base64Images;
            }

            const res = await axiosInstance.patch(`/marketplace/update/${id}`, dataToSend);
            if (res.data.success) {
                toast.success(res.data.message || "Item updated successfully");
                navigate(-1);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Update failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="marketplace-form container p-4 shadow rounded mt-4">
            <h2 className="text-center mb-4 fw-bold text-primary">Edit Marketplace Item</h2>

            <form onSubmit={handleSubmit}>
                <div className="row g-4">

                    {/* ────── Section: General Information ────── */}
                    <div className="section-title mb-0 text-black">General Information</div>

                    <div className="col-md-6">
                        <label className="form-label">Title</label>
                        <input type="text" name="title" className="form-control" value={formData.title} onChange={handleChange} required />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Category</label>
                        {catLoading ? (
                            <div className="form-control bg-light text-muted">Loading categories...</div>
                        ) : catError ? (
                            <div className="text-danger">{catError}</div>
                        ) : (
                            <select name="category" className="form-select" value={formData.category} onChange={handleChange} required>
                                <option value="">Select a category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="col-12">
                        <label className="form-label">Description</label>
                        <textarea name="description" rows="4" className="form-control" value={formData.description} onChange={handleChange}></textarea>
                    </div>

                    {/* ────── Section: Pricing & Status ────── */}
                    <div className="section-title mt-4 mb-0 text-black">Pricing & Status</div>

                    <div className="col-md-4">
                        <label className="form-label">Price</label>
                        <input type="number" name="price" className="form-control" value={formData.price} onChange={handleChange} required />
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Currency</label>
                        <input type="text" name="currency" className="form-control" value={formData.currency} onChange={handleChange} />
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Condition</label>
                        <select name="conditionType" className="form-select" value={formData.conditionType} onChange={handleChange}>
                            <option value="">Select condition</option>
                            <option value="new">New</option>
                            <option value="like_new">Like New</option>
                            <option value="good">Good</option>
                            <option value="fair">Fair</option>
                            <option value="poor">Poor</option>
                        </select>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Status</label>
                        <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
                            <option value="active">Active</option>
                            <option value="sold">Sold</option>
                            <option value="expired">Expired</option>
                            <option value="removed">Removed</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Expiration Date</label>
                        <input
                            type="date"
                            name="expiresAt"
                            className="form-control"
                            value={formData.expiresAt}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-md-6 d-flex align-items-center gap-2 mt-3">
                        <input
                            type="checkbox"
                            id="isNegotiable"
                            name="isNegotiable"
                            checked={formData.isNegotiable}
                            onChange={() =>
                                setFormData((prev) => ({
                                    ...prev,
                                    isNegotiable: !prev.isNegotiable,
                                }))
                            }
                        />
                        <label htmlFor="isNegotiable" className="mb-0">Price Negotiable</label>
                    </div>

                    {/* ────── Section: Contact Info ────── */}
                    <div className="section-title mt-4 mb-0 text-black">Contact Information</div>

                    <div className="col-md-4">
                        <label className="form-label">Phone</label>
                        <PhoneInput
                            enableSearch={true}
                            searchPlaceholder="Search country"
                            inputProps={{
                                name: 'contactDetails.phone',
                                className: `form-control ${errors.phone ? 'is-invalid' : ''}`,
                            }}
                            value={formData.contactDetails.phone}
                            onChange={(phone) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    contactDetails: {
                                        ...prev.contactDetails,
                                        phone: `+${phone}`,
                                    },
                                }))
                            }
                            onBlur={() => {
                                setErrors((prev) => ({
                                    ...prev,
                                    phone:
                                        formData.contactDetails.phone &&
                                            !validatePhoneNumber(formData.contactDetails.phone)
                                            ? 'Invalid phone number. Please enter a valid number for the selected country.'
                                            : '',
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
                                className: `form-control ${errors.whatsapp ? 'is-invalid' : ''}`,
                            }}
                            value={formData.contactDetails.whatsapp}
                            onChange={(whatsapp) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    contactDetails: {
                                        ...prev.contactDetails,
                                        whatsapp: `+${whatsapp}`,
                                    },
                                }))
                            }
                            onBlur={() => {
                                setErrors((prev) => ({
                                    ...prev,
                                    whatsapp:
                                        formData.contactDetails.whatsapp &&
                                            !validatePhoneNumber(formData.contactDetails.whatsapp)
                                            ? 'Invalid WhatsApp number. Use international format.'
                                            : '',
                                }));
                            }}
                        />
                        {errors.whatsapp && <div className="invalid-feedback d-block">{errors.whatsapp}</div>}
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            name="contactDetails.email"
                            className="form-control"
                            value={formData.contactDetails.email}
                            onChange={handleChange}
                        />
                    </div>

                    {/* ────── Section: Location ────── */}
                    <div className="section-title mt-4 mb-0 text-black">Location</div>

                    {["city", "state", "country", "postalCode"].map((field) => (
                        <div className="col-md-6" key={field}>
                            <label className="form-label text-capitalize">{field.replace(/([A-Z])/g, " $1")}</label>
                            <input type="text" name={`location.${field}`} className="form-control" value={formData.location[field]} onChange={handleChange} />
                        </div>
                    ))}

                    {/* ────── Section: Tags ────── */}
                    <div className="section-title mt-4 mb-0 text-black">Tags</div>

                    <div className="col-12">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter a tag and press Enter"
                            onKeyDown={(e) => {
                                const key = e.key;
                                const value = e.target.value.trim().replace(/,$/, '');
                                if ((key === 'Enter' || key === ',') && value) {
                                    e.preventDefault();
                                    if (!formData.tags.includes(value) && formData.tags.length < 20) {
                                        setFormData((prev) => ({
                                            ...prev,
                                            tags: [...prev.tags, value],
                                        }));
                                    }
                                    e.target.value = '';
                                }
                            }}
                        />
                    </div>

                    {formData.tags.length > 0 && (
                        <div className="col-12 mt-2 d-flex flex-wrap gap-2">
                            {formData.tags.map((tag, idx) => (
                                <span
                                    key={idx}
                                    className="badge bg-secondary d-flex align-items-center"
                                    style={{ paddingRight: '0.5rem', fontSize: '16px' }}
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        className="btn-close btn-close-white ms-2"
                                        style={{ fontSize: '0.6rem' }}
                                        aria-label="Remove"
                                        onClick={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                tags: prev.tags.filter((_, i) => i !== idx),
                                            }))
                                        }
                                    ></button>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* ────── Section: Image Upload ────── */}
                    <div className="section-title mt-4 mb-0 text-black">Upload Images</div>

                    <div className="col-12">
                        <input type="file" className="form-control" onChange={handleImageChange} multiple />
                    </div>

                    {previewImages.length > 0 && (
                        <div className="col-12 mt-3 d-flex flex-wrap gap-3">
                            {previewImages.map((src, idx) => (
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

                    {/* ────── Submit & Cancel Buttons ────── */}
                    <div className="col-12 text-center mt-4 d-flex justify-content-center gap-3">
                        <button className="btn btn-success px-4 py-2 fw-semibold" type="submit" disabled={loading}>
                            {loading ? "Updating..." : "Update Item"}
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
        </div>
    );
};

export default EditMarketPlaceItem;
