import React, { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import toast from 'react-hot-toast';
import axios from '../config/axios';

import { useVideoStore } from "../stores/useVideoStore";
import { useUserStore } from "../stores/useUserStore";

import CreateVideoForm from "../components/CreateVideoForm";
import VideoList from "../components/VideoList";
import OptimizedImage from '../components/OptimizedImage';
import { getImageSrc } from '../utils/imageUtils';
import {
    PlusCircleIcon,
    FilmIcon,
    Cog6ToothIcon,
    UsersIcon,
    ChartBarIcon,
    TrashIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';

const tabs = [
    { id: "overview", label: "Overview", icon: ChartBarIcon },
    { id: "create", label: "Create Video", icon: PlusCircleIcon },
    { id: "videos", label: "All Videos", icon: FilmIcon },
    { id: "users", label: "User Management", icon: UsersIcon },
];

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState("overview");
    const { videos, fetchAllVideos } = useVideoStore();
    const { user } = useUserStore();

    // User management state
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [stats, setStats] = useState({
        totalVideos: 0,
        totalUsers: 0,
        totalViews: 0,
    });

    useEffect(() => {
        fetchAllVideos();
        fetchUsers();
    }, [fetchAllVideos]);

    useEffect(() => {
        // Calculate stats from videos
        if (videos.length > 0) {
            setStats(prev => ({
                ...prev,
                totalVideos: videos.length,
                totalViews: videos.reduce((acc, v) => acc + (v.viewCount || 0), 0),
            }));
        }
    }, [videos]);

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const response = await axios.get('/users', { withCredentials: true });
            setUsers(response.data);
            setStats(prev => ({ ...prev, totalUsers: response.data.length }));
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (userId === user.id) {
            toast.error("You cannot delete your own account");
            return;
        }

        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            await axios.delete(`/users/${userId}`, { withCredentials: true });
            toast.success('User deleted successfully');
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleToggleAdmin = async (userId, currentRole) => {
        if (userId === user.id) {
            toast.error("You cannot change your own role");
            return;
        }

        const newRole = currentRole === 'ROLE_ADMIN' ? 'ROLE_USER' : 'ROLE_ADMIN';

        try {
            await axios.put(`/users/${userId}/role`, { roleName: newRole }, { withCredentials: true });
            toast.success(`User role updated to ${newRole === 'ROLE_ADMIN' ? 'Admin' : 'User'}`);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update user role');
        }
    };

    const renderOverview = () => (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    className="nf-card-static p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-nf-accent/10">
                            <FilmIcon className="w-8 h-8 text-nf-accent" />
                        </div>
                        <div>
                            <p className="text-nf-text-muted text-sm">Total Videos</p>
                            <p className="text-3xl font-bold text-nf-text">{stats.totalVideos}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="nf-card-static p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-nf-secondary/10">
                            <UsersIcon className="w-8 h-8 text-nf-secondary" />
                        </div>
                        <div>
                            <p className="text-nf-text-muted text-sm">Total Users</p>
                            <p className="text-3xl font-bold text-nf-text">{stats.totalUsers}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="nf-card-static p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-green-500/10">
                            <ChartBarIcon className="w-8 h-8 text-green-500" />
                        </div>
                        <div>
                            <p className="text-nf-text-muted text-sm">Total Views</p>
                            <p className="text-3xl font-bold text-nf-text">{stats.totalViews.toLocaleString()}</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Recent Activity */}
            <div className="nf-card-static p-6">
                <h3 className="text-lg font-semibold text-nf-text mb-4">Platform Overview</h3>
                <p className="text-nf-text-secondary">
                    Welcome to the Admin Dashboard. Use the tabs above to manage videos and users across the platform.
                </p>
            </div>
        </div>
    );

    const renderUserManagement = () => (
        <div className="max-w-4xl mx-auto">
            {loadingUsers ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nf-accent"></div>
                    <span className="text-nf-text-muted">Loading users...</span>
                </div>
            ) : (
                <div className="space-y-4">
                    {users.map((u, index) => (
                        <motion.div
                            key={u.id}
                            className="nf-card-static p-4 flex items-center gap-4"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            {/* Avatar */}
                            <img
                                src={getImageSrc(u.avatar, '/assets/')}
                                alt={u.username}
                                className="w-12 h-12 rounded-full object-cover"
                                onError={(e) => { e.target.onerror = null; e.target.src = '/assets/avatar.png'; }}
                            />

                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-nf-text">{u.username}</h3>
                                    {u.role?.roleName === 'ROLE_ADMIN' && (
                                        <span className="px-2 py-0.5 rounded-full bg-nf-accent/20 text-nf-accent text-xs font-medium">
                                            Admin
                                        </span>
                                    )}
                                    {u.id === user.id && (
                                        <span className="px-2 py-0.5 rounded-full bg-nf-secondary/20 text-nf-secondary text-xs font-medium">
                                            You
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-nf-text-muted truncate">{u.email}</p>
                            </div>

                            {/* Actions */}
                            {u.id !== user.id && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleToggleAdmin(u.id, u.role?.roleName)}
                                        className={`p-2.5 rounded-lg transition-all duration-200 cursor-pointer ${u.role?.roleName === 'ROLE_ADMIN'
                                            ? 'text-nf-accent hover:bg-nf-accent/10'
                                            : 'text-nf-text-muted hover:text-nf-accent hover:bg-nf-accent/10'
                                            }`}
                                        title={u.role?.roleName === 'ROLE_ADMIN' ? 'Remove admin' : 'Make admin'}
                                    >
                                        <ShieldCheckIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(u.id)}
                                        className="p-2.5 rounded-lg text-nf-text-muted hover:text-nf-error hover:bg-nf-error/10 transition-all duration-200 cursor-pointer"
                                        title="Delete user"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="nf-page min-h-screen relative">
            {/* Background */}
            <div className="fixed inset-0 nf-hero-bg">
                <OptimizedImage
                    src="/assets/background.jpg"
                    alt="Background"
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-12">
                {/* Header */}
                <motion.div
                    className="text-center mb-10"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-nf-accent/10 mb-4">
                        <Cog6ToothIcon className="w-8 h-8 text-nf-accent" />
                    </div>
                    <h1 className="text-4xl font-bold text-nf-text mb-2">
                        Admin Dashboard
                    </h1>
                    <p className="text-nf-text-secondary">
                        Full control over platform content and users
                    </p>
                </motion.div>

                {/* Tab Navigation */}
                <motion.div
                    className="flex justify-center mb-8"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className="inline-flex p-1.5 rounded-xl bg-nf-surface border border-nf-border flex-wrap justify-center gap-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 cursor-pointer ${activeTab === tab.id
                                    ? "bg-nf-accent text-nf-bg"
                                    : "text-nf-text-secondary hover:text-nf-text hover:bg-nf-surface-hover"
                                    }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Tab Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === "overview" && renderOverview()}
                    {activeTab === "create" && <CreateVideoForm onSuccess={() => setActiveTab("videos")} />}
                    {activeTab === "videos" && <VideoList showAllVideos={true} />}
                    {activeTab === "users" && renderUserManagement()}
                </motion.div>
            </div>
        </div>
    )
}

export default AdminPage
