import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";

const OwnerRoute = () => {
  const { configured, loading, session, isOwner } = useAuth();
  const location = useLocation();

  if (loading) return <main className="min-h-screen bg-background" aria-busy="true" />;
  if (!configured) return <Navigate to="/account" replace state={{ from: location.pathname }} />;
  if (!session) return <Navigate to="/account" replace state={{ from: location.pathname }} />;
  if (!isOwner) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
        <Card className="w-full max-w-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Owner access required</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            This page is restricted to the project owner. Your signed-in account does not have the server-assigned owner role.
          </p>
          <Button asChild className="mt-6"><Link to="/account">Account</Link></Button>
        </Card>
      </main>
    );
  }

  return <Outlet />;
};

export default OwnerRoute;
