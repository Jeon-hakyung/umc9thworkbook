// @types/environment.d.ts

namespace NodeJS {
    interface ProcessEnv extends NodeJS.ProcessEnv {
      // 기본 설정
      PORT: string;
      DATABASE_URL: string;
      
      // JWT 설정 (9주차 추가)
      JWT_SECRET: string;
      
      // Google 로그인 설정
      PASSPORT_GOOGLE_CLIENT_ID: string;
      PASSPORT_GOOGLE_CLIENT_SECRET: string;
      
      // AWS 배포 설정 (10주차 추가)
      EC2_HOST: string;
    }
  }