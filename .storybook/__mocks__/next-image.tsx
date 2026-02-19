import * as React from "react"

type ImageProps = {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  sizes?: string
  priority?: boolean
  className?: string
  style?: React.CSSProperties
}

export default function NextImageMock({ src, alt, fill, className, style, ...props }: ImageProps) {
  const resolvedStyle: React.CSSProperties = fill
    ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...style }
    : style ?? {}

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      style={resolvedStyle}
      {...(props.width && { width: props.width })}
      {...(props.height && { height: props.height })}
    />
  )
}
