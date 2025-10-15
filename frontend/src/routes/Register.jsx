import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import getCountryOptions from '../store/countryCodes';
import RegisterStyle from '../styles/RegisterStyle';
import useAuthStore from '../store/authStore';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '',
    phone: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(false);
  const [hoveredEye, setHoveredEye] = useState(false);
  const [focusedInputs, setFocusedInputs] = useState({});

  const countryOptions = getCountryOptions();
  const { register } = useAuthStore();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFocus = (inputName) => {
    setFocusedInputs(prev => ({ ...prev, [inputName]: true }));
  };

  const handleBlur = (inputName) => {
    setFocusedInputs(prev => ({ ...prev, [inputName]: false }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedData = {
      username: formData.username.trim(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: `${formData.countryCode.trim()}${formData.phone.trim()}`,
      password: formData.password.trim(),
      role: 'user'
    };

    if (trimmedData.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    try {
      await register(trimmedData);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || JSON.stringify(err.response?.data) || err.message;
      console.error('Registration failed:', errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <div style={RegisterStyle.container}>
      <div style={RegisterStyle.formBox}>
        <div style={RegisterStyle.header}>
          <h1 style={RegisterStyle.title}>Buzads</h1>
          <p style={RegisterStyle.subtitle}>Create a new account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={RegisterStyle.inputGroup}>
            <label style={RegisterStyle.label}>Username</label>
            <input
              type="text"
              name="username"
              placeholder="👤 Username"
              value={formData.username}
              onChange={handleChange}
              onFocus={() => handleFocus('username')}
              onBlur={() => handleBlur('username')}
              required
              style={{
                ...RegisterStyle.input,
                ...(focusedInputs.username ? RegisterStyle.inputFocus : {})
              }}
              className="placeholder-gray-400"
            />
          </div>

          <div style={RegisterStyle.inputGroupDouble}>
            <div>
              <label style={RegisterStyle.label}>First Name</label>
              <input
                type="text"
                name="firstName"
                placeholder="👤 First Name"
                value={formData.firstName}
                onChange={handleChange}
                onFocus={() => handleFocus('firstName')}
                onBlur={() => handleBlur('firstName')}
                required
                style={{
                  ...RegisterStyle.input,
                  ...(focusedInputs.firstName ? RegisterStyle.inputFocus : {})
                }}
                className="placeholder-gray-400"
              />
            </div>

            <div>
              <label style={RegisterStyle.label}>Last Name</label>
              <input
                type="text"
                name="lastName"
                placeholder="👤 Last Name"
                value={formData.lastName}
                onChange={handleChange}
                onFocus={() => handleFocus('lastName')}
                onBlur={() => handleBlur('lastName')}
                required
                style={{
                  ...RegisterStyle.input,
                  ...(focusedInputs.lastName ? RegisterStyle.inputFocus : {})
                }}
                className="placeholder-gray-400"
              />
            </div>
          </div>

          <div style={RegisterStyle.inputGroup}>
            <label style={RegisterStyle.label}>Email</label>
            <input
              type="email"
              name="email"
              placeholder="📧 Email Address"
              value={formData.email}
              onChange={handleChange}
              onFocus={() => handleFocus('email')}
              onBlur={() => handleBlur('email')}
              required
              style={{
                ...RegisterStyle.input,
                ...(focusedInputs.email ? RegisterStyle.inputFocus : {})
              }}
              className="placeholder-gray-400"
            />
          </div>

          <div style={RegisterStyle.phoneGroup}>
            <div style={RegisterStyle.phoneContainer}>
              <div style={RegisterStyle.countrySelectWrapper}>
                <label style={RegisterStyle.label}>Country</label>
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  style={RegisterStyle.countrySelect}
                  required
                  className="text-black"
                >
                  {countryOptions.map((country) => (
                    <option key={country.iso2} value={country.dialCode}>
                      {country.name} ({country.dialCode})
                    </option>
                  ))}
                </select>
              </div>

              <div style={RegisterStyle.phoneInputWrapper}>
                <label style={RegisterStyle.label}>Phone</label>
                <input
                  type="number"
                  name="phone"
                  placeholder="📞 Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  onFocus={() => handleFocus('phone')}
                  onBlur={() => handleBlur('phone')}
                  required
                  style={{
                    ...RegisterStyle.phoneInput,
                    ...(focusedInputs.phone ? RegisterStyle.inputFocus : {})
                  }}
                  className="placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          <div style={RegisterStyle.passwordGroup}>
            <label style={RegisterStyle.label}>Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="🔒 New Password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => handleFocus('password')}
              onBlur={() => handleBlur('password')}
              required
              style={{
                ...RegisterStyle.passwordInput,
                ...(focusedInputs.password ? RegisterStyle.inputFocus : {})
              }}
              className="placeholder-gray-400"
            />
            <span
              style={{
                ...RegisterStyle.eyeIcon,
                ...(hoveredEye ? RegisterStyle.eyeIconHover : {})
              }}
              onClick={togglePasswordVisibility}
              onMouseEnter={() => setHoveredEye(true)}
              onMouseLeave={() => setHoveredEye(false)}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button
            type="submit"
            style={{
              ...RegisterStyle.submitButton,
              ...(hoveredButton ? RegisterStyle.submitButtonHover : {})
            }}
            onMouseEnter={() => setHoveredButton(true)}
            onMouseLeave={() => setHoveredButton(false)}
          >
            Sign Up
          </button>
        </form>

        <div style={RegisterStyle.info}>
          <p>By clicking Sign Up, you agree to our:</p>
          <ul style={RegisterStyle.linkList}>
            <li><a href="/terms" style={RegisterStyle.link}>Terms of Service</a></li>
            <li><a href="/privacy" style={RegisterStyle.link}>Privacy Policy</a></li>
            <li><a href="/cookies" style={RegisterStyle.link}>Cookie Policy</a></li>
          </ul>
          <p>
            Already have an account?{" "}
            <a href="/login" style={RegisterStyle.loginLink}>Log in</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
