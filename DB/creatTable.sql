-- 테이블 순서는 관계를 고려하여 한 번에 실행해도 에러가 발생하지 않게 정렬되었습니다.

-- workplaces Table Create SQL
-- 테이블 생성 SQL - workplaces
CREATE TABLE workplaces
(
    workplace_idx     NUMBER(18, 0)     NOT NULL, 
    workplace_name    VARCHAR2(50)      NOT NULL, 
    workplace_addr    VARCHAR2(50)      NOT NULL, 
    lat               NUMBER(17, 14)    NOT NULL, 
    lon               NUMBER(17, 14)    NOT NULL, 
     PRIMARY KEY (workplace_idx)
);

-- Auto Increment를 위한 Sequence 추가 SQL - workplaces.workplace_idx
CREATE SEQUENCE workplaces_SEQ
START WITH 1
INCREMENT BY 1;

-- Auto Increment를 위한 Trigger 추가 SQL - workplaces.workplace_idx
CREATE OR REPLACE TRIGGER workplaces_AI_TRG
BEFORE INSERT ON workplaces 
REFERENCING NEW AS NEW FOR EACH ROW 
BEGIN 
    SELECT workplaces_SEQ.NEXTVAL
    INTO :NEW.workplace_idx
    FROM DUAL;
END;

-- DROP TRIGGER workplaces_AI_TRG; 

-- DROP SEQUENCE workplaces_SEQ; 

-- 테이블 Comment 설정 SQL - workplaces
COMMENT ON TABLE workplaces IS '작업장. 작업장';

-- 컬럼 Comment 설정 SQL - workplaces.workplace_idx
COMMENT ON COLUMN workplaces.workplace_idx IS '작업장 식별자. 작업장 식별자';

-- 컬럼 Comment 설정 SQL - workplaces.workplace_name
COMMENT ON COLUMN workplaces.workplace_name IS '작업장 명. 작업장 명';

-- 컬럼 Comment 설정 SQL - workplaces.workplace_addr
COMMENT ON COLUMN workplaces.workplace_addr IS '작업장 주소. 작업장 주소';

-- 컬럼 Comment 설정 SQL - workplaces.lat
COMMENT ON COLUMN workplaces.lat IS '위도. 위도';

-- 컬럼 Comment 설정 SQL - workplaces.lon
COMMENT ON COLUMN workplaces.lon IS '경도. 경도';


-- users Table Create SQL
-- 테이블 생성 SQL - users
CREATE TABLE users
(
    user_email       VARCHAR2(50)    NOT NULL, 
    user_password    VARCHAR2(50)    NOT NULL, 
    user_name        VARCHAR2(50)    NOT NULL, 
    phone_number     VARCHAR2(20)    NOT NULL, 
    joining_date     DATE            NOT NULL, 
    user_role        CHAR(1)         DEFAULT 'U' NOT NULL, 
     PRIMARY KEY (user_email)
);

-- 테이블 Comment 설정 SQL - users
COMMENT ON TABLE users IS '사용자. 사용자';

-- 컬럼 Comment 설정 SQL - users.user_email
COMMENT ON COLUMN users.user_email IS '사용자 이메일. 사용자 이메일';

-- 컬럼 Comment 설정 SQL - users.user_password
COMMENT ON COLUMN users.user_password IS '사용자 비밀번호. 사용자 비밀번호';

-- 컬럼 Comment 설정 SQL - users.user_name
COMMENT ON COLUMN users.user_name IS '사용자 이름. 사용자 이름';

-- 컬럼 Comment 설정 SQL - users.phone_number
COMMENT ON COLUMN users.phone_number IS '사용자 핸드폰 번호. 사용자 핸드폰 번호';

-- 컬럼 Comment 설정 SQL - users.joining_date
COMMENT ON COLUMN users.joining_date IS '입사 날짜. 입사 날짜';

-- 컬럼 Comment 설정 SQL - users.user_role
COMMENT ON COLUMN users.user_role IS '사용자 권한. 사용자 권한';


-- envs Table Create SQL
-- 테이블 생성 SQL - envs
CREATE TABLE envs
(
    env_idx           NUMBER(18, 0)    NOT NULL, 
    temperature       DECIMAL(4,1)     NOT NULL, 
    humidity          DECIMAL(4,1)     NOT NULL, 
    co2               DECIMAL(6,2)     NOT NULL, 
    gas               DECIMAL(6,2)     NOT NULL, 
    danger_of_fire    NUMBER(3, 0)     NOT NULL, 
    created_at        TIMESTAMP        NOT NULL, 
    workplace_idx     NUMBER(18, 0)    NOT NULL, 
     PRIMARY KEY (env_idx)
);

-- Auto Increment를 위한 Sequence 추가 SQL - envs.env_idx
CREATE SEQUENCE envs_SEQ
START WITH 1
INCREMENT BY 1;

-- Auto Increment를 위한 Trigger 추가 SQL - envs.env_idx
CREATE OR REPLACE TRIGGER envs_AI_TRG
BEFORE INSERT ON envs 
REFERENCING NEW AS NEW FOR EACH ROW 
BEGIN 
    SELECT envs_SEQ.NEXTVAL
    INTO :NEW.env_idx
    FROM DUAL;
END;

-- DROP TRIGGER envs_AI_TRG; 

-- DROP SEQUENCE envs_SEQ; 

-- 테이블 Comment 설정 SQL - envs
COMMENT ON TABLE envs IS '작업환경. 작업환경';

-- 컬럼 Comment 설정 SQL - envs.env_idx
COMMENT ON COLUMN envs.env_idx IS '환경 식별자. 환경 식별자';

