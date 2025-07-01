//frontend\src
import { useEffect, type JSX } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { selectAuth } from "./features/auth/authSlice";
import { fetchUserData } from "./features/auth/authThunks";
// import { AppDispatch } from "./store";

import { useAppDispatch, useAppSelector } from "./hooks/redux";

import SignIn from "./pages/SignIn";
import Home from "./pages/Home";
import UsernameDialog from "@/components/dialog/UsernameDialog";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAppSelector(selectAuth);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" />;
  }
  return children;
};

const App = () => {
  const { isAuthenticated, user, isLoading } = useAppSelector(selectAuth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchUserData());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      {isAuthenticated && user && !user?.username && <UsernameDialog />}
      <Routes>
        <Route
          path="/signin"
          element={isAuthenticated ? <Navigate to="/" /> : <SignIn />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
