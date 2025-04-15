import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Suspense, lazy, useContext } from "react";
import { AuthProvider } from "./context/AuthContext";
import { PasswordProvider } from "./context/PasswordContext";
import { TestimonialProvider } from "./context/TestimonialContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingSpinner from "./components/LoadingSpinner";
import { AuthContext } from "./context/AuthContext";
import "./App.css";

// Lazy-loaded components
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Testimonials = lazy(() => import("./pages/Testimonials"));

function AppRoutes() {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <Register />
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <AuthProvider>
      <PasswordProvider>
        <TestimonialProvider>
          <Router>
            <div className="app-container">
              <Navbar />
              <main className="main-content">
                <AppRoutes />
              </main>
            </div>
          </Router>
        </TestimonialProvider>
      </PasswordProvider>
    </AuthProvider>
  );
}

export default App;
