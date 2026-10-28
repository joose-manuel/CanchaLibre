import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'jugador@canchalibre.co' })
  @IsEmail({}, { message: 'El correo no es válido' })
  @MaxLength(180)
  email!: string;

  @ApiProperty({ minLength: 8, example: 'CanchaLibre123*' })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(72)
  password!: string;

  @ApiProperty({ example: 'Ana Jugadora' })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  fullName!: string;

  @ApiPropertyOptional({ example: '+57 300 123 4567' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ description: 'UUID de la ciudad seleccionada' })
  @IsOptional()
  @IsUUID('4', { message: 'La ciudad debe ser un UUID válido' })
  cityId?: string;
}
