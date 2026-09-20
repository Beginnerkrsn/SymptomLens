import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom'

import { useAuth } from '../context/useAuth'

export default function ProtectedRoute() {
  const {
    isAuthenticated,
    isLoading,
  } = useAuth()

  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3f7f4] px-6">
        <div className="w-full max-w-sm rounded-[2rem] border border-[#dce8df] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#edf5ef]">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#d9e5dc] border-t-[#39735c]" />
          </div>

          <h1 className="heading mt-5 text-xl font-bold text-[#173d32]">
            Restoring your session
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#71847a]">
            Please wait while SymptomLens checks your account.
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname +
            location.search +
            location.hash,
        }}
      />
    )
  }

  return <Outlet />
}