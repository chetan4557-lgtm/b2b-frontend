import { Navigate, useLocation } from "react-router-dom";
import { useAppStore } from "../context/AppStore";

export default function RequireRole({ allow = [], children }) {
  const { currentUser } = useAppStore();
  const { pathname } = useLocation();

  if (!currentUser) return <Navigate to="/login" state={{ from: pathname }} replace />;
  if (allow.length && !allow.includes(currentUser.role)) return <div className="p-6">403 • Not allowed</div>;
  return children;
}
