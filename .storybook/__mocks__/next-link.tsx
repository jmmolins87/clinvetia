import * as React from "react"

type LinkProps = {
  href: string
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  target?: string
  rel?: string
  prefetch?: boolean
  replace?: boolean
  scroll?: boolean
  shallow?: boolean
  passHref?: boolean
  legacyBehavior?: boolean
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
}

export default function NextLinkMock({
  href,
  children,
  className,
  style,
  target,
  rel,
  onClick,
  ...props
}: LinkProps) {
  return (
    <a
      href={href}
      className={className}
      style={style}
      target={target}
      rel={rel}
      onClick={onClick}
      {...props}
    >
      {children}
    </a>
  )
}
