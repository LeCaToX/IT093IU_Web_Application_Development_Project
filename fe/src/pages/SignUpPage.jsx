import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useUserStore } from "../stores/useUserStore";
import { validateField, validateForm, hasErrors } from "../utils/validation";

import { UserIcon, EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import OptimizedImage from '../components/OptimizedImage';

const SignUpPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { signup, loading } = useUserStore();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [errors, setErrors] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [touched, setTouched] = useState({
        username: false,
        email: false,
        password: false,
        confirmPassword: false
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

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const emailFromUrl = searchParams.get('email');
        if (emailFromUrl) {
            setFormData(prev => ({ ...prev, email: emailFromUrl }));
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formErrors = validateForm(formData);
        setErrors(formErrors);
        
        if (!hasErrors(formErrors)) {
            const result = await signup(formData);
            if (result !== false) {
                navigate('/login');
            }
        }
    };

    const inputFields = [
        {
            id: "username",
            label: "Username",
            type: "text",
            icon: UserIcon,
            placeholder: "Choose a username"
        },
        {
            id: "email",
            label: "Email",
            type: "email",
            icon: EnvelopeIcon,
            placeholder: "name@example.com"
        },
        {
            id: "password",
            label: "Password",
            type: "password",
            icon: LockClosedIcon,
            placeholder: "Create a password",
            isPassword: true,
            showPassword: showPassword,
            toggleShow: () => setShowPassword(!showPassword)
        },
        {
            id: "confirmPassword",
            label: "Confirm Password",
            type: "password",
            icon: LockClosedIcon,
            placeholder: "Confirm your password",
            isPassword: true,
            showPassword: showConfirmPassword,
            toggleShow: () => setShowConfirmPassword(!showConfirmPassword)
        }
    ];

    return (
        <div className="nf-page relative min-h-screen flex items-center justify-center py-8 px-4">
            {/* Background with gradient overlay */}
            <div className="fixed inset-0 nf-hero-bg">
                <OptimizedImage
                    src="/assets/background.jpg"
                    alt="Background"
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            </div>

            {/* Signup Card */}
            <div className="relative z-10 w-full max-w-md">
                <div className="nf-card-static p-8 sm:p-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-nf-secondary/10 mb-6">
                            <svg className="w-8 h-8 text-nf-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-nf-text mb-2">
                            Create account
                        </h1>
                        <p className="text-nf-text-secondary">
                            Start your streaming journey today
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {inputFields.map((field) => (
                            <div key={field.id}>
                                <label htmlFor={field.id} className="block text-sm font-medium text-nf-text mb-2">
                                    {field.label}
                                </label>
                                <div className="relative">
                                    <field.icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-nf-text-muted" />
                                    <input
                                        id={field.id}
                                        name={field.id}
                                        type={field.isPassword ? (field.showPassword ? "text" : "password") : field.type}
                                        value={formData[field.id]}
                                        required
                                        autoComplete={field.type === "email" ? "email" : field.isPassword ? "new-password" : undefined}
                                        onChange={handleChange}
                                        onBlur={() => handleBlur(field.id)}
                                        placeholder={field.placeholder}
                                        className={`nf-input pl-12 ${field.isPassword ? 'pr-11' : ''} ${
                                            touched[field.id] && errors[field.id]
                                                ? 'border-nf-error focus:border-nf-error focus:shadow-none'
                                                : ''
                                        }`}
                                    />
                                    {field.isPassword && (
                                        <button
                                            type="button"
                                            onClick={field.toggleShow}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-nf-text-muted hover:text-nf-text transition-colors"
                                        >
                                            {field.showPassword ? (
                                                <EyeSlashIcon className="w-5 h-5" />
                                            ) : (
                                                <EyeIcon className="w-5 h-5" />
                                            )}
                                        </button>
                                    )}
                                </div>
                                {touched[field.id] && errors[field.id] && (
                                    <p className="mt-2 text-sm text-nf-error flex items-center gap-1">
                                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {errors[field.id]}
                                    </p>
                                )}
                            </div>
                        ))}

                        {/* Terms notice */}
                        <p className="text-xs text-nf-text-muted text-center py-2">
                            By creating an account, you agree to our{' '}
                            <a href="#" className="nf-link">Terms of Service</a> and{' '}
                            <a href="#" className="nf-link">Privacy Policy</a>
                        </p>

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
                                    Creating account...
                                </span>
                            ) : (
                                'Create account'
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-nf-text-secondary text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="nf-link font-semibold">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Decorative glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-nf-secondary/20 via-transparent to-nf-accent/20 rounded-2xl blur-xl -z-10 opacity-50" />
            </div>
        </div>
    )
}

export default SignUpPage
