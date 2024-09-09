-- ���̺� ������ ���踦 ����Ͽ� �� ���� �����ص� ������ �߻����� �ʰ� ���ĵǾ����ϴ�.

-- workplaces Table Create SQL
-- ���̺� ���� SQL - workplaces
CREATE TABLE workplaces
(
    workplace_idx     NUMBER(18, 0)     NOT NULL, 
    workplace_name    VARCHAR2(50)      NOT NULL, 
    workplace_addr    VARCHAR2(50)      NOT NULL, 
    lat               NUMBER(17, 14)    NOT NULL, 
    lon               NUMBER(17, 14)    NOT NULL, 
     PRIMARY KEY (workplace_idx)
);

-- Auto Increment�� ���� Sequence �߰� SQL - workplaces.workplace_idx
CREATE SEQUENCE workplaces_SEQ
START WITH 1
INCREMENT BY 1;

-- Auto Increment�� ���� Trigger �߰� SQL - workplaces.workplace_idx
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

-- ���̺� Comment ���� SQL - workplaces
COMMENT ON TABLE workplaces IS '�۾���. �۾���';

-- �÷� Comment ���� SQL - workplaces.workplace_idx
COMMENT ON COLUMN workplaces.workplace_idx IS '�۾��� �ĺ���. �۾��� �ĺ���';

-- �÷� Comment ���� SQL - workplaces.workplace_name
COMMENT ON COLUMN workplaces.workplace_name IS '�۾��� ��. �۾��� ��';

-- �÷� Comment ���� SQL - workplaces.workplace_addr
COMMENT ON COLUMN workplaces.workplace_addr IS '�۾��� �ּ�. �۾��� �ּ�';

-- �÷� Comment ���� SQL - workplaces.lat
COMMENT ON COLUMN workplaces.lat IS '����. ����';

-- �÷� Comment ���� SQL - workplaces.lon
COMMENT ON COLUMN workplaces.lon IS '�浵. �浵';


-- users Table Create SQL
-- ���̺� ���� SQL - users
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

-- ���̺� Comment ���� SQL - users
COMMENT ON TABLE users IS '�����. �����';

-- �÷� Comment ���� SQL - users.user_email
COMMENT ON COLUMN users.user_email IS '����� �̸���. ����� �̸���';

-- �÷� Comment ���� SQL - users.user_password
COMMENT ON COLUMN users.user_password IS '����� ��й�ȣ. ����� ��й�ȣ';

-- �÷� Comment ���� SQL - users.user_name
COMMENT ON COLUMN users.user_name IS '����� �̸�. ����� �̸�';

-- �÷� Comment ���� SQL - users.phone_number
COMMENT ON COLUMN users.phone_number IS '����� �ڵ��� ��ȣ. ����� �ڵ��� ��ȣ';

-- �÷� Comment ���� SQL - users.joining_date
COMMENT ON COLUMN users.joining_date IS '�Ի� ��¥. �Ի� ��¥';

-- �÷� Comment ���� SQL - users.user_role
COMMENT ON COLUMN users.user_role IS '����� ����. ����� ����';


-- envs Table Create SQL
-- ���̺� ���� SQL - envs
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

-- Auto Increment�� ���� Sequence �߰� SQL - envs.env_idx
CREATE SEQUENCE envs_SEQ
START WITH 1
INCREMENT BY 1;

-- Auto Increment�� ���� Trigger �߰� SQL - envs.env_idx
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

-- ���̺� Comment ���� SQL - envs
COMMENT ON TABLE envs IS '�۾�ȯ��. �۾�ȯ��';

-- �÷� Comment ���� SQL - envs.env_idx
COMMENT ON COLUMN envs.env_idx IS 'ȯ�� �ĺ���. ȯ�� �ĺ���';

-- �÷� Comment ���� SQL - envs.temperature
COMMENT ON COLUMN envs.temperature IS '�µ�. �µ�';

-- �÷� Comment ���� SQL - envs.humidity
COMMENT ON COLUMN envs.humidity IS '����. ����';

-- �÷� Comment ���� SQL - envs.co2
COMMENT ON COLUMN envs.co2 IS '�̻�ȭź�� ��. �̻�ȭź�� ��';

