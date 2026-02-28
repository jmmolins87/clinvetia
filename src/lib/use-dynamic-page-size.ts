import { useCallback, useEffect, useState, type RefObject } from "react"

type Params = {
  listRef: RefObject<HTMLElement | null>
  itemRef: RefObject<HTMLElement | null>
  footerRef?: RefObject<HTMLElement | null>
  defaultSize: number
  min?: number
  bottomPadding?: number
  deps?: unknown[]
}

export function useDynamicPageSize({
  listRef,
  itemRef,
  footerRef,
  defaultSize,
  min = 1,
  bottomPadding = 24,
  deps = [],
}: Params) {
  const [pageSize, setPageSize] = useState(defaultSize)
  const depsKey = JSON.stringify(deps)

  const compute = useCallback(() => {
    const listEl = listRef.current
    if (!listEl) return
    const firstItem = itemRef.current || (listEl.firstElementChild as HTMLElement | null)
    if (!firstItem) {
      setPageSize(defaultSize)
      return
    }

    const listRect = listEl.getBoundingClientRect()
    const footerHeight = footerRef?.current?.getBoundingClientRect().height ?? 0
    const available = window.innerHeight - listRect.top - footerHeight - bottomPadding
    if (!Number.isFinite(available) || available <= 0) {
      setPageSize(min)
      return
    }

    let rowHeight = firstItem.getBoundingClientRect().height
    const secondItem = listEl.children[1] as HTMLElement | undefined
    if (secondItem) {
      const secondRect = secondItem.getBoundingClientRect()
      rowHeight = Math.max(1, secondRect.top - firstItem.getBoundingClientRect().top)
    }
    if (!Number.isFinite(rowHeight) || rowHeight <= 0) {
      setPageSize(defaultSize)
      return
    }

    const next = Math.max(min, Math.floor(available / rowHeight))
    setPageSize(next)
  }, [listRef, itemRef, footerRef, defaultSize, min, bottomPadding])

  useEffect(() => {
    compute()
  }, [compute, depsKey])

  useEffect(() => {
    const handle = () => compute()
    const observer = new ResizeObserver(handle)
    if (listRef.current) observer.observe(listRef.current)
    if (itemRef.current) observer.observe(itemRef.current)
    if (footerRef?.current) observer.observe(footerRef.current)
    window.addEventListener("resize", handle)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", handle)
    }
  }, [compute, listRef, itemRef, footerRef])

  return pageSize
}
