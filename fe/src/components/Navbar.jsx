import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import SearchCard from './SearchCard'
import OptimizedImage from './OptimizedImage'
import { useNavigateWithLoading } from '../hooks/useNavigateWithLoading'

import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { LockClosedIcon, BookmarkIcon, Bars3Icon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

import { useVideoStore } from '../stores/useVideoStore';
import { useUserStore } from "../stores/useUserStore";

import toast from "react-hot-toast"

const Navbar = () => {
    const navigate = useNavigate();
    const navigateWithLoading = useNavigateWithLoading();

    const { fetchVideosBySearch } = useVideoStore();

    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const searchRef = useRef(null)

    const { user, logout } = useUserStore();

    const recentSearches = ["action movies", "sci-fi", "christopher nolan"]

    // Handle clicks outside the search area
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchFocused(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, []);

    const handleMovieClick = (movie) => {
        console.log('Selected movie:', movie)
        setIsSearchFocused(false)
    }

    const handleRecentSearchClick = (search) => {
        setSearchQuery(search)
        setIsSearchFocused(false)
    }

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            await fetchVideosBySearch(searchQuery);
            navigateWithLoading(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setIsSearchFocused(false);
        } catch (err) {
            console.error('Error searching videos: ' + err);
            toast.error('Could not search videos. Please try again.');
        }
    }

    return (
        <Disclosure as="nav" className="relative">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="relative flex h-16 items-center justify-between">
                    {/* Mobile menu button */}
                    <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                        <DisclosureButton className="group relative inline-flex items-center justify-center rounded-lg p-2 text-nf-text-muted hover:bg-nf-surface hover:text-nf-text transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-nf-accent/50">
                            <span className="absolute -inset-0.5" />
                            <span className="sr-only">Open main menu</span>
                            <Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
                            <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
                        </DisclosureButton>
                    </div>

                    {/* Logo */}
                    <div className="flex flex-1 items-center justify-center sm:justify-start">
                        <div className="flex shrink-0 items-center">
                            <Link to="/" className="group">
                                <OptimizedImage
                                    alt="Netflex"
                                    src="../assets/logo.png"
                                    className="h-14 w-auto transition-transform duration-200 group-hover:scale-105"
                                />
                            </Link>
                        </div>
                    </div>

                    {/* Right side - Search and User actions */}
                    <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                        {user ? (
                            <>
                                {/* Search */}
                                <div className="relative" ref={searchRef}>
                                    <button
                                        onClick={() => setIsSearchFocused(true)}
                                        className="p-2.5 text-nf-text-muted hover:text-nf-accent rounded-lg hover:bg-nf-surface transition-all duration-200 cursor-pointer"
                                    >
                                        <MagnifyingGlassIcon className="w-5 h-5" />
                                    </button>

                                    {/* Search Overlay and Card */}
                                    <AnimatePresence>
                                        {isSearchFocused && (
                                            <>
                                                {/* Dark Overlay */}
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="fixed inset-0 bg-nf-bg/80 backdrop-blur-sm z-40"
                                                    onClick={() => setIsSearchFocused(false)}
                                                />

                                                {/* Search Card */}
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                                    className="fixed top-16 left-0 lg:left-auto lg:right-8 w-full lg:w-96 z-50"
                                                >
                                                    <div className="nf-card-static p-5 m-4 lg:m-0 shadow-2xl">
                                                        <form onSubmit={handleSearch} className="mb-4">
                                                            <div className="relative">
                                                                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-nf-text-muted pointer-events-none" />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Search movies, shows..."
                                                                    value={searchQuery}
                                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                                    className="nf-input pl-12 pr-4"
                                                                    autoFocus
                                                                />
                                                            </div>
                                                        </form>
                                                        <SearchCard
                                                            recentSearches={recentSearches}
                                                            onMovieClick={handleMovieClick}
                                                            onRecentSearchClick={handleRecentSearchClick}
                                                        />
                                                    </div>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Admin Dashboard */}
                                <Link
                                    to={`/admin/${user.id}`}
                                    className="p-2.5 text-nf-text-muted hover:text-nf-secondary rounded-lg hover:bg-nf-surface transition-all duration-200"
                                    title="Admin Dashboard"
                                >
                                    <LockClosedIcon aria-hidden="true" className="size-5" />
                                </Link>

                                {/* Watch List */}
                                <Link
                                    to={`/watchlist/${user.id}`}
                                    className="p-2.5 text-nf-text-muted hover:text-nf-accent rounded-lg hover:bg-nf-surface transition-all duration-200"
                                    title="Watch List"
                                >
                                    <BookmarkIcon aria-hidden="true" className="size-5" />
                                </Link>

                                {/* Profile Dropdown */}
                                <Menu as="div" className="relative ml-2">
                                    <MenuButton className="relative flex items-center rounded-full ring-2 ring-nf-border hover:ring-nf-accent transition-all duration-200 cursor-pointer focus:outline-none focus:ring-nf-accent">
                                        <span className="absolute -inset-1.5" />
                                        <span className="sr-only">Open user menu</span>
                                        <OptimizedImage
                                            alt=""
                                            src={user.avatar || "../assets/avatar.png"}
                                            className="size-9 rounded-full object-cover"
                                        />
                                    </MenuButton>

                                    <MenuItems
                                        transition
                                        className="absolute right-0 z-50 mt-3 w-56 origin-top-right rounded-xl nf-card-static py-2 shadow-xl transition focus:outline-none data-closed:scale-95 data-closed:opacity-0 data-enter:duration-150 data-enter:ease-out data-leave:duration-100 data-leave:ease-in"
                                    >
                                        <div className="px-4 py-3 border-b border-nf-border">
                                            <p className="text-sm font-semibold text-nf-text">{user.username || 'User'}</p>
                                            <p className="text-xs text-nf-text-muted truncate">{user.email}</p>
                                        </div>
                                        <MenuItem>
                                            <Link
                                                to="/profile"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-nf-text-secondary hover:bg-nf-surface-hover hover:text-nf-text transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                                </svg>
                                                Your Profile
                                            </Link>
                                        </MenuItem>
                                        <MenuItem>
                                            <button
                                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-nf-accent hover:bg-nf-surface-hover transition-colors cursor-pointer"
                                                onClick={async () => {
                                                    await logout();
                                                    navigateWithLoading("/");
                                                }}
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                                </svg>
                                                Log Out
                                            </button>
                                        </MenuItem>
                                    </MenuItems>
                                </Menu>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login">
                                    <button className="nf-btn nf-btn-ghost text-sm px-4 py-2">
                                        Log in
                                    </button>
                                </Link>
                                <Link to="/signup">
                                    <button className="nf-btn nf-btn-primary text-sm px-5 py-2">
                                        Sign up
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile menu panel */}
            <DisclosurePanel className="sm:hidden border-t border-nf-border bg-nf-surface">
                <div className="space-y-1 px-4 pb-3 pt-2">
                    {user && (
                        <>
                            <Link
                                to={`/watchlist/${user.id}`}
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-nf-text-secondary hover:bg-nf-surface-hover hover:text-nf-text transition-colors"
                            >
                                <BookmarkIcon className="w-5 h-5" />
                                Watch List
                            </Link>
                            <Link
                                to={`/admin/${user.id}`}
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-nf-text-secondary hover:bg-nf-surface-hover hover:text-nf-text transition-colors"
                            >
                                <LockClosedIcon className="w-5 h-5" />
                                Admin Dashboard
                            </Link>
                        </>
                    )}
                </div>
            </DisclosurePanel>
        </Disclosure>
    )
}

export default Navbar
