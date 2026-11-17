import { createContext, useContext } from 'react'

interface Actions { restart: () => void }
export const BookActionsContext = createContext<Actions>({ restart: () => {} })
export const useBookActions = () => useContext(BookActionsContext)
