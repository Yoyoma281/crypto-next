import React from "react"

type SparklineProps = {
  data: number[]
  width?: number
  height?: number
  stroke?: string
  strokeWidth?: number
  fill?: string
}

export default function Sparkline({
  data,
  width = 100,
  height = 30,
  stroke = "#4ade80", // green
  strokeWidth = 2,
  fill = "none",
}: SparklineProps) {
  if (data.length === 0) return null

  // Normalize data
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  stroke = data[data.length - 1] > data[0] ? "#4ade80" : "#f87171";
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((val - min) / range) * height
    return `${x},${y}`
  }).join(" ")

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        points={points}
      />
    </svg>
  )
}
