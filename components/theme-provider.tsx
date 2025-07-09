'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps, useTheme } from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="theme-preference"
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

export function useThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  return { theme, setTheme, resolvedTheme, toggleTheme };
}
