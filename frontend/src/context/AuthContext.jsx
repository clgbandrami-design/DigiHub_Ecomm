import React, { createContext, useState } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : null
  );

  const saveUser = (data) => {
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
  };

  const login = async (email, password) => {
    const { data } = await axios.post('/api/users/login', { email, password });
    saveUser(data);
    return data;
  };

  const register = async (name, email, password, confirmPassword) => {
    const { data } = await axios.post('/api/users', { name, email, password, confirmPassword });
    // Don't saveUser here because it requires OTP verification first
    return data;
  };

  const loginWithGoogle = () => {
    window.location.href = 'http://localhost:5000/api/users/auth/google';
  };

  const loginFromOAuth = (userData) => {
    saveUser(userData);
  };

  const sendOTP = async (phone) => {
    const { data } = await axios.post('/api/users/otp/send', { phone });
    return data;
  };

  const verifyOTP = async (phone, otp) => {
    const { data } = await axios.post('/api/users/otp/verify', { phone, otp });
    saveUser(data);
    return data;
  };

  const verifyEmail = async (email, otp) => {
    const { data } = await axios.post('/api/users/verify-email', { email, otp });
    saveUser(data);
    return data;
  };

  const deleteAccount = async () => {
    await axios.delete('/api/users/profile', getAuthHeader());
    logout();
  };

  const resendOTP = async (email) => {
    const { data } = await axios.post('/api/users/resend-otp', { email });
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${user?.token}` },
  });

  return (
    <AuthContext.Provider value={{ user, login, register, loginWithGoogle, loginFromOAuth, sendOTP, verifyOTP, verifyEmail, resendOTP, deleteAccount, logout, getAuthHeader }}>
      {children}
    </AuthContext.Provider>
  );
};
