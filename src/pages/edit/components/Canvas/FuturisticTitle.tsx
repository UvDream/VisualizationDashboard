import React from 'react';
import './FuturisticTitle.less';

interface FuturisticTitleProps {
    content?: string;
    subContent?: string;
    titleColor?: string;
    fontSize?: number;
}

const FuturisticTitle: React.FC<FuturisticTitleProps> = ({
    content = '可视化大数据展示平台',
    subContent = 'VISUALIZATION BIG DATA PLATFORM',
    titleColor = '#00ccff',
    fontSize = 24,
}) => {
    return (
        <div className="futuristic-title-wrapper">
            <svg className="futuristic-title-bg" viewBox="0 0 800 80" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="titleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(0, 204, 255, 0.1)" />
                        <stop offset="50%" stopColor="rgba(0, 204, 255, 0.3)" />
                        <stop offset="100%" stopColor="rgba(0, 204, 255, 0.1)" />
                    </linearGradient>
                    <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="15%" stopColor={titleColor} />
                        <stop offset="85%" stopColor={titleColor} />
                        <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                </defs>

                {/* Main Body */}
                <path
                    d="M 50 10 L 750 10 L 780 40 L 750 70 L 50 70 L 20 40 Z"
                    fill="url(#titleGradient)"
                    stroke={titleColor}
                    strokeWidth="1"
                    opacity="0.6"
                />

                {/* Top Border Accents */}
                <path d="M 100 10 L 700 10" stroke={titleColor} strokeWidth="2" opacity="0.8" />

                {/* Bottom Main Border */}
                <path d="M 80 70 L 720 70" stroke={titleColor} strokeWidth="3" />

                {/* Left Decoration */}
                <path d="M 20 40 L 40 40 L 50 30" fill="none" stroke={titleColor} strokeWidth="2" />
                <path d="M 20 40 L 40 40 L 50 50" fill="none" stroke={titleColor} strokeWidth="2" />

                {/* Right Decoration */}
                <path d="M 780 40 L 760 40 L 750 30" fill="none" stroke={titleColor} strokeWidth="2" />
                <path d="M 780 40 L 760 40 L 750 50" fill="none" stroke={titleColor} strokeWidth="2" />

                {/* Additional Glowing Lines */}
                <path d="M 200 75 L 600 75" stroke={titleColor} strokeWidth="1" strokeDasharray="100 20" opacity="0.5" />
            </svg>

            <div className="futuristic-title-content">
                <h1 className="main-title" style={{ color: titleColor, fontSize: `${fontSize}px` }}>
                    {content}
                </h1>
                {subContent && (
                    <div className="sub-title" style={{ color: titleColor, opacity: 0.7 }}>
                        {subContent}
                    </div>
                )}
            </div>

            <div className="glow-effect" style={{ boxShadow: `0 0 20px ${titleColor}33` }}></div>
        </div>
    );
};

export default FuturisticTitle;
