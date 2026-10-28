import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app/app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const port = config.get<number>('port', 3000);
  const corsOrigins = config.get<string[]>('corsOrigins', []);

  app.setGlobalPrefix('api');
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.use(compression());
  app.enableCors({
    origin: corsOrigins.length ? corsOrigins : true,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('CanchaLibre API')
    .setDescription(
      'API de reserva de canchas deportivas: autenticación, sedes, espacios, partidos, reservas, pagos y modo propietario.',
    )
    .setVersion('0.1.0')
    .addBearerAuth()
    .addTag('auth', 'Registro, sesión y perfil autenticado')
    .addTag('venues', 'Sedes y políticas')
    .addTag('spaces', 'Espacios, horarios, bloqueos y disponibilidad')
    .addTag('matches', 'Partidos y cupos')
    .addTag('bookings', 'Reservas y QR de check-in')
    .addTag('payments', 'Anticipos y webhook sandbox')
    .addTag('owner', 'Agenda, reservas y finanzas del propietario')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(port);

  Logger.log(`API disponible en http://localhost:${port}/api`, 'Bootstrap');
  Logger.log(`Swagger disponible en http://localhost:${port}/api/docs`, 'Bootstrap');
}

bootstrap().catch((error: unknown) => {
  Logger.error('No fue posible iniciar la API', error instanceof Error ? error.stack : String(error));
  process.exit(1);
});
