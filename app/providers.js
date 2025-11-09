'use client'

import { createContext, useContext } from 'react'

// Create a context for any future providers
const AppContext = createContext({})

export const useAppContext = () => useContext(AppContext)

export default function Providers({ children }) {
  return (
    <AppContext.Provider value={{}}>
      {children}
    </AppContext.Provider>
  )
}
