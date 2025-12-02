import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setShowAlert(true);
      const timer = setTimeout(() => {
        navigate("/login", { replace: true });
      }, 3000); // Redirect after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "50vh" }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        {showAlert && (
          <div className="fixed inset-0 bg-opacity-40 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-gray-200 rounded-2xl shadow-xl p-8 w-full max-w-md text-center pointer-events-auto">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Login Required
              </h2>
              <p className="text-gray-600 mb-6">
                You must be logged in to use this feature.
              </p>
              <button
                onClick={() => navigate("/login", { replace: true })}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Go to Login
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return children;
}
