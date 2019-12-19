import React, { CSSProperties } from 'react'
import isElectron from 'is-electron'

interface ImageProps {
  src: string
  className?: string
  style?: CSSProperties
  alt?: string
}

const Image = ({ src, className, style, alt }: ImageProps) => {
  if (isElectron() && src.startsWith('/app')) {
    src = src.slice(1)
  }

  return <img src={src} className={className} style={style} alt={alt} />
}

export default Image
