// Password yang diizinkan (dalam praktik nyata, ini seharusnya di backend)
const ALLOWED_PASSWORDS = [
  'veo2024', // Password default
  'admin123', // Password alternatif
  'password', // Password sederhana untuk testing
];

// Key untuk localStorage
const AUTH_KEY = 'veo_auth_token';
const AUTH_TIMESTAMP = 'veo_auth_timestamp';

// Durasi session dalam milidetik (24 jam)
const SESSION_DURATION = 24 * 60 * 60 * 1000;

export interface AuthResult {
  success: boolean;
  message: string;
  token?: string;
}

export const authenticateUser = (password: string): AuthResult => {
  // Simulasi delay untuk keamanan
  const isValidPassword = ALLOWED_PASSWORDS.includes(password);
  
  if (isValidPassword) {
    // Generate simple token (dalam praktik nyata, gunakan JWT)
    const token = btoa(`veo_auth_${Date.now()}_${Math.random()}`);
    
    // Simpan ke localStorage
    localStorage.setItem(AUTH_KEY, token);
    localStorage.setItem(AUTH_TIMESTAMP, Date.now().toString());
    
    return {
      success: true,
      message: 'Login berhasil!',
      token
    };
  } else {
    return {
      success: false,
      message: 'Password salah!'
    };
  }
};

export const checkAuthStatus = (): boolean => {
  const token = localStorage.getItem(AUTH_KEY);
  const timestamp = localStorage.getItem(AUTH_TIMESTAMP);
  
  if (!token || !timestamp) {
    return false;
  }
  
  const currentTime = Date.now();
  const authTime = parseInt(timestamp);
  
  // Cek apakah session masih valid
  if (currentTime - authTime > SESSION_DURATION) {
    // Session expired, hapus data
    logout();
    return false;
  }
  
  return true;
};

export const logout = (): void => {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(AUTH_TIMESTAMP);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(AUTH_KEY);
};

// Rate limiting untuk mencegah brute force
const LOGIN_ATTEMPTS_KEY = 'veo_login_attempts';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 menit

export const checkRateLimit = (): boolean => {
  const attempts = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
  
  if (!attempts) {
    return true;
  }
  
  const { count, timestamp } = JSON.parse(attempts);
  const currentTime = Date.now();
  
  // Reset jika sudah melewati lockout duration
  if (currentTime - timestamp > LOCKOUT_DURATION) {
    localStorage.removeItem(LOGIN_ATTEMPTS_KEY);
    return true;
  }
  
  return count < MAX_ATTEMPTS;
};

export const recordLoginAttempt = (success: boolean): void => {
  if (success) {
    // Reset attempts jika login berhasil
    localStorage.removeItem(LOGIN_ATTEMPTS_KEY);
    return;
  }
  
  const attempts = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
  const currentTime = Date.now();
  
  if (!attempts) {
    localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify({
      count: 1,
      timestamp: currentTime
    }));
  } else {
    const { count } = JSON.parse(attempts);
    localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify({
      count: count + 1,
      timestamp: currentTime
    }));
  }
};

export const getRemainingAttempts = (): number => {
  const attempts = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
  
  if (!attempts) {
    return MAX_ATTEMPTS;
  }
  
  const { count, timestamp } = JSON.parse(attempts);
  const currentTime = Date.now();
  
  if (currentTime - timestamp > LOCKOUT_DURATION) {
    return MAX_ATTEMPTS;
  }
  
  return Math.max(0, MAX_ATTEMPTS - count);
};
