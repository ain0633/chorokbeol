import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase, signIn, signUp, signOut, getCurrentUser, migrateLocalDataToSupabase, fetchUserPlants, fetchCareLogs, fetchDiaryEntries } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { UserPlant, CareLog, DiaryEntry, ChatMessage } from '@/types/database';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 초기 사용자 확인
    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser as User | null);
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    const result = await signIn(email, password);
    
    if (result.error) {
      setError(result.error);
      setIsLoading(false);
      return { success: false, error: result.error };
    }
    
    if (result.user) {
      // 로그인 성공 시 localStorage 데이터 마이그레이션
      await migrateUserData(result.user.id);
      setUser({ id: result.user.id, email: result.user.email, ...{} } as User);
    }
    
    setIsLoading(false);
    return { success: true };
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    const result = await signUp(email, password);
    
    if (result.error) {
      setError(result.error);
      setIsLoading(false);
      return { success: false, error: result.error };
    }
    
    if (result.user) {
      setUser({ id: result.user.id, email: result.user.email, ...{} } as User);
    }
    
    setIsLoading(false);
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    await signOut();
    setUser(null);
    setIsLoading(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const migrateUserData = async (userId: string) => {
    try {
      // localStorage에서 데이터 읽기
      const storedData = localStorage.getItem('chorokbyeol-store');
      if (!storedData) return;

      const parsedData = JSON.parse(storedData);
      
      // localStorage에 데이터가 있는지 확인
      const hasLocalData = parsedData?.state?.myPlants?.length > 0 ||
                          parsedData?.state?.chatMessages?.length > 0;
      
      if (!hasLocalData) return;

      // 마이그레이션 실행
      const localPlants: UserPlant[] = parsedData?.state?.myPlants || [];
      const localCareLogs: CareLog[] = parsedData?.state?.careLogs || [];
      const localDiaryEntries: DiaryEntry[] = parsedData?.state?.diaryEntries || [];
      const localChatMessages: ChatMessage[] = parsedData?.state?.chatMessages || [];

      const migrationResult = await migrateLocalDataToSupabase(userId, {
        myPlants: localPlants,
        careLogs: localCareLogs,
        diaryEntries: localDiaryEntries,
        chatMessages: localChatMessages,
      });

      if (migrationResult.success && migrationResult.migratedCount > 0) {
        console.log(`Successfully migrated ${migrationResult.migratedCount} items to Supabase`);
        
        // Supabase에서 데이터 다시 읽기
        const [plants, careLogs, diaryEntries] = await Promise.all([
          fetchUserPlants(userId),
          fetchCareLogs(userId),
          fetchDiaryEntries(userId),
        ]);

        // localStorage 업데이트
        const newState = {
          ...parsedData,
          state: {
            ...parsedData.state,
            myPlants: plants,
            careLogs: careLogs,
            diaryEntries: diaryEntries,
            // chatMessages는 별도 처리
          }
        };
        localStorage.setItem('chorokbyeol-store', JSON.stringify(newState));
      }
    } catch (err) {
      console.error('Migration failed:', err);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    login,
    signup,
    logout,
    clearError,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
