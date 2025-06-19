import React from 'react';
import '../styles/TicketsHead.css'

const TicketsHead = () => {
  return (
    <header class="tk-appeals-header">
        <div class="tk-header-container">
            <div class="tk-header-content">
                <div class="tk-title-section">
                    <div class="tk-icon-wrapper">
                        <svg class="tk-header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 12l2 2 4-4"/>
                            <path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h18z"/>
                            <path d="M3 12v7c0 .552.448 1 1 1h16c.552 0 1-.448 1-1v-7"/>
                        </svg>
                    </div>
                    <div class="tk-title-text">
                        <h1 class="tk-main-title">Appeal Management</h1>
                        <p class="tk-subtitle">Review and manage user ban appeals</p>
                    </div>
                </div>
                
                <div class="tk-stats-section">
                    <div class="tk-stat-card">
                        <div class="tk-stat-number">24</div>
                        <div class="tk-stat-label">Pending</div>
                    </div>
                    <div class="tk-stat-card">
                        <div class="tk-stat-number">156</div>
                        <div class="tk-stat-label">Reviewed</div>
                    </div>
                    <div class="tk-stat-card tk-stat-urgent">
                        <div class="tk-stat-number">3</div>
                        <div class="tk-stat-label">Urgent</div>
                    </div>
                </div>
            </div>
        </div>
    </header>
  )
}

export default TicketsHead