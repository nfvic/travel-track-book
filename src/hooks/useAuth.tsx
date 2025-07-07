
import { useAuthContext } from "@/contexts/AuthContext";

// Simple hook to use auth state and helpers
const useAuth = () => {
  return useAuthContext();
};

export default useAuth;
