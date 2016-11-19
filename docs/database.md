# Database

## Sequences

### Initialization

When app started

DB 관리

파일과의 연결처리.
항상 기동시 레벨 DB와 덤프파일간에 레플리케이션을 시도한다.
파일 워치를 넣어두어서 해당파일이 바뀌면 레플리케이션을 시도한다.

스토리지 변경후 레플리케이트까지 10초 유예기간

*.padstorage 확장자

스토리지 = 데이터베이스
작성자는 이메일로 구분한다.
공유전에는 이메일을 입력하게한다.
입력시 해당이메일을 글로벌 프로필로 사용할지 질문한다.

디폴트DB는 항상 계속 가져옴


Keys|
---|---
folder_${path}/path|
note_${createdAt}
_local/resourcesPath|
_local/remotes|
