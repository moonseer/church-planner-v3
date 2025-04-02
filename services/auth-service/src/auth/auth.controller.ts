import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Get,
  Param,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody,
  ApiBearerAuth
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ 
    status: 201, 
    description: 'User has been registered successfully',
    schema: {
      properties: {
        message: { type: 'string' },
        userId: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Successfully logged in',
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Invalid credentials'
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Successfully retrieved profile'
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Unauthorized'
  })
  async getProfile(@CurrentUser() user) {
    return user;
  }

  @Post('verify/:token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email with token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Email has been verified successfully',
    schema: {
      properties: {
        message: { type: 'string' },
        userId: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Invalid verification token' })
  async verifyEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiBody({ schema: { properties: { email: { type: 'string' } } } })
  @ApiResponse({ 
    status: 200, 
    description: 'Password reset instructions sent to email',
    schema: {
      properties: {
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Email not found' })
  async forgotPassword(@Body('email') email: string) {
    return this.authService.requestPasswordReset(email);
  }

  @Post('reset-password/:token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiBody({ schema: { properties: { password: { type: 'string' } } } })
  @ApiResponse({ 
    status: 200, 
    description: 'Password has been reset successfully',
    schema: {
      properties: {
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Invalid or expired reset token' })
  async resetPassword(
    @Param('token') token: string,
    @Body('password') newPassword: string,
  ) {
    return this.authService.resetPassword(token, newPassword);
  }

  @Post('refresh-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh JWT token' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Token refreshed successfully'
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Unauthorized'
  })
  async refreshToken(@CurrentUser() user) {
    return this.authService.refreshToken(user.id);
  }
} 