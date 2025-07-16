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
    const [existingImages, setExistingImages] = useState([]);

    const [errors, setErrors] = useState({
        phone: "",
        whatsapp: "",
    });

    const validatePhoneNumber = (phone) => {
        if (!phone) return false;
        const phoneNumber = parsePhoneNumberFromString(phone);
        return phoneNumber ? phoneNumber.isValid() : false;
    };

    const convertFirebaseTimestampToDateString = (timestamp) => {
        if (!timestamp) return '';
        if (timestamp._seconds) {
            const date = new Date(timestamp._seconds * 1000);
            return date.toISOString().split('T')[0];
        }
        if (typeof timestamp === 'string') {
            const date = new Date(timestamp);
            return date.toISOString().split('T')[0];
        }
        return '';
    };

    const formatPhoneForInput = (phone) => {
        if (!phone) return '';
        if (phone.startsWith('+')) {
            return phone.substring(1);
        }
        if (phone.startsWith('0')) {
            return `94${phone.substring(1)}`;
        }
        return phone;
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

                const formattedExpiresAt = convertFirebaseTimestampToDateString(item.expiresAt);

                setFormData({
                    ...item,
                    contactDetails: {
                        phone: formatPhoneForInput(item.contactDetails?.phone || ''),
                        email: item.contactDetails?.email || '',
                        whatsapp: formatPhoneForInput(item.contactDetails?.whatsapp || ''),
                    },
                    location: item.location || { city: "", state: "", country: "", postalCode: "" },
                    images: null,
                    isNegotiable: item.isNegotiable || false,
                    expiresAt: formattedExpiresAt,
                    tags: item.tags || [],
                });

                const existingImageUrls = Array.isArray(item.images) ? item.images : (item.images ? [item.images] : []);
                setExistingImages(existingImageUrls);
                setPreviewImages(existingImageUrls);

                setCategories(categoryRes.data.data);
                setCatError("");
            } catch (error) {
                setCatError("Failed to load categories");
                toast.error(error?.response?.data?.message || "Failed to load item data");
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

        setFormData((prev) => ({
            ...prev,
            images: files
        }));

        const newPreviews = files.map((file) => URL.createObjectURL(file));
        setPreviewImages([...existingImages, ...newPreviews]);
    };

    const removeImage = (indexToRemove) => {
        const isExistingImage = indexToRemove < existingImages.length;
        
        if (isExistingImage) {
            const newExistingImages = existingImages.filter((_, i) => i !== indexToRemove);
            setExistingImages(newExistingImages);
            const newImageFiles = formData.images || [];
            setPreviewImages([...newExistingImages, ...newImageFiles.map(file => URL.createObjectURL(file))]);
        } else {
            const newFileIndex = indexToRemove - existingImages.length;
            const newImageFiles = (formData.images || []).filter((_, i) => i !== newFileIndex);
            setFormData((prev) => ({
                ...prev,
                images: newImageFiles.length > 0 ? newImageFiles : null
            }));
            const newFilePreviews = newImageFiles.map(file => URL.createObjectURL(file));
            setPreviewImages([...existingImages, ...newFilePreviews]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (formData.contactDetails.phone && !validatePhoneNumber(`+${formData.contactDetails.phone}`)) {
                setErrors(prev => ({ ...prev, phone: 'Invalid phone number' }));
                setLoading(false);
                return;
            }

            if (formData.contactDetails.whatsapp && !validatePhoneNumber(`+${formData.contactDetails.whatsapp}`)) {
                setErrors(prev => ({ ...prev, whatsapp: 'Invalid WhatsApp number' }));
                setLoading(false);
                return;
            }

            const {
                id: itemId, createdAt, updatedAt, author,
                ...dataToSend
            } = formData;

            delete dataToSend.isAccept;

            if (dataToSend.contactDetails.phone) {
                dataToSend.contactDetails.phone = dataToSend.contactDetails.phone.startsWith('+') 
                    ? dataToSend.contactDetails.phone 
                    : `+${dataToSend.contactDetails.phone}`;
            }

            if (dataToSend.contactDetails.whatsapp) {
                dataToSend.contactDetails.whatsapp = dataToSend.contactDetails.whatsapp.startsWith('+') 
                    ? dataToSend.contactDetails.whatsapp 
                    : `+${dataToSend.contactDetails.whatsapp}`;
            }

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
                dataToSend.images = [...existingImages, ...base64Images];
            } else {
                dataToSend.images = existingImages;
            }

            const res = await axiosInstance.patch(`/marketplace/update/${itemId}`, dataToSend);
            if (res.data.success) {
                toast.success(res.data.message || "Item updated successfully");
                navigate(-1);
            }
        } catch (error) {
            console.error('Update error:', error);
            toast.error(error?.response?.data?.message || "Update failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
            <h2 style={{
                textAlign: 'center',
                marginBottom: '20px',
                fontWeight: '700',
                color: '#007bff'
            }}>Edit Marketplace Item</h2>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>

                    {/* General Information */}
                    <div style={{
                        width: '100%',
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#333',
                        marginBottom: '10px'
                    }}>General Information</div>

                    <div style={{ width: '100%', maxWidth: '48%' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontSize: '14px',
                            color: '#333'
                        }}>Title</label>
                        <input
                            type="text"
                            name="title"
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ced4da',
                                borderRadius: '4px',
                                fontSize: '14px',
                                backgroundColor: '#fff'
                            }}
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={{ width: '100%', maxWidth: '48%' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontSize: '14px',
                            color: '#333'
                        }}>Category</label>
                        {catLoading ? (
                            <div style={{
                                padding: '8px',
                                border: '1px solid #ced4da',
                                borderRadius: '4px',
                                backgroundColor: '#e9ecef',
                                color: '#6c757d'
                            }}>Loading categories...</div>
                        ) : catError ? (
                            <div style={{ color: '#dc3545' }}>{catError}</div>
                        ) : (
                            <select
                                name="category"
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    backgroundColor: '#fff'
                                }}
                                value={formData.category}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select a category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div style={{ width: '100%' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontSize: '14px',
                            color: '#333'
                        }}>Description</label>
                        <textarea
                            name="description"
                            rows="4"
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ced4da',
                                borderRadius: '4px',
                                fontSize: '14px',
                                backgroundColor: '#fff'
                            }}
                            value={formData.description}
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    {/* Pricing & Status */}
                    <div style={{
                        width: '100%',
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#333',
                        marginTop: '20px',
                        marginBottom: '10px'
                    }}>Pricing & Status</div>

                    <div style={{ width: '100%', maxWidth: '32%' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontSize: '14px',
                            color: '#333'
                        }}>Price</label>
                        <input
                            type="number"
                            name="price"
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ced4da',
                                borderRadius: '4px',
                                fontSize: '14px',
                                backgroundColor: '#fff'
                            }}
                            value={formData.price}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={{ width: '100%', maxWidth: '32%' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontSize: '14px',
                            color: '#333'
                        }}>Currency</label>
                        <input
                            type="text"
                            name="currency"
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ced4da',
                                borderRadius: '4px',
                                fontSize: '14px',
                                backgroundColor: '#fff'
                            }}
                            value={formData.currency}
                            onChange={handleChange}
                        />
                    </div>

                    <div style={{ width: '100%', maxWidth: '32%' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontSize: '14px',
                            color: '#333'
                        }}>Condition</label>
                        <select
                            name="conditionType"
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ced4da',
                                borderRadius: '4px',
                                fontSize: '14px',
                                backgroundColor: '#fff'
                            }}
                            value={formData.conditionType}
                            onChange={handleChange}
                        >
                            <option value="">Select condition</option>
                            <option value="new">New</option>
                            <option value="like_new">Like New</option>
                            <option value="good">Good</option>
                            <option value="fair">Fair</option>
                            <option value="poor">Poor</option>
                        </select>
                    </div>

                    <div style={{ width: '100%', maxWidth: '48%' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontSize: '14px',
                            color: '#333'
                        }}>Status</label>
                        <select
                            name="status"
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ced4da',
                                borderRadius: '4px',
                                fontSize: '14px',
                                backgroundColor: '#fff'
                            }}
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value="active">Active</option>
                            <option value="sold">Sold</option>
                            <option value="expired">Expired</option>
                            <option value="removed">Removed</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>

                    <div style={{ width: '100%', maxWidth: '48%' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontSize: '14px',
                            color: '#333'
                        }}>Expiration Date</label>
                        <input
                            type="date"
                            name="expiresAt"
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ced4da',
                                borderRadius: '4px',
                                fontSize: '14px',
                                backgroundColor: '#fff'
                            }}
                            value={formData.expiresAt}
                            onChange={handleChange}
                        />
                    </div>

                    <div style={{
                        width: '100%',
                        maxWidth: '48%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginTop: '20px'
                    }}>
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
                            style={{ margin: '0' }}
                        />
                        <label htmlFor="isNegotiable" style={{
                            margin: '0',
                            fontSize: '14px',
                            color: '#333'
                        }}>Price Negotiable</label>
                    </div>

                    {/* Contact Information */}
                    <div style={{
                        width: '100%',
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#333',
                        marginTop: '20px',
                        marginBottom: '10px'
                    }}>Contact Information</div>

                    <div style={{ width: '100%', maxWidth: '32%' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontSize: '14px',
                            color: '#333'
                        }}>Phone</label>
                        <PhoneInput
                            enableSearch={true}
                            searchPlaceholder="Search country"
                            inputProps={{
                                name: 'contactDetails.phone',
                                style: {
                                    width: '100%',
                                    padding: '8px',
                                    border: errors.phone ? '1px solid #dc3545' : '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    backgroundColor: '#fff'
                                }
                            }}
                            value={formData.contactDetails.phone}
                            onChange={(phone) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    contactDetails: {
                                        ...prev.contactDetails,
                                        phone: phone,
                                    },
                                }))
                            }
                            onBlur={() => {
                                setErrors((prev) => ({
                                    ...prev,
                                    phone:
                                        formData.contactDetails.phone &&
                                        !validatePhoneNumber(`+${formData.contactDetails.phone}`)
                                        ? 'Invalid phone number. Please enter a valid number for the selected country.'
                                        : '',
                                }));
                            }}
                        />
                        {errors.phone && <div style={{
                            color: '#dc3545',
                            fontSize: '12px',
                            marginTop: '5px'
                        }}>{errors.phone}</div>}
                    </div>

                    <div style={{ width: '100%', maxWidth: '32%' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontSize: '14px',
                            color: '#333'
                        }}>WhatsApp</label>
                        <PhoneInput
                            enableSearch={true}
                            searchPlaceholder="Search country"
                            inputProps={{
                                name: 'contactDetails.whatsapp',
                                style: {
                                    width: '100%',
                                    padding: '8px',
                                    border: errors.whatsapp ? '1px solid #dc3545' : '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    backgroundColor: '#fff'
                                }
                            }}
                            value={formData.contactDetails.whatsapp}
                            onChange={(whatsapp) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    contactDetails: {
                                        ...prev.contactDetails,
                                        whatsapp: whatsapp,
                                    },
                                }))
                            }
                            onBlur={() => {
                                setErrors((prev) => ({
                                    ...prev,
                                    whatsapp:
                                        formData.contactDetails.whatsapp &&
                                        !validatePhoneNumber(`+${formData.contactDetails.whatsapp}`)
                                        ? 'Invalid WhatsApp number. Use international format.'
                                        : '',
                                }));
                            }}
                        />
                        {errors.whatsapp && <div style={{
                            color: '#dc3545',
                            fontSize: '12px',
                            marginTop: '5px'
                        }}>{errors.whatsapp}</div>}
                    </div>

                    <div style={{ width: '100%', maxWidth: '32%' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontSize: '14px',
                            color: '#333'
                        }}>Email</label>
                        <input
                            type="email"
                            name="contactDetails.email"
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ced4da',
                                borderRadius: '4px',
                                fontSize: '14px',
                                backgroundColor: '#fff'
                            }}
                            value={formData.contactDetails.email}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Location */}
                    <div style={{
                        width: '100%',
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#333',
                        marginTop: '20px',
                        marginBottom: '10px'
                    }}>Location</div>

                    {["city", "state", "country", "postalCode"].map((field) => (
                        <div key={field} style={{ width: '100%', maxWidth: '48%' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '5px',
                                fontSize: '14px',
                                color: '#333',
                                textTransform: 'capitalize'
                            }}>{field.replace(/([A-Z])/g, " $1")}</label>
                            <input
                                type="text"
                                name={`location.${field}`}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    backgroundColor: '#fff'
                                }}
                                value={formData.location[field]}
                                onChange={handleChange}
                            />
                        </div>
                    ))}

                    {/* Tags */}
                    <div style={{
                        width: '100%',
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#333',
                        marginTop: '20px',
                        marginBottom: '10px'
                    }}>Tags</div>

                    <div style={{ width: '100%' }}>
                        <input
                            type="text"
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ced4da',
                                borderRadius: '4px',
                                fontSize: '14px',
                                backgroundColor: '#fff'
                            }}
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
                        <div style={{
                            width: '100%',
                            marginTop: '10px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '10px'
                        }}>
                            {formData.tags.map((tag, idx) => (
                                <span
                                    key={idx}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        backgroundColor: '#e9ecef',
                                        color: '#333',
                                        padding: '5px 10px',
                                        borderRadius: '12px',
                                        fontSize: '16px'
                                    }}
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        style={{
                                            marginLeft: '8px',
                                            background: 'none',
                                            border: 'none',
                                            color: '#333',
                                            fontSize: '12px',
                                            cursor: 'pointer'
                                        }}
                                        aria-label="Remove"
                                        onClick={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                tags: prev.tags.filter((_, i) => i !== idx),
                                            }))
                                        }
                                    >
                                        ✕
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Image Upload */}
                    <div style={{
                        width: '100%',
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#333',
                        marginTop: '20px',
                        marginBottom: '10px'
                    }}>Upload Images</div>

                    <div style={{ width: '100%' }}>
                        <input
                            type="file"
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ced4da',
                                borderRadius: '4px',
                                fontSize: '14px',
                                backgroundColor: '#fff'
                            }}
                            onChange={handleImageChange}
                            multiple
                            accept="image/*"
                        />
                        <small style={{
                            display: 'block',
                            marginTop: '5px',
                            fontSize: '12px',
                            color: '#6c757d'
                        }}>You can upload additional images. Existing images will be preserved unless you remove them.</small>
                    </div>

                    {previewImages.length > 0 && (
                        <div style={{
                            width: '100%',
                            marginTop: '15px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '15px'
                        }}>
                            {previewImages.map((src, idx) => (
                                <div key={idx} style={{ position: 'relative', width: '120px', height: '120px' }}>
                                    <img
                                        src={src}
                                        alt={`Preview ${idx}`}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'contain',
                                            border: '1px solid #ced4da',
                                            borderRadius: '4px'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        style={{
                                            position: 'absolute',
                                            top: '4px',
                                            right: '4px',
                                            width: '28px',
                                            height: '28px',
                                            backgroundColor: '#dc3545',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => removeImage(idx)}
                                        title="Remove Image"
                                    >
                                        <i style={{ fontSize: '16px' }}>🗑</i>
                                    </button>
                                    {idx < existingImages.length && (
                                        <small style={{
                                            position: 'absolute',
                                            bottom: '0',
                                            left: '0',
                                            backgroundColor: '#17a2b8',
                                            color: '#fff',
                                            padding: '2px 5px',
                                            borderRadius: '0 4px 0 0',
                                            fontSize: '10px'
                                        }}>
                                            Existing
                                        </small>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Submit & Cancel Buttons */}
                    <div style={{
                        width: '100%',
                        marginTop: '20px',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '15px'
                    }}>
                        <button
                            style={{
                                padding: '10px 20px',
                                backgroundColor: loading ? '#6c757d' : '#28a745',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Updating..." : "Update Item"}
                        </button>

                        <button
                            type="button"
                            style={{
                                padding: '10px 20px',
                                backgroundColor: loading ? '#6c757d' : '#ffc107',
                                color: '#333',
                                border: 'none',
                                borderRadius: '4px',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
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