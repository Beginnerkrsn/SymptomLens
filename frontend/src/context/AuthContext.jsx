import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import api from '../services/api.js'
import { AuthContext } from './authContext'


function normalizeUser(userData) {
  if (!userData) {
    return null
  }

  return {
    ...userData,

    // Keep both names for compatibility with
    // existing frontend components.
    name:
      userData.name ||
      userData.full_name ||
      'User',

    full_name:
      userData.full_name ||
      userData.name ||
      'User',
  }
}


export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)


  const clearSession = useCallback(() => {
    localStorage.removeItem('user')
    localStorage.removeItem('access_token')

    setUser(null)
  }, [])


  const login = useCallback(
    (userData, token) => {
      if (!userData || !token) {
        clearSession()
        return
      }

      const normalizedUser =
        normalizeUser(userData)

      localStorage.setItem(
        'user',
        JSON.stringify(normalizedUser),
      )

      localStorage.setItem(
        'access_token',
        token,
      )

      setUser(normalizedUser)
    },
    [clearSession],
  )


  const logout = useCallback(() => {
    clearSession()
  }, [clearSession])


  useEffect(() => {
    let mounted = true


    async function restoreSession() {
      const token =
        localStorage.getItem(
          'access_token',
        )

      if (!token) {
        if (mounted) {
          setUser(null)
          setIsLoading(false)
        }

        return
      }


      try {
        const response = await api.get(
          '/auth/me',
        )

        if (!mounted) {
          return
        }

        const normalizedUser =
          normalizeUser(response.data)

        localStorage.setItem(
          'user',
          JSON.stringify(
            normalizedUser,
          ),
        )

        setUser(normalizedUser)
      } catch (error) {
        console.warn(
          'Unable to restore authentication session:',
          error,
        )

        if (mounted) {
          clearSession()
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }


    restoreSession()


    return () => {
      mounted = false
    }
  }, [clearSession])


  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
    }),
    [
      user,
      isLoading,
      login,
      logout,
    ],
  )


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}