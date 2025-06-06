import React, { useState } from "react";
import LoginStyle from "../styles/LoginStyle";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";

const SocialButtons = () => {
    const [hoveredSocial, setHoveredSocial] = useState({ google: false, apple: false });
  
    return (
    <div style={LoginStyle.socialButtons}>
            <button 
              type="button" 
              style={{
                ...LoginStyle.socialBtn,
                ...(hoveredSocial.google ? LoginStyle.socialBtnHover : {})
              }}
              onMouseEnter={() => setHoveredSocial(prev => ({ ...prev, google: true }))}
              onMouseLeave={() => setHoveredSocial(prev => ({ ...prev, google: false }))}
            >
              <span style={LoginStyle.socialContent}>
                <FcGoogle style={LoginStyle.socialIcon} /> Google
              </span>
            </button>
            <button 
              type="button" 
              style={{
                ...LoginStyle.socialBtn,
                ...(hoveredSocial.apple ? LoginStyle.socialBtnHover : {})
              }}
              onMouseEnter={() => setHoveredSocial(prev => ({ ...prev, apple: true }))}
              onMouseLeave={() => setHoveredSocial(prev => ({ ...prev, apple: false }))}
            >
              <span style={LoginStyle.socialContent}>
                <FaApple style={LoginStyle.socialIcon} /> Apple
              </span>
            </button>
          </div>
  )
}

export default SocialButtons