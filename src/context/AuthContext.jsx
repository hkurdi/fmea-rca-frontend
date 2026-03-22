import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/auth';
import { casesApi } from '../api/cases';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCourses = useCallback(async () => {
    try {
      const res = await casesApi.getAllCourses();
      const fetched = res?.data || [];
      setCourses(fetched);
      if (fetched.length === 1) setCourseId(fetched[0].id);
    } catch {
      setCourses([]);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      authApi
        .me()
        .then((res) => {
          setUser(res.data);
          return loadCourses();
        })
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [loadCourses]);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login(email, password);
    localStorage.setItem('access_token', res.data.access_token);
    localStorage.setItem('refresh_token', res.data.refresh_token);
    const me = await authApi.me();
    setUser(me.data);
    await loadCourses();
    return me.data;
  }, [loadCourses]);

  const register = useCallback(async (data) => {
    await authApi.register(data);
    return login(data.email, data.password);
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setCourses([]);
    setCourseId(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, courses, courseId, setCourseId, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}