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
        <div className="relative min-h-[70vh] flex items-center overflow-hidden pt-0">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-white">
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-grid-gray-200/[0.2] bg-[size:50px_50px]"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Left Column - Text Content */}
                    <div className="text-black space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full border border-gray-300">
                            <Sparkles className="w-4 h-4 text-gray-700" />
                            <span className="text-sm font-medium text-gray-800">Welcome to Shivalik Real Estate</span>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                                Find{' '}
                                <span className="text-black">
                                    {displayedText}
                                    <span className="animate-pulse">|</span>
                                </span> 
                            </h1>
                            <p className="text-xl text-gray-600 max-w-2xl">
                                Discover premium real estate communities with world-class amenities, 
                                vibrant neighborhoods, and endless possibilities.
                            </p>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="group px-8 py-4 bg-black text-white font-semibold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                            >
                                Dive into World of Real Estate
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 pt-6">
                            <div className="text-center">
                                <div className="flex items-center justify-center mb-2">
                                    <Building2 className="w-6 h-6 text-gray-800" />
                                </div>
                                <div className="text-2xl font-bold text-black">50+</div>
                                <div className="text-sm text-gray-600">Communities</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center mb-2">
                                    <Users className="w-6 h-6 text-gray-800" />
                                </div>
                                <div className="text-2xl font-bold text-black">10K+</div>
                                <div className="text-sm text-gray-600">Happy Residents</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center mb-2">
                                    <MapPin className="w-6 h-6 text-gray-800" />
                                </div>
                                <div className="text-2xl font-bold text-black">25+</div>
                                <div className="text-sm text-gray-600">Cities</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Building Image */}
                    <div className="hidden lg:block relative h-[500px]">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <img 
                                src="./image.png" alt="Modern Buildings"
                                className="w-full h-full object-contain animate-float drop-shadow-2xl"
                            />
                        </div>
                    </div>
                </div>
            </div>

            

            {/* Add required animations to global CSS */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .bg-grid-gray-200\/\[0\.2\] {
                    background-image: linear-gradient(rgba(209, 213, 219, 0.2) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(209, 213, 219, 0.2) 1px, transparent 1px);
                }
            `}</style>
        </div>
    );
};

export default HeroSection;