import { useEffect, useState, useRef } from 'react'
import './FlipCountdown.less'

interface FlipCountdownProps {
  countdownMode?: 'target' | 'duration'
  targetDate?: string
  countdownDuration?: number
  showDays?: boolean
  showHours?: boolean
  showMinutes?: boolean
  showSeconds?: boolean
  cardWidth?: number
  cardHeight?: number
  fontSize?: number
  cardColorType?: 'solid' | 'gradient'
  cardSolidColor?: string
  cardGradientStart?: string
  cardGradientEnd?: string
  textColor?: string
  labelColor?: string
  showLabels?: boolean
  separator?: string
}

interface DigitState {
  current: number
  next: number
  flipping: boolean
}

export default function FlipCountdown({
  countdownMode = 'target',
  targetDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  countdownDuration = 3600,
  showDays = true,
  showHours = true,
  showMinutes = true,
  showSeconds = true,
  cardWidth = 60,
  cardHeight = 80,
  fontSize = 48,
  cardColorType = 'gradient',
  cardSolidColor = '#2a4a6a',
  cardGradientStart = '#2a4a6a',
  cardGradientEnd = '#0a2a4a',
  textColor = '#ffffff',
  labelColor = 'rgba(255, 255, 255, 0.6)',
  showLabels = true,
  separator = ':'
}: FlipCountdownProps) {
  // 每个数字位独立管理状态
  const [daysDigits, setDaysDigits] = useState<DigitState[]>([
    { current: 0, next: 0, flipping: false },
    { current: 0, next: 0, flipping: false }
  ])
  const [hoursDigits, setHoursDigits] = useState<DigitState[]>([
    { current: 0, next: 0, flipping: false },
    { current: 0, next: 0, flipping: false }
  ])
  const [minutesDigits, setMinutesDigits] = useState<DigitState[]>([
    { current: 0, next: 0, flipping: false },
    { current: 0, next: 0, flipping: false }
  ])
  const [secondsDigits, setSecondsDigits] = useState<DigitState[]>([
    { current: 0, next: 0, flipping: false },
    { current: 0, next: 0, flipping: false }
  ])

  const prevTimeRef = useRef({ d: 0, h: 0, m: 0, s: 0 })
  const startTimeRef = useRef<number | null>(null)

  // 生成卡片背景色
  const getCardBackground = () => {
    if (cardColorType === 'solid') {
      return cardSolidColor
    }
    return `linear-gradient(180deg, ${cardGradientStart} 0%, ${cardGradientEnd} 100%)`
  }

  const cardBackground = getCardBackground()

  // 更新单个数字位的状态
  const updateDigits = (
    value: number,
    prevValue: number,
    setDigits: React.Dispatch<React.SetStateAction<DigitState[]>>
  ) => {
    const currentStr = String(prevValue).padStart(2, '0')
    const nextStr = String(value).padStart(2, '0')

    setDigits(prev => {
      const newDigits = [...prev]
      
      // 检查每一位是否变化
      for (let i = 0; i < 2; i++) {
        const currentDigit = parseInt(currentStr[i])
        const nextDigit = parseInt(nextStr[i])
        
        if (currentDigit !== nextDigit) {
          // 只有变化的数字才翻动
          newDigits[i] = {
            current: currentDigit,
            next: nextDigit,
            flipping: true
          }
          
          // 600ms后结束翻动
          setTimeout(() => {
            setDigits(prev => {
              const updated = [...prev]
              updated[i] = {
                current: nextDigit,
                next: nextDigit,
                flipping: false
              }
              return updated
            })
          }, 600)
        }
      }
      
      return newDigits
    })
  }

  useEffect(() => {
    const calculateTime = () => {
      let diff: number

      if (countdownMode === 'duration') {
        // 时长模式
        if (startTimeRef.current === null) {
          startTimeRef.current = Date.now()
        }
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        diff = Math.max(0, countdownDuration - elapsed) * 1000
      } else {
        // 目标时间模式
        const now = Date.now()
        const target = new Date(targetDate).getTime()
        diff = Math.max(0, target - now)
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24))
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const s = Math.floor((diff % (1000 * 60)) / 1000)

      const prev = prevTimeRef.current

      // 检测变化并触发翻牌动画
      if (d !== prev.d) {
        updateDigits(d, prev.d, setDaysDigits)
      }
      if (h !== prev.h) {
        updateDigits(h, prev.h, setHoursDigits)
      }
      if (m !== prev.m) {
        updateDigits(m, prev.m, setMinutesDigits)
      }
      if (s !== prev.s) {
        updateDigits(s, prev.s, setSecondsDigits)
      }

      prevTimeRef.current = { d, h, m, s }
    }

    // 重置开始时间（当模式或时长改变时）
    if (countdownMode === 'duration') {
      startTimeRef.current = null
    }

    // 初始化
    calculateTime()

    const timer = setInterval(calculateTime, 1000)
    return () => clearInterval(timer)
  }, [targetDate, countdownMode, countdownDuration])

  const renderFlipCard = (digit: DigitState, index: number) => {
    return (
      <div
        key={index}
        className="flip-card"
        style={{
          width: cardWidth,
          height: cardHeight,
        }}
      >
        {/* 上半部分 - 当前数字 */}
        <div
          className="flip-card-upper"
          style={{
            background: cardBackground,
            color: textColor,
            fontSize: fontSize,
          }}
        >
          <div className="flip-card-number">{digit.current}</div>
        </div>

        {/* 下半部分 - 当前数字 */}
        <div
          className="flip-card-lower"
          style={{
            background: cardBackground,
            color: textColor,
            fontSize: fontSize,
          }}
        >
          <div className="flip-card-number">{digit.current}</div>
        </div>

        {/* 翻动的上半部分 */}
        {digit.flipping && (
          <>
            <div
              className="flip-card-upper-flip"
              style={{
                background: cardBackground,
                color: textColor,
                fontSize: fontSize,
              }}
            >
              <div className="flip-card-number">{digit.current}</div>
            </div>

            <div
              className="flip-card-lower-flip"
              style={{
                background: cardBackground,
                color: textColor,
                fontSize: fontSize,
              }}
            >
              <div className="flip-card-number">{digit.next}</div>
            </div>
          </>
        )}
      </div>
    )
  }

  const units = []

  if (showDays) {
    units.push(
      <div key="days" className="flip-unit">
        <div className="flip-cards">
          {daysDigits.map((digit, index) => renderFlipCard(digit, index))}
        </div>
        {showLabels && <div className="flip-label" style={{ color: labelColor }}>天</div>}
      </div>
    )
  }

  if (showHours) {
    if (units.length > 0) {
      units.push(
        <div key="sep1" className="flip-separator" style={{ color: textColor }}>
          {separator}
        </div>
      )
    }
    units.push(
      <div key="hours" className="flip-unit">
        <div className="flip-cards">
          {hoursDigits.map((digit, index) => renderFlipCard(digit, index))}
        </div>
        {showLabels && <div className="flip-label" style={{ color: labelColor }}>时</div>}
      </div>
    )
  }

  if (showMinutes) {
    if (units.length > 0) {
      units.push(
        <div key="sep2" className="flip-separator" style={{ color: textColor }}>
          {separator}
        </div>
      )
    }
    units.push(
      <div key="minutes" className="flip-unit">
        <div className="flip-cards">
          {minutesDigits.map((digit, index) => renderFlipCard(digit, index))}
        </div>
        {showLabels && <div className="flip-label" style={{ color: labelColor }}>分</div>}
      </div>
    )
  }

  if (showSeconds) {
    if (units.length > 0) {
      units.push(
        <div key="sep3" className="flip-separator" style={{ color: textColor }}>
          {separator}
        </div>
      )
    }
    units.push(
      <div key="seconds" className="flip-unit">
        <div className="flip-cards">
          {secondsDigits.map((digit, index) => renderFlipCard(digit, index))}
        </div>
        {showLabels && <div className="flip-label" style={{ color: labelColor }}>秒</div>}
      </div>
    )
  }

  return <div className="flip-countdown">{units}</div>
}
