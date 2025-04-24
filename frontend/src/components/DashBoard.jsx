import React from 'react';


const DashBoard = () => {
    return (
        <div className="d-flex flex-column p-4" style={{ width: '250px', backgroundColor: '#1c1e21' }}>
            <nav className="nav flex-column">
                <a className="nav-link text-white" href="#">Home</a>
                <a className="nav-link text-white" href="#">Members</a>
                <a className="nav-link text-white" href="#">Videos</a>
                <a className="nav-link text-white" href="#">Notifications</a>
                <a className="nav-link text-white active profile-tab" href="#">Profile</a>
            </nav>
        </div>
    )
}

export default DashBoard