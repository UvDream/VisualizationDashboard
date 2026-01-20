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
        gradientType = 'linear',
        gradientAngle = 45,
        gradientColors = ['#ff0000', '#00ff00', '#0000ff'],
        textShadow = false,
        shadowColor = 'rgba(0,0,0,0.5)',
        shadowBlur = 10,
        shadowOffsetX = 2,
        shadowOffsetY = 2,
        letterSpacing = 0,
        lineHeight = 1.2,
        textAlign = 'center',
        textDecoration = 'none',
        textTransform = 'none',
        fontStyle = 'normal',
        textStroke = false,
        strokeColor = '#000000',
        strokeWidth = 1,
        opacity = 1,
    } = props
    
    const gradientBackground = useMemo(() => {
        const validColors = (gradientColors && gradientColors.length >= 2) 
            ? gradientColors.filter(c => c && typeof c === 'string' && c.trim().length > 0)
            : ['#ff0000', '#00ff00', '#0000ff']
        
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
            const colorStops = colorsToUse
                .map((color, index) => {
                    const percentage = (index / (colorsToUse.length - 1)) * 100
                    return `${color} ${percentage}%`
                })
                .join(', ')
            return `radial-gradient(circle, ${colorStops})`
        }
    }, [gradientColors, gradientType, gradientAngle])

    const textShadowValue = useMemo(() => {
        if (!textShadow) return 'none'
        return `${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur}px ${shadowColor}`
    }, [textShadow, shadowOffsetX, shadowOffsetY, shadowBlur, shadowColor])

    const textStrokeStyle = useMemo(() => {
        if (!textStroke) return {}
        return {
            WebkitTextStroke: `${strokeWidth}px ${strokeColor}`,
        }
    }, [textStroke, strokeColor, strokeWidth])

    const textStyle: React.CSSProperties = {
        fontSize: `${fontSize}px`,
        fontWeight: fontWeight as any,
        fontStyle: fontStyle as any,
        textDecoration: textDecoration as any,
        textTransform: textTransform as any,
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
        opacity: opacity,
        ...textStrokeStyle,
    } as React.CSSProperties

    return (
        <div className="gradient-text-container" style={style} key={gradientBackground}>
            <p style={textStyle}>{content}</p>
        </div>
    )
}

