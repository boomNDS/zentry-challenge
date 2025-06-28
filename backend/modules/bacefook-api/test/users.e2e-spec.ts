import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  const testUser = {
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    bio: 'Test bio',
  };

  const testUser2 = {
    email: 'test2@example.com',
    username: 'testuser2',
    firstName: 'Test2',
    lastName: 'User2',
    bio: 'Test bio 2',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    prismaService = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    // Clean up test data
    try {
      await prismaService.user.deleteMany({
        where: {
          email: {
            in: [testUser.email, testUser2.email],
          },
        },
      });
    } catch (error) {
      // Ignore cleanup errors
    }

    await app.close();
  });

  describe('/users (POST)', () => {
    it('should create a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(testUser.email);
      expect(response.body.username).toBe(testUser.username);
      expect(response.body.firstName).toBe(testUser.firstName);
      expect(response.body.lastName).toBe(testUser.lastName);
      expect(response.body.bio).toBe(testUser.bio);
    });

    it('should return 400 for invalid email', async () => {
      const invalidUser = { ...testUser, email: 'invalid-email' };

      await request(app.getHttpServer())
        .post('/users')
        .send(invalidUser)
        .expect(400);
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteUser = { email: 'test@example.com' };

      await request(app.getHttpServer())
        .post('/users')
        .send(incompleteUser)
        .expect(400);
    });

    it('should return 409 for duplicate email', async () => {
      // First create a user
      await request(app.getHttpServer())
        .post('/users')
        .send(testUser2)
        .expect(201);

      // Try to create another user with the same email
      await request(app.getHttpServer())
        .post('/users')
        .send(testUser2)
        .expect(409);
    });
  });

  describe('/users (GET)', () => {
    it('should return all users', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Check if response includes expected fields
      const user = response.body[0];
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('username');
      expect(user).toHaveProperty('firstName');
      expect(user).toHaveProperty('lastName');
      expect(user).toHaveProperty('_count');
    });
  });

  describe('/users/:id (GET)', () => {
    let userId: string;

    beforeAll(async () => {
      // Create a test user to get its ID
      const response = await request(app.getHttpServer()).post('/users').send({
        email: 'getuser@example.com',
        username: 'getuser',
        firstName: 'Get',
        lastName: 'User',
      });
      userId = response.body.id;
    });

    it('should return user by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(200);

      expect(response.body.id).toBe(userId);
      expect(response.body.email).toBe('getuser@example.com');
      expect(response.body.username).toBe('getuser');
      expect(response.body).toHaveProperty('_count');
      expect(response.body).toHaveProperty('posts');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = 'clx1234567890abcdef';

      await request(app.getHttpServer()).get(`/users/${fakeId}`).expect(404);
    });
  });

  describe('/users/:id (PATCH)', () => {
    let userId: string;

    beforeAll(async () => {
      // Create a test user to update
      const response = await request(app.getHttpServer()).post('/users').send({
        email: 'updateuser@example.com',
        username: 'updateuser',
        firstName: 'Update',
        lastName: 'User',
      });
      userId = response.body.id;
    });

    it('should update user successfully', async () => {
      const updateData = {
        firstName: 'Updated',
        bio: 'Updated bio',
      };

      const response = await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.firstName).toBe(updateData.firstName);
      expect(response.body.bio).toBe(updateData.bio);
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = 'clx1234567890abcdef';

      await request(app.getHttpServer())
        .patch(`/users/${fakeId}`)
        .send({ firstName: 'Updated' })
        .expect(404);
    });
  });

  describe('/users/:id (DELETE)', () => {
    let userId: string;

    beforeAll(async () => {
      // Create a test user to delete
      const response = await request(app.getHttpServer()).post('/users').send({
        email: 'deleteuser@example.com',
        username: 'deleteuser',
        firstName: 'Delete',
        lastName: 'User',
      });
      userId = response.body.id;
    });

    it('should delete user successfully', async () => {
      await request(app.getHttpServer()).delete(`/users/${userId}`).expect(204);
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = 'clx1234567890abcdef';

      await request(app.getHttpServer()).delete(`/users/${fakeId}`).expect(404);
    });
  });
});