-- �÷� Comment ���� SQL - envs.gas
COMMENT ON COLUMN envs.gas IS '���� ��. ���� ��';

-- �÷� Comment ���� SQL - envs.danger_of_fire
COMMENT ON COLUMN envs.danger_of_fire IS 'ȭ�� ���輺. ȭ�� ���輺';

-- �÷� Comment ���� SQL - envs.created_at
COMMENT ON COLUMN envs.created_at IS '���� ��¥. ���� ��¥';

-- �÷� Comment ���� SQL - envs.workplace_idx
COMMENT ON COLUMN envs.workplace_idx IS '�۾���. �۾��� �ĺ���';

-- Foreign Key ���� SQL - envs(workplace_idx) -> workplaces(workplace_idx)
ALTER TABLE envs
    ADD CONSTRAINT FK_envs_workplace_idx_workplac FOREIGN KEY (workplace_idx)
        REFERENCES workplaces (workplace_idx) ;

-- Foreign Key ���� SQL - envs(workplace_idx)
-- ALTER TABLE envs
-- DROP CONSTRAINT FK_envs_workplace_idx_workplac;


-- attendances Table Create SQL
-- ���̺� ���� SQL - attendances
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

-- Auto Increment�� ���� Sequence �߰� SQL - attendances.att_idx
CREATE SEQUENCE attendances_SEQ
START WITH 1
INCREMENT BY 1;

-- Auto Increment�� ���� Trigger �߰� SQL - attendances.att_idx
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

-- ���̺� Comment ���� SQL - attendances
COMMENT ON TABLE attendances IS '�⼮����. ���������';

-- �÷� Comment ���� SQL - attendances.att_idx
COMMENT ON COLUMN attendances.att_idx IS '�ٹ� �ĺ���. �ٹ� �ĺ���';

-- �÷� Comment ���� SQL - attendances.user_email
COMMENT ON COLUMN attendances.user_email IS '����� �̸���. ����� �̸���';

-- �÷� Comment ���� SQL - attendances.att_type
COMMENT ON COLUMN attendances.att_type IS '����� ����. ���:IN, ���:OUT. ����� ����. ���:IN, ���:OUT';

-- �÷� Comment ���� SQL - attendances.clockin_at
COMMENT ON COLUMN attendances.clockin_at IS '��ٽð�. üũ �ð�';

-- �÷� Comment ���� SQL - attendances.clockout_at
COMMENT ON COLUMN attendances.clockout_at IS '��ٽð�';

-- �÷� Comment ���� SQL - attendances.workplace_idx
COMMENT ON COLUMN attendances.workplace_idx IS '�۾��� �ĺ���';

-- Foreign Key ���� SQL - attendances(user_email) -> users(user_email)
ALTER TABLE attendances
    ADD CONSTRAINT FK_attendances_user_email_user FOREIGN KEY (user_email)
        REFERENCES users (user_email) ;

-- Foreign Key ���� SQL - attendances(user_email)
-- ALTER TABLE attendances
-- DROP CONSTRAINT FK_attendances_user_email_user;

-- Foreign Key ���� SQL - attendances(workplace_idx) -> workplaces(workplace_idx)
ALTER TABLE attendances
    ADD CONSTRAINT FK_attendances_workplace_idx_w FOREIGN KEY (workplace_idx)
        REFERENCES workplaces (workplace_idx) ;

-- Foreign Key ���� SQL - attendances(workplace_idx)
-- ALTER TABLE attendances
-- DROP CONSTRAINT FK_attendances_workplace_idx_w;

COMMENT ON TABLE workplaces IS '�۾���. �۾���';

-- �÷��� �ּ� �߰�
COMMENT ON COLUMN workplaces.workplace_idx IS '�۾��� �ĺ���. �۾��� �ĺ���';

COMMENT ON COLUMN workplaces.workplace_name IS '�۾��� ��. �۾��� ��';

COMMENT ON COLUMN workplaces.workplace_addr IS '�۾��� �ּ�. �۾��� �ּ�';

COMMENT ON COLUMN workplaces.lat IS '����. ����';

COMMENT ON COLUMN workplaces.lon IS '�浵. �浵';

GRANT CREATE ANY TABLE TO USERNAME;
