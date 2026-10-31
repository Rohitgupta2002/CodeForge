import { Routes, Route, Navigate } from "react-router";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Homepage from "./pages/Homepage";
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from "./authSlice";
import { useEffect, useState } from "react";
import AdminPanel from "./components/AdminPanel";
import ProblemPage from "./pages/ProblemPage";
import Admin from "./pages/Admin";
import AdminVideo from "./components/AdminVideo";
import AdminDelete from "./components/AdminDelete";
import AdminUpload from "./components/AdminUpload";
import LoadingState from "./components/ui/LoadingState";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [initializing, setInitializing] = useState(true);

  // Check initial authentication
  useEffect(() => {
    const timeout = setTimeout(() => setInitializing(false), 5000);
    dispatch(checkAuth()).finally(() => {
      clearTimeout(timeout);
      setInitializing(false);
    });
    return () => clearTimeout(timeout);
  }, [dispatch]);

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <LoadingState label="Checking your session..." />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <Homepage /> : <Navigate to="/signup" />}
      />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" /> : <Login />}
      />
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to="/" /> : <Signup />}
      />
      <Route
        path="/admin"
        element={isAuthenticated && user?.role === 'admin' ? <Admin /> : <Navigate to="/" />}
      />
      <Route
        path="/admin/create"
        element={isAuthenticated && user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />}
      />
      <Route
        path="/admin/edit/:problemId"
        element={isAuthenticated && user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />}
      />
      <Route
        path="/admin/delete"
        element={isAuthenticated && user?.role === 'admin' ? <AdminDelete /> : <Navigate to="/" />}
      />
      <Route
        path="/admin/video"
        element={isAuthenticated && user?.role === 'admin' ? <AdminVideo /> : <Navigate to="/" />}
      />
      <Route
        path="/admin/upload/:problemId"
        element={isAuthenticated && user?.role === 'admin' ? <AdminUpload /> : <Navigate to="/" />}
      />
      <Route path="/problem/:problemId" element={<ProblemPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
