import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { login, signup, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMessage(null);

    if (!email || !password) {
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      return;
    }

    setIsSubmitting(true);

    if (mode === 'login') {
      const result = await login(email, password);
      if (result.success) {
        onClose();
        resetForm();
      }
    } else {
      const result = await signup(email, password);
      if (result.success) {
        setSuccessMessage('인증 이메일이 발송되었습니다. 이메일을 확인해주세요.');
        setMode('login');
      }
    }

    setIsSubmitting(false);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setSuccessMessage(null);
    clearError();
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    clearError();
    setSuccessMessage(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md glass rounded-2xl p-6 max-h-[85vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🌿</div>
            <h2 className="text-xl font-semibold text-foreground">
              {mode === 'login' ? '초록별 시작하기' : '초록별 회원가입'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === 'login' 
                ? '반려식물과 교감하세요' 
                : '나만의 반려식물 행성을 만들어보세요'}
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-lg bg-lime/20 border border-lime/30 text-sm text-lime"
            >
              {successMessage}
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
                  비밀번호 확인
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {password !== confirmPassword && confirmPassword && (
                  <p className="text-xs text-destructive mt-1">비밀번호가 일치하지 않습니다</p>
                )}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={isSubmitting || (mode === 'signup' && password !== confirmPassword)}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl bg-lime text-foreground font-medium hover:bg-lime/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="inline-block w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full"
                  />
                  처리 중...
                </span>
              ) : (
                mode === 'login' ? '로그인' : '회원가입'
              )}
            </motion.button>
          </form>

          {/* Switch Mode */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={switchMode}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {mode === 'login' 
                ? '계정이 없으신가요? 회원가입' 
                : '이미 계정이 있으신가요? 로그인'}
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
