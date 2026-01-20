import React, { useMemo } from 'react'
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

    // 使用 useMemo 确保当颜色改变时重新计算渐变
    const gradientId = useMemo(() => `gradient-${Math.random().toString(36).substr(2, 9)}`, [])
    
    const gradientBackground = useMemo(() => {
        // 确保颜色数组有效且至少有2个颜色
        const validColors = (gradientColors && gradientColors.length >= 2) 
            ? gradientColors.filter(c => c && typeof c === 'string' && c.trim().length > 0)
            : ['#ff0000', '#00ff00', '#0000ff']
        
        // 如果过滤后少于2个颜色，使用默认颜色
        const colorsToUse = validColors.length >= 2 ? validColors : ['#ff0000', '#00ff00', '#0000ff']

        if (gradientType === 'linear') {
            const colorStops = colorsToUse
                .map((color, index) => {
                    const percentage = (index / (colorsToUse.length - 1)) * 100
                    return `${color} ${percentage}%`
                })
                .join(', ')
            return `linear-gradient(${gradientAngle}deg, ${colorStops})`
        } else {
            // radial 渐变
            const colorStops = colorsToUse
                .map((color, index) => {
                    const percentage = (index / (colorsToUse.length - 1)) * 100
                    return `${color} ${percentage}%`
                })
                .join(', ')
            return `radial-gradient(circle, ${colorStops})`
        }
    }, [gradientColors, gradientType, gradientAngle])

    // 生成文字阴影
    const textShadowValue = useMemo(() => {
        if (!textShadow) return 'none'
        return `${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur}px ${shadowColor}`
    }, [textShadow, shadowOffsetX, shadowOffsetY, shadowBlur, shadowColor])

    const textStyle: React.CSSProperties = {
        fontSize: `${fontSize}px`,
        fontWeight: fontWeight as any,
        background: gradientBackground,
        backgroundClip: 'text' as any,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textShadow: textShadowValue,
        letterSpacing: `${letterSpacing}px`,
        lineHeight: lineHeight,
        textAlign: textAlign as any,
        margin: 0,
        padding: 0,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        display: 'inline-block',
        width: '100%',
        // 强制重新渲染
        key: gradientBackground,
    } as React.CSSProperties

    return (
        <div className="gradient-text-container" style={style} key={gradientBackground}>
            <p style={textStyle}>{content}</p>
        </div>
    )
}