-- 컬럼 Comment 설정 SQL - envs.temperature
COMMENT ON COLUMN envs.temperature IS '온도. 온도';

-- 컬럼 Comment 설정 SQL - envs.humidity
COMMENT ON COLUMN envs.humidity IS '습도. 습도';

-- 컬럼 Comment 설정 SQL - envs.co2
COMMENT ON COLUMN envs.co2 IS '이산화탄소 농도. 이산화탄소 농도';

-- 컬럼 Comment 설정 SQL - envs.gas
COMMENT ON COLUMN envs.gas IS '가스 농도. 가스 농도';

-- 컬럼 Comment 설정 SQL - envs.danger_of_fire
COMMENT ON COLUMN envs.danger_of_fire IS '화재 위험성. 화재 위험성';

-- 컬럼 Comment 설정 SQL - envs.created_at
COMMENT ON COLUMN envs.created_at IS '측정 날짜. 측정 날짜';

-- 컬럼 Comment 설정 SQL - envs.workplace_idx
COMMENT ON COLUMN envs.workplace_idx IS '작업장. 작업자 식별자';

-- Foreign Key 설정 SQL - envs(workplace_idx) -> workplaces(workplace_idx)
ALTER TABLE envs
    ADD CONSTRAINT FK_envs_workplace_idx_workplac FOREIGN KEY (workplace_idx)
        REFERENCES workplaces (workplace_idx) ;

-- Foreign Key 삭제 SQL - envs(workplace_idx)
-- ALTER TABLE envs
-- DROP CONSTRAINT FK_envs_workplace_idx_workplac;


-- attendances Table Create SQL
-- 테이블 생성 SQL - attendances
CREATE TABLE attendances
(
    att_idx          NUMBER(18, 0)    NOT NULL, 
    user_email       VARCHAR2(50)     NOT NULL, 
    att_type         CHAR(3)          NOT NULL, 
    clockin_at       TIMESTAMP        NOT NULL, 
    clockout_at      TIMESTAMP        NULL, 
    workplace_idx    NUMBER(18, 0)    NOT NULL, 
     PRIMARY KEY (att_idx)
);

-- Auto Increment를 위한 Sequence 추가 SQL - attendances.att_idx
CREATE SEQUENCE attendances_SEQ
START WITH 1
INCREMENT BY 1;

-- Auto Increment를 위한 Trigger 추가 SQL - attendances.att_idx
CREATE OR REPLACE TRIGGER attendances_AI_TRG
BEFORE INSERT ON attendances 
REFERENCING NEW AS NEW FOR EACH ROW 
BEGIN 
    SELECT attendances_SEQ.NEXTVAL
    INTO :NEW.att_idx
    FROM DUAL;
END;

-- DROP TRIGGER attendances_AI_TRG; 

-- DROP SEQUENCE attendances_SEQ; 

-- 테이블 Comment 설정 SQL - attendances
COMMENT ON TABLE attendances IS '출석정보. 출퇴근정보';

-- 컬럼 Comment 설정 SQL - attendances.att_idx
COMMENT ON COLUMN attendances.att_idx IS '근무 식별자. 근무 식별자';

-- 컬럼 Comment 설정 SQL - attendances.user_email
COMMENT ON COLUMN attendances.user_email IS '사용자 이메일. 사용자 이메일';

-- 컬럼 Comment 설정 SQL - attendances.att_type
COMMENT ON COLUMN attendances.att_type IS '출퇴근 구분. 출근:IN, 퇴근:OUT. 출퇴근 구분. 출근:IN, 퇴근:OUT';

-- 컬럼 Comment 설정 SQL - attendances.clockin_at
COMMENT ON COLUMN attendances.clockin_at IS '출근시간. 체크 시간';

-- 컬럼 Comment 설정 SQL - attendances.clockout_at
COMMENT ON COLUMN attendances.clockout_at IS '퇴근시간';

-- 컬럼 Comment 설정 SQL - attendances.workplace_idx
COMMENT ON COLUMN attendances.workplace_idx IS '작업장 식별자';

-- Foreign Key 설정 SQL - attendances(user_email) -> users(user_email)
ALTER TABLE attendances
    ADD CONSTRAINT FK_attendances_user_email_user FOREIGN KEY (user_email)
        REFERENCES users (user_email) ;

-- Foreign Key 삭제 SQL - attendances(user_email)
-- ALTER TABLE attendances
-- DROP CONSTRAINT FK_attendances_user_email_user;

-- Foreign Key 설정 SQL - attendances(workplace_idx) -> workplaces(workplace_idx)
ALTER TABLE attendances
    ADD CONSTRAINT FK_attendances_workplace_idx_w FOREIGN KEY (workplace_idx)
        REFERENCES workplaces (workplace_idx) ;

-- Foreign Key 삭제 SQL - attendances(workplace_idx)
-- ALTER TABLE attendances
-- DROP CONSTRAINT FK_attendances_workplace_idx_w;

COMMENT ON TABLE workplaces IS '작업장. 작업장';

-- 컬럼에 주석 추가
COMMENT ON COLUMN workplaces.workplace_idx IS '작업장 식별자. 작업장 식별자';

COMMENT ON COLUMN workplaces.workplace_name IS '작업장 명. 작업장 명';

COMMENT ON COLUMN workplaces.workplace_addr IS '작업장 주소. 작업장 주소';

COMMENT ON COLUMN workplaces.lat IS '위도. 위도';

COMMENT ON COLUMN workplaces.lon IS '경도. 경도';

GRANT CREATE ANY TABLE TO USERNAME;
