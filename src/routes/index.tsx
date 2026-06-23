import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/store";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { isAuthenticated, isReady } = useAuth();
  if (!isReady) {
    return <div className="min-h-screen hero-gradient" />;
  }
  return <Navigate to={isAuthenticated ? "/dashboard" : "/welcome"} />;
}