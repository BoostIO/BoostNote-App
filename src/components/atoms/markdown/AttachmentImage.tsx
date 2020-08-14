import React, { useEffect, useState, useMemo } from 'react'
import { Attachment, AttachmentData } from '../../../lib/db/types'

interface AttachmentImageProps {
  attachment: Attachment
  [key: string]: any
}

const AttachmentImage = ({ attachment, ...props }: AttachmentImageProps) => {
  const [data, setData] = useState<AttachmentData | null>(null)
  useEffect(() => {
    attachment.getData().then((data) => {
      setData(data)
    })
  }, [attachment])

  const src = useMemo(() => {
    if (data == null) {
      return ''
    }
    switch (data.type) {
      case 'blob':
        return URL.createObjectURL(data.blob)
      case 'src':
        return data.src
    }
  }, [data])
  useEffect(() => {
    return () => {
      URL.revokeObjectURL(src)
    }
  }, [src])

  if (data == null) {
    return null
  }

  return <img src={src} {...props} />
}

export default AttachmentImage
