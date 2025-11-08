import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, MapPin, Sparkles, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
    onExplore: () => void;
}

const HeroSection = ({ onExplore }: HeroSectionProps) => {
    const navigate = useNavigate();
    const [displayedText, setDisplayedText] = useState('');
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const phrases = [
        'Your Dream Home',
        'Modern Living Spaces',
        'Smart Communities',
        'Premium Amenities',
        'Connected Neighborhoods'
    ];

    useEffect(() => {
        const currentPhrase = phrases[currentPhraseIndex];
        const typingSpeed = isDeleting ? 50 : 100;
        const pauseTime = 2000;

        const timer = setTimeout(() => {
            if (!isDeleting && displayedText === currentPhrase) {
                // Pause before deleting
                setTimeout(() => setIsDeleting(true), pauseTime);
            } else if (isDeleting && displayedText === '') {
                // Move to next phrase
                setIsDeleting(false);
                setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
            } else {
                // Type or delete character
                setDisplayedText(
                    isDeleting
                        ? currentPhrase.substring(0, displayedText.length - 1)
                        : currentPhrase.substring(0, displayedText.length + 1)
                );
            }
        }, typingSpeed);

        return () => clearTimeout(timer);
    }, [displayedText, isDeleting, currentPhraseIndex]);

    return (
        <div className="relative min-h-[90vh] flex items-center overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-green-950 to-black">
                {/* Animated Orbs */}
                <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-40 right-20 w-72 h-72 bg-green-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-teal-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
                
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column - Text Content */}
                    <div className="text-white space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-900/30 backdrop-blur-sm rounded-full border border-emerald-700/30">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-medium text-emerald-100">Welcome to Shivalik Real Estate</span>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                                Find{' '}
                                <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
                                    {displayedText}
                                    <span className="animate-pulse">|</span>
                                </span>
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl">
                                Discover premium real estate communities with world-class amenities, 
                                vibrant neighborhoods, and endless possibilities.
                            </p>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="group px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-700 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-emerald-900/50 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                            >
                                Dive into World of Real Estate
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-6 pt-8">
                            <div className="text-center">
                                <div className="flex items-center justify-center mb-2">
                                    <Building2 className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div className="text-3xl font-bold text-emerald-100">50+</div>
                                <div className="text-sm text-gray-400">Communities</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center mb-2">
                                    <Users className="w-6 h-6 text-green-400" />
                                </div>
                                <div className="text-3xl font-bold text-emerald-100">10K+</div>
                                <div className="text-sm text-gray-400">Happy Residents</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center mb-2">
                                    <MapPin className="w-6 h-6 text-teal-400" />
                                </div>
                                <div className="text-3xl font-bold text-emerald-100">25+</div>
                                <div className="text-sm text-gray-400">Cities</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Building Image */}
                    <div className="hidden lg:block relative h-[600px]">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <img 
                                src="./public/image.png"
                                                                alt="Modern Buildings"
                                className="w-full h-full object-contain animate-float drop-shadow-2xl"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative wave */}
            <div className="absolute bottom-0 left-0 right-0 z-20">
                <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                    <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F9FAFB"/>
                </svg>
            </div>

            {/* Add required animations to global CSS */}
            <style>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                .bg-grid-white\/\[0\.05\] {
                    background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
                }
            `}</style>
        </div>
    );
};

export default HeroSection;
