import { useEffect, useState } from "react";
import useApi, { ApiResponse } from "@/utils/useApi";

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
}
// Global cache for user data to avoid refetching on navigation
let cachedUser: User | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useCurrentUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [errorUser, setErrorUser] = useState<string | null>(null);

  const { fetchApi } = useApi({
    url: "/api/currentuser",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    let isMounted = true;

    const getToken = () => {
      return localStorage.getItem("token") || sessionStorage.getItem("token");
    };

    const hasToken = getToken();
    const isCacheValid = cachedUser && Date.now() - cacheTimestamp < CACHE_DURATION;

    if (isCacheValid && cachedUser) {
      setUser(cachedUser);
      setLoadingUser(false);
      return () => {
        isMounted = false;
      };
    }

    if (!hasToken) {
      setUser(null);
      setLoadingUser(false);
      return () => {
        isMounted = false;
      };
    }

    setLoadingUser(true);

    void (async () => {
      try {
        const res: ApiResponse & Record<string, unknown> = (await fetchApi()) as ApiResponse & Record<string, unknown>;

        if (!isMounted) return;

        if (res?.code === 200 && res?.data) {
          setUser(res.data as User);
          cachedUser = res.data as User;
          cacheTimestamp = Date.now();
        } else {
          setErrorUser((res?.message as string) || "Failed to fetch user");
        }
      } catch (err: unknown) {
        if (isMounted) {
          setErrorUser(err instanceof Error ? err.message : "Server error");
        }
      } finally {
        if (isMounted) setLoadingUser(false);
      }
    })();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { user, loadingUser, errorUser };
};
