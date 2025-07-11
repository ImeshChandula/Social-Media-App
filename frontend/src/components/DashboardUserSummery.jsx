import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import dashboardService from '../services/dashboardService';
import '../styles/DashboardUserSummery.css';

const DashboardUserSummery = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await dashboardService.userSummery();

            if (response.success)
                setSummary(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);

            const message =
                error?.response?.data?.message || // Backend-sent message
                error?.message ||                 // General JS error
                'Something went wrong while fetching categories';

            toast.error(message);
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const SummaryCard = ({ label, value, color }) => (
        <div className="summery-card" style={{ borderColor: color }}>
            <h3>{label}</h3>
            <p style={{ color }}>{value}</p>
        </div>
    );

    if (loading) {
        return (
            <div className="text-white text-center my-5 fs-5 normal-loading-spinner">
                Loading<span className="dot-flash">.</span><span className="dot-flash">.</span><span className="dot-flash">.</span>
            </div>
        )
    }

    if (error) return <div className="user-summary error">{error}</div>;

    return (
        <div className="user-summary">
            <h2>All Users ({summary.totalUsers})</h2>
            <div className="summary-grid">
                <SummaryCard label="Role: Super Admin" value={summary.roleSuperAdmins} color="#fd7e14" />
                <SummaryCard label="Role: Admin" value={summary.roleAdmins} color="#6610f2" />
                <SummaryCard label="Role: User" value={summary.roleUsers} color="#36b9cc" />
                <SummaryCard label="Active Users" value={summary.activeUsers} color="#1cc88a" />
                <SummaryCard label="Inactive Users" value={summary.inactiveUsers} color="#f6c23e" />
                <SummaryCard label="Banned Users" value={summary.bannedUsers} color="#e74a3b" />
            </div>
        </div>
    )
}

export default DashboardUserSummery