import { Body, Controller, Get, Post, Query, Res, UseGuards } from "@nestjs/common";
import type { Response } from "express";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Public } from "../common/decorators/public.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AuthenticatedUser } from "../common/types/request-user.type";
import { AuthService } from "./auth.service";
import { GoogleAuthDto } from "./dto/google-auth.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { RegisterDto } from "./dto/register.dto";
import { SocialExchangeDto } from "./dto/social-exchange.dto";

@UseGuards(JwtAuthGuard)
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post("google")
  google(@Body() dto: GoogleAuthDto) {
    return this.authService.google(dto);
  }

  @Public()
  @Get("providers")
  providers() {
    return this.authService.availableProviders();
  }

  @Public()
  @Get("line/start")
  lineStart(
    @Query("returnTo") returnTo: string | undefined,
    @Query("role") role: string | undefined,
    @Res() response: Response,
  ) {
    response.redirect(this.authService.socialAuthorizationUrl("line", returnTo, role));
  }

  @Public()
  @Get("facebook/start")
  facebookStart(
    @Query("returnTo") returnTo: string | undefined,
    @Query("role") role: string | undefined,
    @Res() response: Response,
  ) {
    response.redirect(this.authService.socialAuthorizationUrl("facebook", returnTo, role));
  }

  @Public()
  @Get("line/callback")
  async lineCallback(
    @Query("code") code: string | undefined,
    @Query("state") state: string | undefined,
    @Res() response: Response,
  ) {
    try {
      response.redirect(await this.authService.socialCallback("line", code ?? "", state ?? ""));
    } catch {
      response.redirect(this.authService.socialFailureUrl("LINE sign-in was cancelled or could not be completed."));
    }
  }

  @Public()
  @Get("facebook/callback")
  async facebookCallback(
    @Query("code") code: string | undefined,
    @Query("state") state: string | undefined,
    @Res() response: Response,
  ) {
    try {
      response.redirect(await this.authService.socialCallback("facebook", code ?? "", state ?? ""));
    } catch {
      response.redirect(this.authService.socialFailureUrl("Facebook sign-in was cancelled or could not be completed."));
    }
  }

  @Public()
  @Post("social/exchange")
  socialExchange(@Body() dto: SocialExchangeDto) {
    return this.authService.exchangeSocialHandoff(dto.token);
  }

  @Public()
  @Post("refresh")
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @Post("logout")
  logout(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.logout(user.id);
  }

  @Get("me")
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.me(user.id);
  }
}
