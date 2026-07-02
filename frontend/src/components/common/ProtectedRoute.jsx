import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { profileApi } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute() {
  const token = localStorage.getItem("Token");
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const verifyUser = async () => {
      if (!token) {
        setIsAuthenticated(false);
        setIsValidating(false);
        return;
      }

      try {
        
        await profileApi.getProfile();
        
        setIsAuthenticated(true);
      } catch (error) {
        
        setIsAuthenticated(false);
      } finally {
        setIsValidating(false);
      }
    };

    verifyUser();
  }, [token]);

  if (isValidating) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  
  return <Outlet />;
}