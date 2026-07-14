import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { profileApi } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useSocket } from "@/context/SocketContext";

export default function ProtectedRoute() {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { connectUser } = useSocket();

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const response = await profileApi.getProfile();
        const userId = response.data?._id || response._id;
        setIsAuthenticated(true);
        if (userId) {
          connectUser(userId);
        }
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsValidating(false);
      }
    };

    verifyUser();
  }, [connectUser]);

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