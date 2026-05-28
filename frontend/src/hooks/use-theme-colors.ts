import { useEffect, useState } from 'react'

export type ThemeMarkerColors = {
  primary: string
  background: string
}

function readCssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function getMarkerColors(): ThemeMarkerColors {
  return {
    primary: readCssVar('--primary'),
    background: readCssVar('--background'),
  }
}

export function useThemeMarkerColors(): ThemeMarkerColors {
  const [colors, setColors] = useState<ThemeMarkerColors>(getMarkerColors)

  useEffect(() => {
    const observer = new MutationObserver(() => setColors(getMarkerColors()))

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  return colors
}
