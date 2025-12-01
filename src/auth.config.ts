import dotenv from "dotenv";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { Strategy as JwtStrategy, ExtractJwt, VerifiedCallback } from "passport-jwt";
import { prisma } from "./db.config.js";
import jwt from "jsonwebtoken";

dotenv.config();

// JWT 비밀 키 (환경 변수가 없을 경우를 대비해 빈 문자열 처리)
const secret = process.env.JWT_SECRET || "default_secret";

/**
 * Access Token 생성 함수
 */
export const generateAccessToken = (user: { id: number; email: string }) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    secret,
    { expiresIn: "1h" }
  );
};

/**
 * Refresh Token 생성 함수
 */
export const generateRefreshToken = (user: { id: number }) => {
  return jwt.sign(
    { id: user.id },
    secret,
    { expiresIn: "14d" }
  );
};

/**
 * Google 로그인 검증 및 유저 생성 함수
 */
const googleVerify = async (profile: Profile) => {
  const email = profile.emails?.[0]?.value;
  if (!email) {
    throw new Error(`profile.email was not found: ${profile}`);
  }

  const user = await prisma.user.findFirst({ where: { email } });

  if (user !== null) {
    return { id: user.id, email: user.email, name: user.name };
  }

  // 신규 유저 생성
  const created = await prisma.user.create({
    data: {
      email,
      name: profile.displayName,
      gender: "추후 수정",
      birth: new Date(1970, 0, 1),
      address: "추후 수정",
      detailAddress: "추후 수정",
      phoneNumber: "추후 수정",
      password: "추후 수정", // 소셜 로그인이라 비밀번호는 임의 설정
    },
  });

  return { id: created.id, email: created.email, name: created.name };
};

/**
 * Passport Google Strategy 설정
 */
export const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.PASSPORT_GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.PASSPORT_GOOGLE_CLIENT_SECRET || "",
    callbackURL: "/oauth2/callback/google",
    scope: ["email", "profile"],
  },
  async (accessToken, refreshToken, profile, cb) => {
    try {
      const user = await googleVerify(profile);

      const jwtAccessToken = generateAccessToken(user);
      const jwtRefreshToken = generateRefreshToken(user);

      // Passport는 user 객체 대신 토큰 객체를 반환하도록 설정
      return cb(null, {
        accessToken: jwtAccessToken,
        refreshToken: jwtRefreshToken,
      });
    } catch (err) {
      return cb(err as Error);
    }
  }
);

/**
 * Passport JWT Strategy 설정
 */
const jwtOptions = {
  // 요청 헤더의 'Authorization'에서 'Bearer <token>' 추출
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  // JWT 서명 검증 키
  secretOrKey: process.env.JWT_SECRET || "default_secret",
};

export const jwtStrategy = new JwtStrategy(
  jwtOptions,
  async (payload: any, done: VerifiedCallback) => {
    try {
      // Payload에 담긴 'id'로 DB에서 유저 조회
      const user = await prisma.user.findFirst({
        where: { id: payload.id },
      });

      if (user) {
        // 유저가 존재하면 req.user에 주입
        return done(null, user);
      } else {
        // 유저가 없으면 인증 실패
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  }
);