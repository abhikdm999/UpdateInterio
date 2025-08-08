// Mock authentication storage and validation
interface StoredUser {
  id: string;
  email: string;
  password: string; // In real app, this would be hashed
  fullName: string;
  mobileNumber?: string;
  avatar?: string;
  createdAt: string;
}

const USERS_STORAGE_KEY = 'interoo_users';
const CURRENT_USER_KEY = 'interoo_current_user';

export class MockAuthService {
  // Get all stored users
  private static getStoredUsers(): StoredUser[] {
    try {
      const users = localStorage.getItem(USERS_STORAGE_KEY);
      return users ? JSON.parse(users) : [];
    } catch {
      return [];
    }
  }

  // Save users to storage
  private static saveUsers(users: StoredUser[]): void {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Failed to save users:', error);
    }
  }

  // Register a new user
  static async register(email: string, password: string, fullName: string, mobileNumber?: string): Promise<StoredUser> {
    const users = this.getStoredUsers();
    
    // Check if user already exists
    const existingUser = users.find(user => user.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const newUser: StoredUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      email: email.toLowerCase(),
      password, // In real app, this would be hashed
      fullName,
      mobileNumber,
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100',
      createdAt: new Date().toISOString(),
    };

    // Save user
    users.push(newUser);
    this.saveUsers(users);

    // Auto-login after registration
    this.setCurrentUser(newUser);

    return newUser;
  }

  // Login user
  static async login(email: string, password: string): Promise<StoredUser> {
    const users = this.getStoredUsers();
    
    // Find user by email
    const user = users.find(user => 
      user.email.toLowerCase() === email.toLowerCase() && 
      user.password === password
    );

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Set as current user
    this.setCurrentUser(user);

    return user;
  }

  // Set current user
  private static setCurrentUser(user: StoredUser): void {
    try {
      const userForStorage = {
        id: user.id,
        email: user.email,
        name: user.fullName,
        avatar: user.avatar,
        mobileNumber: user.mobileNumber,
      };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userForStorage));
    } catch (error) {
      console.error('Failed to save current user:', error);
    }
  }

  // Get current user
  static getCurrentUser(): any | null {
    try {
      const user = localStorage.getItem(CURRENT_USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  // Logout user
  static logout(): void {
    try {
      localStorage.removeItem(CURRENT_USER_KEY);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  }

  // Check if user exists
  static userExists(email: string): boolean {
    const users = this.getStoredUsers();
    return users.some(user => user.email.toLowerCase() === email.toLowerCase());
  }
}