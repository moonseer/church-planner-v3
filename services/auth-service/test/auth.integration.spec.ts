import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserRole } from '../src/users/enums/user-role.enum';
import { Connection, Repository } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('AuthController (Integration)', () => {
  let app: INestApplication;
  let connection: Connection;
  let userRepository: Repository<User>;
  let jwtToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }));
    
    connection = moduleFixture.get<Connection>(Connection);
    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    
    await app.init();
  });

  afterAll(async () => {
    await connection.close();
    await app.close();
  });

  beforeEach(async () => {
    // Clear the users table before each test
    await userRepository.clear();
  });

  describe('Authentication', () => {
    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.firstName).toBe('Test');
      expect(response.body.user.lastName).toBe('User');
      expect(response.body.user.role).toBe(UserRole.MEMBER);

      // Save token and user ID for later tests
      jwtToken = response.body.accessToken;
      userId = response.body.user.id;
    });

    it('should not register with invalid data', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: '123',
          firstName: 'T',
        })
        .expect(400);
    });

    it('should not register with existing email', async () => {
      // First create a user
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(201);

      // Try to create another user with the same email
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password456',
          firstName: 'Another',
          lastName: 'User',
        })
        .expect(401); // UnauthorizedException
    });

    it('should login with valid credentials', async () => {
      // First create a user
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'login-test@example.com',
          password: 'password123',
          firstName: 'Login',
          lastName: 'Test',
        })
        .expect(201);

      // Login with that user
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'login-test@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user.email).toBe('login-test@example.com');
    });

    it('should not login with invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'login-test@example.com',
          password: 'wrong-password',
        })
        .expect(401);
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body.id).toBe(userId);
      expect(response.body.email).toBe('test@example.com');
    });

    it('should not get profile without token', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/profile')
        .expect(401);
    });

    it('should refresh token with valid token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh-token')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(typeof response.body.accessToken).toBe('string');
    });
  });

  describe('Users API', () => {
    let adminToken: string;

    beforeEach(async () => {
      // Create an admin user
      const admin = userRepository.create({
        email: 'admin@example.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
        roles: [UserRole.ADMIN],
      });
      
      await userRepository.save(admin);

      // Login as admin to get token
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'password123',
        });

      adminToken = response.body.accessToken;
    });

    it('should get all users as admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should not get all users as regular user', async () => {
      await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(403);
    });

    it('should get user by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body.id).toBe(userId);
    });

    it('should update user profile', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name',
        })
        .expect(200);

      expect(response.body.firstName).toBe('Updated');
      expect(response.body.lastName).toBe('Name');
    });

    it('should not delete user as regular user', async () => {
      await request(app.getHttpServer())
        .delete(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(403);
    });

    it('should delete user as admin', async () => {
      await request(app.getHttpServer())
        .delete(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      // Verify user is deleted
      await request(app.getHttpServer())
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
}); 