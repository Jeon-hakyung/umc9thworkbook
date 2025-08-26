---
name: "\U0001F528FIX"
about: 버그 수정 템플릿 입니다.
title: "\U0001F528fix: "
labels: "\U0001F528fix"
assignees: ''

---

## ✅ 수정된 버그 개요 (Summary)
- 어떤 버그를 해결했는지 한 문장으로 요약해주세요  
  예: 로그인 시 무반응 버그 수정  
  예: 게시글 작성 API 400 에러 해결

## 🐞 원인 분석 (Root Cause)
- 버그의 원인은 무엇이었나요?  
  예: 비동기 함수 내부에서 리턴되지 않은 응답 객체  
  예: 프론트에서 잘못된 필드명으로 API 요청 전송

## 🔧 수정 방식 (How it was fixed)
- 어떤 방식으로 수정했는지 작성해주세요  
  예: `handleLogin` 내부에 `return await` 추가  
  예: 요청 body의 `postTile` → `postTitle` 오타 수정

## 🧪 테스트 결과 (Test Result)
- [ ] 로컬 테스트 완료
- [ ] 브라우저 수동 테스트 완료
- [ ] 단위 테스트 통과
- [ ] CI/CD 테스트 통과

### ✔️ 정상 작동 확인 항목
- [ ] 로그인 후 홈 화면 이동 확인
- [ ] 실패 케이스에서 에러 메시지 표시 확인

## 📎 관련 PR / 커밋
- PR: #45  
- 커밋: `fix: 로그인 버그 수정 (commit 7a1c3d5)`

## 🚧 향후 방지 방안 (Postmortem / Prevention)
- [ ] 테스트 코드에 케이스 추가함
- [ ] API 명세서에 required field 강조함
- [ ] 프론트/백엔드 validation 보완 예정

## 🗒 기타 회고 또는 공유 사항
- (선택) 느낀 점, 팀에 공유할 팁 등
