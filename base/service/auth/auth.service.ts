import type { HttpService } from '~/service/http/http.service';
import { serviceComposableFactory } from '~/service/service-composable-factory';
import { httpService } from '~/service/http/http.service';
import type { users } from '~/types/collections/users';
import type { sessions } from '~/types/collections/sessions';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends AuthCredentials {
  name: string;
}

export interface AuthResponse {
  user: Partial<users>;
  session?: sessions;
}

export interface AuthError {
  message: string;
  code: string;
}

export class AuthService {
  constructor(private httpService: HttpService) {}

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Call the register endpoint directly
      const response = await this.httpService.post<users>('/api/auth/callback/credentials', {
        ...data,
        callbackUrl: '/',
        redirect: false
      })
      
      if (!response?.data) {
        throw new Error('Registration failed: No response data')
      }

      return { 
        user: response.data
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      throw {
        message: error.message || 'Registration failed',
        code: 'AUTH_ERROR'
      }
    }
  }
}

export const useAuthService = serviceComposableFactory<AuthService>('authService', () => {
  return new AuthService(httpService);
});
