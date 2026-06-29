import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { AuthProvider, User, UserRole } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { createHash, createHmac, randomBytes } from "node:crypto";
import { OAuth2Client } from "google-auth-library";
import { UsersRepository } from "../users/users.repository";
import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";
import { GoogleAuthDto } from "./dto/google-auth.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { RegisterDto } from "./dto/register.dto";

type RedirectProvider = "line" | "facebook";

interface OAuthState {
  kind: "social-oauth";
  provider: RedirectProvider;
  returnTo: string;
  role: UserRole;
  nonce: string;
}

interface SocialProfile {
  provider: AuthProvider;
  providerAccountId: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
}

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
    private readonly usersService: UsersService,
  ) {
    this.googleClient = new OAuth2Client(
      this.config.get<string>("GOOGLE_CLIENT_ID"),
    );
  }

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();
    const existing = await this.usersRepository.findByEmail(email);
    if (existing) {
      throw new ConflictException("Email is already registered");
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersRepository.create({
      email,
      passwordHash,
      displayName: dto.displayName,
      role: dto.role ?? UserRole.REPORTER,
    });
    const tokens = await this.issueTokens(user);

    return {
      user: this.usersService.toSafeUser(user),
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findByEmail(dto.email);
    if (!user?.passwordHash) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const tokens = await this.issueTokens(user);
    return {
      user: this.usersService.toSafeUser(user),
      ...tokens,
    };
  }

  async google(dto: GoogleAuthDto) {
    const clientId = this.config.get<string>("GOOGLE_CLIENT_ID");
    if (!clientId) {
      throw new UnauthorizedException("Google sign-in is not configured");
    }

    let payload;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: dto.credential,
        audience: clientId,
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException("Google account could not be verified");
    }

    if (!payload?.sub || !payload.email || !payload.email_verified) {
      throw new UnauthorizedException("Google account could not be verified");
    }

    const existingAccount = await this.usersRepository.findByAuthAccount(
      AuthProvider.GOOGLE,
      payload.sub,
    );
    let user: User | null | undefined = existingAccount?.user;

    if (!user) {
      const email = payload.email.toLowerCase();
      user = await this.usersRepository.findByEmail(email);

      if (user) {
        user = await this.usersRepository.linkAuthAccount({
          userId: user.id,
          provider: AuthProvider.GOOGLE,
          providerAccountId: payload.sub,
          avatarUrl: user.avatarUrl ?? payload.picture,
        });
      } else {
        user = await this.usersRepository.create({
          email,
          displayName: payload.name?.trim() || email.split("@")[0],
          avatarUrl: payload.picture,
          role: dto.role ?? UserRole.REPORTER,
          authAccounts: {
            create: {
              provider: AuthProvider.GOOGLE,
              providerAccountId: payload.sub,
            },
          },
        });
      }
    }

    const tokens = await this.issueTokens(user);
    return {
      user: this.usersService.toSafeUser(user),
      ...tokens,
    };
  }

  availableProviders() {
    return {
      google: Boolean(this.config.get<string>("GOOGLE_CLIENT_ID")),
      line: Boolean(
        this.config.get<string>("LINE_CHANNEL_ID") &&
        this.config.get<string>("LINE_CHANNEL_SECRET"),
      ),
      facebook: Boolean(
        this.config.get<string>("FACEBOOK_APP_ID") &&
        this.config.get<string>("FACEBOOK_APP_SECRET"),
      ),
    };
  }

  socialAuthorizationUrl(
    provider: RedirectProvider,
    returnTo?: string,
    requestedRole?: string,
  ) {
    const role = this.socialRole(requestedRole);
    const nonce = randomBytes(24).toString("base64url");
    const state = this.jwtService.sign(
      {
        kind: "social-oauth",
        provider,
        returnTo: this.safeReturnTo(returnTo),
        role,
        nonce,
      } satisfies OAuthState,
      {
        secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
        expiresIn: "10m",
      },
    );

    if (provider === "line") {
      const clientId = this.config.get<string>("LINE_CHANNEL_ID");
      if (!clientId || !this.config.get<string>("LINE_CHANNEL_SECRET")) {
        throw new UnauthorizedException("LINE Login is not configured");
      }
      const query = new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        redirect_uri: this.providerCallbackUrl("line"),
        state,
        scope: "openid profile",
        nonce,
      });
      return `https://access.line.me/oauth2/v2.1/authorize?${query}`;
    }

    const appId = this.config.get<string>("FACEBOOK_APP_ID");
    if (!appId || !this.config.get<string>("FACEBOOK_APP_SECRET")) {
      throw new UnauthorizedException("Facebook Login is not configured");
    }
    const query = new URLSearchParams({
      client_id: appId,
      redirect_uri: this.providerCallbackUrl("facebook"),
      state,
      scope: "public_profile,email",
      response_type: "code",
    });
    return `${this.facebookBaseUrl("www")}/dialog/oauth?${query}`;
  }

  async socialCallback(provider: RedirectProvider, code: string, stateToken: string) {
    if (!code || !stateToken) {
      throw new UnauthorizedException("Social sign-in was cancelled or incomplete");
    }

    let state: OAuthState;
    try {
      state = await this.jwtService.verifyAsync<OAuthState>(stateToken, {
        secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
      });
    } catch {
      throw new UnauthorizedException("Social sign-in state is invalid or expired");
    }
    if (state.kind !== "social-oauth" || state.provider !== provider) {
      throw new UnauthorizedException("Social sign-in provider does not match");
    }

    const profile = provider === "line"
      ? await this.exchangeLineCode(code, state.nonce)
      : await this.exchangeFacebookCode(code);
    const user = await this.upsertSocialUser(profile, state.role);
    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");

    await this.usersRepository.createAuthHandoff({
      userId: user.id,
      tokenHash,
      returnTo: state.returnTo,
      expiresAt: new Date(Date.now() + 2 * 60 * 1000),
    });

    const callback = new URL("/auth/social-callback", this.webAppUrl());
    callback.searchParams.set("token", token);
    return callback.toString();
  }

  async exchangeSocialHandoff(token: string) {
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const handoff = await this.usersRepository.consumeAuthHandoff(tokenHash);
    if (!handoff) {
      throw new UnauthorizedException("Social sign-in session is invalid or expired");
    }

    const tokens = await this.issueTokens(handoff.user);
    return {
      user: this.usersService.toSafeUser(handoff.user),
      returnTo: handoff.returnTo,
      ...tokens,
    };
  }

  socialFailureUrl(message: string) {
    const login = new URL("/login", this.webAppUrl());
    login.searchParams.set("oauthError", message);
    return login.toString();
  }

  async refresh(dto: RefreshTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(dto.refreshToken, {
        secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
      });
      const user = await this.usersRepository.findById(payload.sub);
      if (!user?.refreshTokenHash) {
        throw new UnauthorizedException("Refresh token is no longer valid");
      }

      const isValid = await bcrypt.compare(dto.refreshToken, user.refreshTokenHash);
      if (!isValid) {
        throw new UnauthorizedException("Refresh token is no longer valid");
      }

      return this.issueTokens(user);
    } catch {
      throw new UnauthorizedException("Refresh token is no longer valid");
    }
  }

  async logout(userId: string) {
    await this.usersRepository.updateRefreshTokenHash(userId, null);
    return { success: true };
  }

  async me(userId: string) {
    const user = await this.usersService.findByIdOrThrow(userId);
    return this.usersService.toSafeUser(user);
  }

  private async issueTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
        expiresIn: this.config.get<string>("JWT_ACCESS_TTL") ?? "15m",
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
        expiresIn: this.config.get<string>("JWT_REFRESH_TTL") ?? "7d",
      }),
    ]);

    await this.usersRepository.updateRefreshTokenHash(user.id, await bcrypt.hash(refreshToken, 12));

    return { accessToken, refreshToken };
  }

  private async exchangeLineCode(code: string, nonce: string): Promise<SocialProfile> {
    const clientId = this.config.getOrThrow<string>("LINE_CHANNEL_ID");
    const clientSecret = this.config.getOrThrow<string>("LINE_CHANNEL_SECRET");
    const tokenResponse = await fetch("https://api.line.me/oauth2/v2.1/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: this.providerCallbackUrl("line"),
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });
    const token = await tokenResponse.json() as { id_token?: string };
    if (!tokenResponse.ok || !token.id_token) {
      throw new UnauthorizedException("LINE Login could not exchange the authorization code");
    }

    const verifyResponse = await fetch("https://api.line.me/oauth2/v2.1/verify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        id_token: token.id_token,
        client_id: clientId,
        nonce,
      }),
    });
    const profile = await verifyResponse.json() as {
      sub?: string;
      name?: string;
      picture?: string;
      email?: string;
    };
    if (!verifyResponse.ok || !profile.sub) {
      throw new UnauthorizedException("LINE identity token could not be verified");
    }

    return {
      provider: AuthProvider.LINE,
      providerAccountId: profile.sub,
      displayName: profile.name?.trim() || "LINE member",
      email: profile.email,
      avatarUrl: profile.picture,
    };
  }

  private async exchangeFacebookCode(code: string): Promise<SocialProfile> {
    const appId = this.config.getOrThrow<string>("FACEBOOK_APP_ID");
    const appSecret = this.config.getOrThrow<string>("FACEBOOK_APP_SECRET");
    const tokenUrl = new URL(`${this.facebookBaseUrl("graph")}/oauth/access_token`);
    tokenUrl.search = new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: this.providerCallbackUrl("facebook"),
      code,
    }).toString();

    const tokenResponse = await fetch(tokenUrl);
    const token = await tokenResponse.json() as { access_token?: string };
    if (!tokenResponse.ok || !token.access_token) {
      throw new UnauthorizedException("Facebook Login could not exchange the authorization code");
    }

    const proof = createHmac("sha256", appSecret).update(token.access_token).digest("hex");
    const profileUrl = new URL(`${this.facebookBaseUrl("graph")}/me`);
    profileUrl.search = new URLSearchParams({
      fields: "id,name,email,picture.type(large)",
      access_token: token.access_token,
      appsecret_proof: proof,
    }).toString();
    const profileResponse = await fetch(profileUrl);
    const profile = await profileResponse.json() as {
      id?: string;
      name?: string;
      email?: string;
      picture?: { data?: { url?: string } };
    };
    if (!profileResponse.ok || !profile.id) {
      throw new UnauthorizedException("Facebook profile could not be verified");
    }

    return {
      provider: AuthProvider.FACEBOOK,
      providerAccountId: profile.id,
      displayName: profile.name?.trim() || "Facebook member",
      email: profile.email,
      avatarUrl: profile.picture?.data?.url,
    };
  }

  private async upsertSocialUser(profile: SocialProfile, role: UserRole) {
    const account = await this.usersRepository.findByAuthAccount(
      profile.provider,
      profile.providerAccountId,
    );
    if (account) return account.user;

    const verifiedEmail = profile.email?.trim().toLowerCase();
    const existing = verifiedEmail
      ? await this.usersRepository.findByEmail(verifiedEmail)
      : null;
    if (existing) {
      return this.usersRepository.linkAuthAccount({
        userId: existing.id,
        provider: profile.provider,
        providerAccountId: profile.providerAccountId,
        avatarUrl: existing.avatarUrl ?? profile.avatarUrl,
      });
    }

    const providerSlug = profile.provider.toLowerCase();
    const accountHash = createHash("sha256")
      .update(profile.providerAccountId)
      .digest("hex")
      .slice(0, 24);
    return this.usersRepository.create({
      email: verifiedEmail ?? `${providerSlug}-${accountHash}@oauth.petradar.local`,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      role,
      authAccounts: {
        create: {
          provider: profile.provider,
          providerAccountId: profile.providerAccountId,
        },
      },
    });
  }

  private providerCallbackUrl(provider: RedirectProvider) {
    const configured = this.config.get<string>("API_PUBLIC_URL");
    const base = configured ?? `http://localhost:${this.config.get<number>("PORT") ?? 4000}/api`;
    return `${base.replace(/\/$/, "")}/auth/${provider}/callback`;
  }

  private webAppUrl() {
    const configured = this.config.get<string>("WEB_APP_URL");
    if (configured) return configured;
    return (this.config.get<string>("WEB_ORIGIN") ?? "http://localhost:3000").split(",")[0].trim();
  }

  private facebookBaseUrl(host: "www" | "graph") {
    const version = this.config.get<string>("FACEBOOK_GRAPH_VERSION")?.replace(/^\/|\/$/g, "");
    const root = host === "www" ? "https://www.facebook.com" : "https://graph.facebook.com";
    return version ? `${root}/${version}` : root;
  }

  private socialRole(value?: string) {
    return value === UserRole.PET_OWNER || value === UserRole.VOLUNTEER
      ? value
      : UserRole.REPORTER;
  }

  private safeReturnTo(value?: string) {
    return value?.startsWith("/") && !value.startsWith("//") ? value : "/map";
  }
}
