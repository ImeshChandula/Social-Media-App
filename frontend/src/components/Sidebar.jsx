import React from 'react'
import { Link } from 'react-router-dom'


const Sidebar = () => {
  return (
    <div className="sidebar p-3">
      <Link to="/" className="nav-link">Home</Link>
      <Link to="/members" className="nav-link">Members</Link>
      <Link to="/videos" className="nav-link">Videos</Link>
      <Link to="/notifications" className="nav-link">Notifications</Link>
      <Link to="/profile" className="nav-link">Profile</Link>
    </div>
  )
}

export default Sidebar
