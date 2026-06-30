import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  // NÂNG CẤP: Chuyển sang NestExpressApplication để phục vụ file tĩnh
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Cấu hình Swagger
  const config = new DocumentBuilder()
    .setTitle('Pharmova API')
    .setDescription('Tài liệu API cho Hệ thống Quản lý Nhà thuốc Pharmova')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Cho phép Frontend gọi API mà không bị lỗi CORS
  app.enableCors();

  // NÂNG CẤP QUAN TRỌNG: Mở cổng thư mục uploads để Web lấy được ảnh
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  await app.listen(8080);
}
bootstrap();