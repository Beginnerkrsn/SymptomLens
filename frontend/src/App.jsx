import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import { useAuth } from './context/useAuth'

import Diagnosis from './pages/Diagnosis'
import Dashboard from './pages/Dashboard'
import ForgotPassword from './pages/ForgotPassword'
import History from './pages/History'
import HistoryDetail from './pages/HistoryDetail'
import Home from './pages/Home'
import Login from './pages/Login'
import MedicalAnalysis from './pages/MedicalAnalysis'
import MedicalHistory from './pages/MedicalHistory'
import MedicalHistoryDetail from './pages/MedicalHistoryDetail'
import PhysicianResults from './pages/PhysicianResults'
import Register from './pages/Register'
import ResetPassword from './pages/ResetPassword'
import Results from './pages/Results'
import XrayAnalysis from './pages/XrayAnalysis'

function SessionLoadingScreen() {
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

function ProtectedRoute({ children }) {
  const {
    isAuthenticated,
    isLoading,
  } = useAuth()

  if (isLoading) {
    return <SessionLoadingScreen />
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            window.location.pathname +
            window.location.search +
            window.location.hash,
        }}
      />
    )
  }

  return children
}

export default function App() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return <SessionLoadingScreen />
  }

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />

      {/* Protected */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/diagnosis"
        element={
          <ProtectedRoute>
            <Diagnosis />
          </ProtectedRoute>
        }
      />

      <Route
        path="/results"
        element={
          <ProtectedRoute>
            <Results />
          </ProtectedRoute>
        }
      />

      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />

      <Route
        path="/history/:predictionId"
        element={
          <ProtectedRoute>
            <HistoryDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/medical-analysis"
        element={
          <ProtectedRoute>
            <MedicalAnalysis />
          </ProtectedRoute>
        }
      />

      <Route
        path="/physician-results"
        element={
          <ProtectedRoute>
            <PhysicianResults />
          </ProtectedRoute>
        }
      />

      <Route
        path="/medical-history"
        element={
          <ProtectedRoute>
            <MedicalHistory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/medical-history/:reportId"
        element={
          <ProtectedRoute>
            <MedicalHistoryDetail />
          </ProtectedRoute>
        }
      />

      {/* Keep X-ray route intact for later */}
      <Route
        path="/xray-analysis"
        element={
          <ProtectedRoute>
            <XrayAnalysis />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  )
}