"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const request = require("supertest");
const app_module_1 = require("../src/app.module");
const user_role_enum_1 = require("../src/users/enums/user-role.enum");
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../src/users/entities/user.entity");
const typeorm_2 = require("@nestjs/typeorm");
describe('AuthController (Integration)', () => {
    let app;
    let connection;
    let userRepository;
    let jwtToken;
    let userId;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }));
        connection = moduleFixture.get(typeorm_1.Connection);
        userRepository = moduleFixture.get((0, typeorm_2.getRepositoryToken)(user_entity_1.User));
        await app.init();
    });
    afterAll(async () => {
        await connection.close();
        await app.close();
    });
    beforeEach(async () => {
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
            expect(response.body.user.role).toBe(user_role_enum_1.UserRole.MEMBER);
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
            await request(app.getHttpServer())
                .post('/api/auth/register')
                .send({
                email: 'duplicate@example.com',
                password: 'password123',
                firstName: 'Test',
                lastName: 'User',
            })
                .expect(201);
            await request(app.getHttpServer())
                .post('/api/auth/register')
                .send({
                email: 'duplicate@example.com',
                password: 'password456',
                firstName: 'Another',
                lastName: 'User',
            })
                .expect(401);
        });
        it('should login with valid credentials', async () => {
            await request(app.getHttpServer())
                .post('/api/auth/register')
                .send({
                email: 'login-test@example.com',
                password: 'password123',
                firstName: 'Login',
                lastName: 'Test',
            })
                .expect(201);
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
        let adminToken;
        beforeEach(async () => {
            const admin = userRepository.create({
                email: 'admin@example.com',
                password: 'password123',
                firstName: 'Admin',
                lastName: 'User',
                roles: [user_role_enum_1.UserRole.ADMIN],
            });
            await userRepository.save(admin);
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
            await request(app.getHttpServer())
                .get(`/api/users/${userId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(404);
        });
    });
});
//# sourceMappingURL=auth.integration.spec.js.map