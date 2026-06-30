import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cấu hình Swagger
  const config = new DocumentBuilder()
    .setTitle('Pharmova API')
    .setDescription('Tài liệu API cho Hệ thống Quản lý Nhà thuốc Pharmova')
    .setVersion('1.0')
    .addBearerAuth() // Thêm nút điền Token JWT sau này
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // Đường dẫn truy cập Swagger

  // Cho phép Frontend gọi API mà không bị lỗi CORS
  app.enableCors();

  await app.listen(8080);
}
bootstrap();