import React, { useState } from 'react'
import { Link } from "react-router-dom";

import { useUserStore } from "../stores/useUserStore";
import { validateField, validateForm, hasErrors } from "../utils/validation";

import { UserIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import OptimizedImage from '../components/OptimizedImage';

const LogInPage = () => {
    const { login, loading } = useUserStore();
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });

    const [errors, setErrors] = useState({
        username: "",
        password: "",
    });

    const [touched, setTouched] = useState({
        username: false,
        password: false,
    });

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        setErrors(prev => ({
            ...prev,
            [field]: validateField(field, formData[field], formData)
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formErrors = validateForm(formData);
        setErrors(formErrors);
        
        if (!hasErrors(formErrors)) {
            login(formData);
        }
    };

    return (
        <div className="nf-page relative min-h-screen flex items-center justify-center py-12 px-4">
            {/* Background with gradient overlay */}
            <div className="fixed inset-0 nf-hero-bg">
                <OptimizedImage
                    src="/assets/background.jpg"
                    alt="Background"
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            </div>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md">
                <div className="nf-card-static p-8 sm:p-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-nf-accent/10 mb-6">
                            <svg className="w-8 h-8 text-nf-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-nf-text mb-2">
                            Welcome back
                        </h1>
                        <p className="text-nf-text-secondary">
                            Sign in to continue watching
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-nf-text mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-nf-text-muted" />
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    value={formData.username}
                                    required
                                    onChange={handleChange}
                                    onBlur={() => handleBlur("username")}
                                    placeholder="Enter your username"
                                    className={`nf-input pl-12 ${
                                        touched.username && errors.username 
                                            ? 'border-nf-error focus:border-nf-error focus:shadow-none' 
                                            : ''
                                    }`}
                                />
                            </div>
                            {touched.username && errors.username && (
                                <p className="mt-2 text-sm text-nf-error flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.username}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-nf-text mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <LockClosedIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-nf-text-muted" />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    required
                                    autoComplete="current-password"
                                    onChange={handleChange}
                                    onBlur={() => handleBlur("password")}
                                    placeholder="Enter your password"
                                    className={`nf-input pl-12 pr-11 ${
                                        touched.password && errors.password 
                                            ? 'border-nf-error focus:border-nf-error focus:shadow-none' 
                                            : ''
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-nf-text-muted hover:text-nf-text transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="w-5 h-5" />
                                    ) : (
                                        <EyeIcon className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {touched.password && errors.password && (
                                <p className="mt-2 text-sm text-nf-error flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`nf-btn nf-btn-primary w-full py-3 text-base ${
                                loading ? 'opacity-60 cursor-not-allowed' : ''
                            }`}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-nf-text-secondary text-sm">
                            Don't have an account?{' '}
                            <Link to="/signup" className="nf-link font-semibold">
                                Create one
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Decorative glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-nf-accent/20 via-transparent to-nf-secondary/20 rounded-2xl blur-xl -z-10 opacity-50" />
            </div>
        </div>
    )
}

export default LogInPage
