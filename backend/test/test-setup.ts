import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

let app: INestApplication;

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  
  // Apply the same configuration as main.ts
  app.setGlobalPrefix('api/v1');
  
  await app.init();
});

afterAll(async () => {
  await app.close();
});

export { app };
