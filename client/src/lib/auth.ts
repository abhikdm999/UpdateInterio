import { z } from 'zod';

// =============================================
// TYPE DEFINITIONS
// =============================================
export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  address?: any;
  email_verified: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResult {
  user?: AuthUser;
  error?: { message: string };
}

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
}

// =============================================
// VALIDATION SCHEMAS
// =============================================
export class AuthValidation {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): {
    strength: 'weak' | 'medium' | 'strong';
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (password.length < 6) {
      errors.push('At least 6 characters required');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('At least one lowercase letter required');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('At least one uppercase letter required');
    }
    if (!/\d/.test(password)) {
      errors.push('At least one number required');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('At least one special character required');
    }

    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (errors.length === 0) {
      strength = 'strong';
    } else if (errors.length <= 2) {
      strength = 'medium';
    }

    return { strength, errors };
  }
}

// =============================================
// AUTHENTICATION SERVICE
// =============================================
export class AuthService {
  private static readonly STORAGE_KEY = 'interoo_auth_user';

  /**
   * Sign in with email and password
   */
  static async signIn(email: string, password: string, rememberMe?: boolean): Promise<AuthResult> {
    try {
      // Mock authentication for development
      if (email === 'test@example.com' && password === 'password123') {
        const mockUser: AuthUser = {
          id: 'test-user-id',
          email: email,
          full_name: 'Test User',
          avatar_url: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100',
          phone: '+1234567890',
          email_verified: true,
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Store user session
        if (rememberMe) {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mockUser));
        } else {
          sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(mockUser));
        }

        return { user: mockUser };
      }

      // For other emails, try to authenticate with stored users
      const storedUsers = this.getStoredUsers();
      const user = storedUsers.find(u => u.email === email && u.password === password);
      
      if (user) {
        const authUser: AuthUser = {
          id: user.id,
          email: user.email,
          full_name: user.fullName,
          avatar_url: user.avatar,
          phone: user.phone,
          email_verified: true,
          last_login: new Date().toISOString(),
          created_at: user.createdAt,
          updated_at: new Date().toISOString(),
        };

        // Store user session
        if (rememberMe) {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authUser));
        } else {
          sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(authUser));
        }

        return { user: authUser };
      }

      return { error: { message: 'Invalid email or password' } };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: { message: 'An unexpected error occurred during sign in' } };
    }
  }

  /**
   * Sign up with email and password
   */
  static async signUp(data: SignUpData): Promise<AuthResult> {
    try {
      // Check if user already exists
      const storedUsers = this.getStoredUsers();
      const existingUser = storedUsers.find(u => u.email === data.email);
      
      if (existingUser) {
        return { error: { message: 'User with this email already exists' } };
      }

      // Create new user
      const newUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        email: data.email,
        password: data.password, // In production, this would be hashed
        fullName: data.fullName || '',
        phone: data.phone || '',
        avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100',
        createdAt: new Date().toISOString(),
      };

      // Store user
      storedUsers.push(newUser);
      this.saveUsers(storedUsers);

      // Create auth user object
      const authUser: AuthUser = {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.fullName,
        avatar_url: newUser.avatar,
        phone: newUser.phone,
        email_verified: true,
        last_login: new Date().toISOString(),
        created_at: newUser.createdAt,
        updated_at: new Date().toISOString(),
      };

      // Auto-login after registration
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authUser));

      return { user: authUser };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: { message: 'An unexpected error occurred during registration' } };
    }
  }

  /**
   * Sign out
   */
  static async signOut(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Get current user
   */
  static getCurrentUser(): AuthUser | null {
    try {
      const user = localStorage.getItem(this.STORAGE_KEY) || sessionStorage.getItem(this.STORAGE_KEY);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(updates: Partial<AuthUser>): Promise<AuthResult> {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        return { error: { message: 'No user signed in' } };
      }

      const updatedUser = { ...currentUser, ...updates, updated_at: new Date().toISOString() };
      
      // Update stored user data
      const storedUsers = this.getStoredUsers();
      const userIndex = storedUsers.findIndex(u => u.id === currentUser.id);
      if (userIndex !== -1) {
        storedUsers[userIndex] = {
          ...storedUsers[userIndex],
          fullName: updates.full_name || storedUsers[userIndex].fullName,
          phone: updates.phone || storedUsers[userIndex].phone,
        };
        this.saveUsers(storedUsers);
      }

      // Update session
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedUser));

      return { user: updatedUser };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error: { message: 'Failed to update profile' } };
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string): Promise<{ error?: { message: string } }> {
    try {
      // Mock password reset
      console.log('Password reset requested for:', email);
      return {};
    } catch (error) {
      return { error: { message: 'Failed to send password reset email' } };
    }
  }

  // =============================================
  // PRIVATE HELPER METHODS
  // =============================================
  private static getStoredUsers(): any[] {
    try {
      const users = localStorage.getItem('interoo_users');
      return users ? JSON.parse(users) : [];
    } catch {
      return [];
    }
  }

  private static saveUsers(users: any[]): void {
    try {
      localStorage.setItem('interoo_users', JSON.stringify(users));
    } catch (error) {
      console.error('Failed to save users:', error);
    }
  }
}

// =============================================
// SESSION MANAGEMENT
// =============================================
export class SessionManager {
  private static readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes

  static getSessionExpiry(): Date | null {
    const user = AuthService.getCurrentUser();
    if (!user || !user.last_login) return null;
    
    return new Date(new Date(user.last_login).getTime() + this.SESSION_DURATION);
  }

  static isSessionExpiring(): boolean {
    const expiry = this.getSessionExpiry();
    if (!expiry) return false;
    
    const timeUntilExpiry = expiry.getTime() - Date.now();
    return timeUntilExpiry <= this.REFRESH_THRESHOLD;
  }

  static async refreshSession(): Promise<void> {
    const user = AuthService.getCurrentUser();
    if (user) {
      const updatedUser = { ...user, last_login: new Date().toISOString() };
      localStorage.setItem(AuthService['STORAGE_KEY'], JSON.stringify(updatedUser));
    }
  }
}