// components/SegmentedProgressBar.tsx
// Created: World-class segmented progress bar with animations and particle effects

"use client"

import { useEffect, useState } from "react"
import { CheckCircle, Lock, Flame, Sparkles } from "lucide-react"

interface SegmentedProgressBarProps {
  current: number
  total: number
  className?: string
}

export default function SegmentedProgressBar({ current, total, className = "" }: SegmentedProgressBarProps) {
  const [animatedCurrent, setAnimatedCurrent] = useState(0)
  const [showSparkles, setShowSparkles] = useState(false)

  useEffect(() => {
    // Animate count up
    const timer = setTimeout(() => {
      if (animatedCurrent < current) {
        setAnimatedCurrent(animatedCurrent + 1)
        setShowSparkles(true)
        setTimeout(() => setShowSparkles(false), 500)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [animatedCurrent, current])

  const segments = Array.from({ length: total }, (_, i) => {
    const index = i + 1
    const isCompleted = index <= animatedCurrent
    const isNext = index === animatedCurrent + 1
    const isLocked = index > animatedCurrent + 1

    return {
      index,
      isCompleted,
      isNext,
      isLocked,
    }
  })

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Segments Container */}
      <div className="flex gap-2 relative">
        {segments.map((segment) => (
          <div
            key={segment.index}
            className="flex-1 relative"
            style={{
              animation: segment.isCompleted ? 'segment-complete 0.6s ease-out' : 'none',
            }}
          >
            {/* Segment Bar */}
            <div
              className={`h-3 rounded-full relative overflow-hidden transition-all duration-500 ${
                segment.isCompleted
                  ? 'bg-gradient-to-r from-green-500 to-green-400 shadow-lg shadow-green-500/50'
                  : segment.isNext
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 shadow-lg shadow-orange-500/50 animate-glow-pulse'
                  : 'bg-gray-800/50 border border-gray-700/30'
              }`}
            >
              {/* Shimmer effect for completed segments */}
              {segment.isCompleted && (
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
                  style={{
                    animation: 'shimmer 2s infinite',
                  }}
                />
              )}

              {/* Pulse effect for next segment */}
              {segment.isNext && (
                <>
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 animate-pulse"
                    style={{ opacity: 0.5 }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Flame className="w-3 h-3 text-white animate-bounce" />
                  </div>
                </>
              )}

              {/* Lock icon for locked segments */}
              {segment.isLocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="w-2.5 h-2.5 text-gray-600" />
                </div>
              )}

              {/* Checkmark for completed segments */}
              {segment.isCompleted && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white drop-shadow-md" />
                </div>
              )}
            </div>

            {/* Segment number label below */}
            <div className="text-center mt-1.5">
              <span
                className={`text-xs font-bold transition-all duration-300 ${
                  segment.isCompleted
                    ? 'text-green-400'
                    : segment.isNext
                    ? 'text-orange-400'
                    : 'text-gray-600'
                }`}
              >
                {segment.index}
              </span>
            </div>

            {/* Sparkle particles for completed segments */}
            {segment.isCompleted && showSparkles && segment.index === animatedCurrent && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 pointer-events-none">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Sparkles
                    key={i}
                    className="absolute text-yellow-400 animate-sparkle"
                    style={{
                      width: '12px',
                      height: '12px',
                      left: `${(i - 2) * 8}px`,
                      top: '-10px',
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Connecting line (except for last segment) */}
            {segment.index < total && (
              <div
                className={`absolute top-1.5 left-full w-2 h-0.5 transition-all duration-500 ${
                  segment.isCompleted
                    ? 'bg-gradient-to-r from-green-400 to-orange-500'
                    : 'bg-gray-700/30'
                }`}
                style={{
                  transform: 'translateX(-50%)',
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Progress percentage text */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-muted">
          Progress: <span className="text-orange-400 font-bold">{current}</span>
          <span className="text-gray-600">/</span>
          <span className="text-text-light font-semibold">{total}</span>
        </span>
        <span className="text-orange-400 font-bold text-base">
          {Math.round((current / total) * 100)}%
        </span>
      </div>
    </div>
  )
}