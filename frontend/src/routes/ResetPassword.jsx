import { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { Mail, Clock, CheckCircle, Key, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/ResetPassword.css';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState('email'); // email, otp, success
    const [countdown, setCountdown] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    // Format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };
    
    // Handle countdown timer
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }
        
        return () => clearInterval(timer);
    }, [countdown]);
    
    // Navigate to login after success
    useEffect(() => {
        let redirectTimer;
        if (step === 'success') {
            redirectTimer = setTimeout(() => {
                navigate(-1);
            }, 5000);
        }
        
        return () => clearTimeout(redirectTimer);
    }, [step, navigate]);
    
    // Handle OTP input change
    const handleOtpChange = (index, value) => {
        // Only allow numbers
        if (value && !/^\d+$/.test(value)) return;
        
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        
        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };
    
    // Handle key down in OTP inputs
    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                const prevInput = document.getElementById(`otp-${index - 1}`);
                if (prevInput) prevInput.focus();
            }
        }
    };
    
    // Validate password
    const validatePassword = () => {
        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return false;
        }
        
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return false;
        }
        
        return true;
    };
    
    // Handle request OTP
    const handleRequestOtp = async () => {
        if (!email || !email.includes('@') || !email.includes('.')) {
            toast.error('Please enter a valid email address');
            return;
        }
        
        setLoading(true);
        try {
            const response = await axiosInstance.post('/auth/sendResetOtp', { email });
            
            if (response.data && response.data.success) {
                toast.success(response.data.message || 'Reset OTP sent successfully');
                setStep('otp');
                setCountdown(150); // 2 minutes and 30 seconds
            } else {
                toast.error(response.data?.message || 'Failed to send reset OTP');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };
    
    // Handle password reset
    const handleResetPassword = async () => {
        const otpValue = otp.join('');
        
        if (otpValue.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }
        
        if (!validatePassword()) {
            return;
        }
        
        setLoading(true);
        try {
            const response = await axiosInstance.post('/auth/resetPassword', { 
                email,
                otp: otpValue,
                newPassword
            });
            
            if (response.data && response.data.success) {
                toast.success(response.data.message || 'Password reset successfully');
                setStep('success');
            } else {
                toast.error(response.data?.message || 'Invalid OTP or password');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };
    
    // Handle resend OTP
    const handleResendOtp = () => {
        if (countdown === 0) {
            handleRequestOtp();
        }
    };

  return (
    <div className="reset-password-container">
            <div className="reset-password-card">
                <div className="reset-password-header">
                    <Key className="reset-icon" />
                    <h1>Reset Your Password</h1>
                    <p className="subtitle">
                        {step === 'email' && "Enter your email to reset your password"}
                        {step === 'otp' && "Enter the verification code and your new password"}
                        {step === 'success' && "Password reset successful!"}
                    </p>
                </div>
                
                <div className="reset-password-body">
                    {step === 'email' && (
                        <>
                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <div className="input-with-icon">
                                    <Mail className="input-icon" />
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                            </div>
                            <button 
                                className="primary-button"
                                onClick={handleRequestOtp}
                                disabled={loading}
                            >
                                {loading ? 'Sending...' : 'Get Reset Code'}
                            </button>
                        </>
                    )}
                    
                    {step === 'otp' && (
                        <>
                            <div className="email-info">
                                <p>We've sent a code to: <strong>{email}</strong></p>
                            </div>
                            
                            <div className="countdown">
                                <Clock size={16} />
                                <span>{formatTime(countdown)}</span>
                            </div>
                            
                            <div className="otp-section">
                                <label>Verification Code</label>
                                <div className="otp-container">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`otp-${index}`}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            className="otp-input"
                                            autoFocus={index === 0}
                                        />
                                    ))}
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="newPassword">New Password</label>
                                <div className="input-with-icon">
                                    <Lock className="input-icon" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="newPassword"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        required
                                    />
                                    <button 
                                        type="button" 
                                        className="toggle-password"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <div className="input-with-icon">
                                    <Lock className="input-icon" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="action-buttons">
                                <button 
                                    className="primary-button"
                                    onClick={handleResetPassword}
                                    disabled={loading || otp.join('').length !== 6 || !newPassword || !confirmPassword}
                                >
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </button>
                                
                                <button 
                                    className={`resend-button ${countdown > 0 ? 'disabled' : ''}`}
                                    onClick={handleResendOtp}
                                    disabled={countdown > 0 || loading}
                                >
                                    {countdown > 0 ? `Resend Code in ${formatTime(countdown)}` : 'Resend Code'}
                                </button>
                            </div>
                        </>
                    )}
                    
                    {step === 'success' && (
                        <div className="success-message">
                            <CheckCircle size={48} className="success-icon" />
                            <p>Your password has been reset successfully!</p>
                            <p className="redirect-text">Redirecting to login page in 5 seconds...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

  )
}

export default ResetPassword