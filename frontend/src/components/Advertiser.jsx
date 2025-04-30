import React from 'react';

const Advertiser = () => {
    return (
        <div className="container-fluid bg-dark text-white min-vh-100 p-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h5 className="mb-1">Meta Business Suite</h5>
                    <small className="text-secondary">Ad Account: Business Name</small>
                </div>
                <button className="btn btn-success">Create Ad</button>
            </div>

            {/* Navigation Tabs */}
            <ul className="nav nav-pills bg-secondary bg-opacity-10 p-2 rounded mb-4">
                {['Overview', 'Campaigns', 'Audiences', 'Analytics'].map((tab, idx) => (
                    <li className="nav-item" key={idx}>
                        <a
                            className={`nav-link  ${idx === 0 ? 'active' : 'text-white'}`}
                            href="#"
                        >
                            {tab}
                        </a>
                    </li>
                ))}
            </ul>

            {/* Key Metrics */}
            <div className="row text-center mb-4 justify-content-around">
                <div className="col-md-6 p-3 rounded border border-success-subtle bg-secondary bg-opacity-10">
                    <h6>Ad Spend</h6>
                    <h4>$1,245.32</h4>
                    <span className="text-success">+12% from last month</span>
                </div>
                <div className="col-md-5 p-3 rounded border border-success-subtle bg-secondary bg-opacity-10">
                    <h6>Reach</h6>
                    <h4>245,872</h4>
                    <span className="text-success">+18% from last month</span>
                </div>
            </div>

            {/* Campaign Performance */}
            <div className="bg-secondary bg-opacity-10 border border-info-subtle rounded p-4 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">Campaign Performance</h6>
                    <select className="form-select form-select-sm w-auto bg-dark text-white border-secondary">
                        <option>Last 7 days</option>
                        <option>Last 30 days</option>
                    </select>
                </div>
                <div className="text-secondary text-center py-5 border rounded border-secondary">
                    [Performance Chart Visualization]
                </div>
                <div className="row text-center mt-4 fw-semibold">
                    <div className="col">458.2K<br /><small className="fw-normal">Impressions</small></div>
                    <div className="col">24.5K<br /><small className="fw-normal">Clicks</small></div>
                    <div className="col">5.34%<br /><small className="fw-normal">CTR</small></div>
                    <div className="col">$0.51<br /><small className="fw-normal">Cost per Click</small></div>
                </div>
            </div>

            {/* Campaigns and Audience Insights */}
            <div className="row">
                {/* Active Campaigns */}
                <div className="col-md-6 mb-3">
                    <div className="bg-secondary bg-opacity-10 p-3 rounded border border-primary-subtle">
                        <h6>Active Campaigns</h6>
                        <div className="border-top pt-2 mt-2">
                            <strong>Summer Sale Promotion</strong><br />
                            <small>Budget: $500.00 | Spent: $234.56 | Results: 12,456 clicks</small>
                        </div>
                        <div className="border-top pt-2 mt-2">
                            <strong>New Product Launch</strong><br />
                            <small>Budget: $1,000.00 | Spent: $345.89 | Results: 24,682 clicks</small>
                        </div>
                        <div className="border-top pt-2 mt-2">
                            <strong>Brand Awareness</strong><br />
                            <small>Budget: $750.00 | Spent: $248.87 | Results: 45,872 reach</small>
                        </div>

                        {/* Create Campaign Button */}
                        <div className="text-start mt-3">
                            <button className="btn btn-success">Create New Campaign</button>
                        </div>
                    </div>
                </div>

                {/* Audience Insights */}
                <div className="col-md-6 mb-3">
                    <div className="bg-secondary bg-opacity-10 p-3 rounded border border-warning-subtle">
                        <h6>Audience Insights</h6>
                        <div className="text-secondary text-center py-3 border rounded border-secondary">
                            [Age Distribution Chart]
                        </div>
                        <div className="row mt-3">
                            <h6>Gender</h6>
                        </div>
                        <div className="d-flex justify-content-around mt-1">
                            <div>58%<br /><small>Female</small></div>
                            <div>41%<br /><small>Male</small></div>
                            <div>1%<br /><small>Other</small></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Advertiser;
