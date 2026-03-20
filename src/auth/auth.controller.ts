import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser, type AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { AUTH_COOKIE_NAME, buildAuthCookieOptions } from './auth-cookie';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Realiza login e define cookie de sessao' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ schema: { example: { ok: true } } })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { token, expiresIn, user } = await this.authService.login(dto);

    res.cookie(AUTH_COOKIE_NAME, token, buildAuthCookieOptions(expiresIn * 1000));

    return { ok: true, user };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Limpa cookie de autenticacao' })
  @ApiOkResponse({ schema: { example: { ok: true } } })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(AUTH_COOKIE_NAME, buildAuthCookieOptions());
    return { ok: true };
  }

  @Get('me')
  @ApiOperation({ summary: 'Valida sessao atual' })
  @ApiOkResponse({ schema: { example: { ok: true, user: { id: 'uuid', username: 'admin', role: 'MASTER' } } } })
  me(@CurrentUser() user: AuthenticatedUser) {
    return {
      ok: true,
      user: {
        id: user.sub,
        username: user.username,
        role: user.role,
      },
    };
  }
}
