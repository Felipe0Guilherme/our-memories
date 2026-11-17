import { useEffect, useState } from 'react'

export type Route = 'album' | 'admin'
const read = (): Route => (window.location.hash.startsWith('#/admin') ? 'admin' : 'album')

export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(read)
  useEffect(() => {
    const on = () => setRoute(read())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}
