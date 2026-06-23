import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";

import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/lib/store";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { isAuthenticated, isReady } = useAuth();

  if (!isReady) {
    return <div className="min-h-screen bg-background" />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/welcome" />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}