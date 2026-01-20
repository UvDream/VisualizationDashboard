import React from 'react'
import type { ComponentProps as ComponentPropsType } from '../../types'
import './GradientText.less'

interface GradientTextProps {
    props: ComponentPropsType
    style: React.CSSProperties
}

export default function GradientText({ props, style }: GradientTextProps) {
    const {
        content = '渐变文字',
        fontSize = 32,
        fontWeight = 'bold',
        gradientType = 'linear', // linear 或 radial
        gradientAngle = 45, // 线性渐变角度
        gradientColors = ['#ff0000', '#00ff00', '#0000ff'], // 渐变颜色数组
        textShadow = false,
        shadowColor = 'rgba(0,0,0,0.5)',
        shadowBlur = 10,
        shadowOffsetX = 2,
        shadowOffsetY = 2,
        letterSpacing = 0,
        lineHeight = 1.2,
        textAlign = 'center',
    } = props

    // 生成渐变背景
    const getGradientBackground = () => {
        if (gradientType === 'linear') {
            const colorStops = gradientColors
                .map((color, index) => {
                    const percentage = (index / (gradientColors.length - 1)) * 100
                    return `${color} ${percentage}%`
                })
                .join(', ')
            return `linear-gradient(${gradientAngle}deg, ${colorStops})`
        } else {
            // radial 渐变
            const colorStops = gradientColors
                .map((color, index) => {
                    const percentage = (index / (gradientColors.length - 1)) * 100
                    return `${color} ${percentage}%`
                })
                .join(', ')
            return `radial-gradient(circle, ${colorStops})`
        }
    }

    // 生成文字阴影
    const getTextShadow = () => {
        if (!textShadow) return 'none'
        return `${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur}px ${shadowColor}`
    }

    const textStyle: React.CSSProperties = {
        fontSize: `${fontSize}px`,
        fontWeight: fontWeight as any,
        background: getGradientBackground(),
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textShadow: getTextShadow(),
        letterSpacing: `${letterSpacing}px`,
        lineHeight: lineHeight,
        textAlign: textAlign as any,
        margin: 0,
        padding: 0,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
    }

    return (
        <div className="gradient-text-container" style={style}>
            <p style={textStyle}>{content}</p>
        </div>
    )
}
