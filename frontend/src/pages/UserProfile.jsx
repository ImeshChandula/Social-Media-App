import React from 'react';
import DashBoard from '../components/DashBoard';

const UserProfile = () => {
    return (
        <div className="d-flex vh-100 bg-dark text-white">
            <DashBoard />

            <div className="flex-grow-1">
                <div
                    className="cover-photo"
                    style={{
                        backgroundImage: 'url("https://images.unsplash.com/photo-1506744038136-46273834b3fb")',
                        backgroundSize: 'cover',
                        height: '250px'
                    }}
                />

                <div className="text-center mt-n5">
                    <img
                        src="https://randomuser.me/api/portraits/men/32.jpg"
                        alt="profile"
                        className="rounded-circle border border-3"
                        style={{ width: '120px', height: '120px' }}
                    />
                    <h3 className="mt-3">Shen Fernando</h3>

                    <div className="d-flex justify-content-center gap-2 mt-3">
                        <button className="btn btn-success">Edit Profile</button>
                        <button className="btn btn-secondary">Add to Story</button>
                    </div>

                    <div className="d-flex justify-content-center gap-4 mt-4 fs-5">
                        <div><strong>1234</strong> <br />Friends</div>
                        <div><strong>468</strong> <br />Photos</div>
                        <div><strong>15</strong> <br />Videos</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
