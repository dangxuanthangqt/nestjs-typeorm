import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { ValidateException } from './shared/exceptions/validate.exception';
import { transformValidateObject } from './shared/utilities/app.utils';
import { ExternalServiceExceptionFilter } from './shared/filters/external-service.exeption.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Tự động loại bỏ các trường không được khai báo decorator trong DTO
      forbidNonWhitelisted: true, // Tự động trả về lỗi nếu có trường không được khai decorator báo trong DTO
      transform: true, // Tự động chuyển đổi các đối tượng JSON thành các instanced DTO.
      // transformOptions: {
      //   enableImplicitConversion: true,
      // },
      errorHttpStatusCode: HttpStatus.BAD_REQUEST,
      exceptionFactory: (errors) => {
        const transformedErrors = transformValidateObject(errors);

        return new ValidateException(transformedErrors);
      },
    }),
  );

  app.useGlobalFilters(new ExternalServiceExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
