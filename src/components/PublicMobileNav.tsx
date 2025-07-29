'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function PublicMobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  const closeMenu = () => setIsOpen(false)

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-purple-900/20 transition-all duration-200"
        aria-label="Toggle menu"
      >
        <div className="w-5 h-5 flex flex-col justify-center items-center">
          <span className={`w-full h-0.5 bg-gray-300 transition-all duration-300 mb-1 ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
          <span className={`w-full h-0.5 bg-gray-300 transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
          <span className={`w-full h-0.5 bg-gray-300 transition-all duration-300 mt-1 ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
        </div>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={closeMenu}
        />
      )}

      {/* Menu Panel */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-slate-900 shadow-2xl transform transition-transform duration-300 z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">thehackai</h2>
              <button
                onClick={closeMenu}
                className="text-gray-300 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-6">
            <div className="space-y-2">
              
              <Link href="/blog" onClick={closeMenu}
                className="flex items-center px-3 py-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200">
                <span className="mr-3">✍️</span>
                Blog
              </Link>
              
              <Link href="/login" onClick={closeMenu}
                className="flex items-center px-3 py-3 text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 rounded-lg transition-all duration-200">
                <span className="mr-3">👋</span>
                Sign In
              </Link>
            </div>
          </nav>

          {/* Get Started */}
          <div className="border-t border-gray-700 p-6">
            <Link
              href="/signup"
              onClick={closeMenu}
              className="w-full flex items-center justify-center px-3 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200"
            >
              <span className="mr-3">🚀</span>
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}