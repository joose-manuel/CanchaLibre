import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'jugador@canchalibre.co' })
  @IsEmail({}, { message: 'El correo no es válido' })
  @MaxLength(180)
  email!: string;

  @ApiProperty({ example: 'CanchaLibre123*' })
  @IsString()
  @MaxLength(72)
  password!: string;
}
