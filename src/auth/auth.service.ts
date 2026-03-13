import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findForAuth(dto.username);
    if (!user || !this.usersService.verifyPassword(dto.password, user.passwordHash)) {
      throw new UnauthorizedException('Credenciais invalidas');
    }

    const expiresIn = Number(process.env.AUTH_TOKEN_EXPIRES_IN_SECONDS ?? 60 * 60 * 12);

    const token = await this.jwtService.signAsync(
      {
        sub: user.id,
        username: user.username,
      },
      {
        secret: process.env.JWT_SECRET ?? 'change-me',
        expiresIn,
      },
    );

    return { token, expiresIn, user: { id: user.id, name: user.name, username: user.username } };
  }
}
