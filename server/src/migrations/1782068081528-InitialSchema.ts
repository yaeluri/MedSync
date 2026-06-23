import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1782068081528 implements MigrationInterface {
    name = 'InitialSchema1782068081528'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL, CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "slots" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "patient_id" uuid NOT NULL, "caregiver_id" uuid NOT NULL, "slot_time" TIMESTAMP NOT NULL, "has_referral" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8b553bb1941663b63fd38405e42" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ad80a6c2fce5da253b281ba4f9" ON "slots" ("caregiver_id", "slot_time") `);
        await queryRunner.query(`CREATE TABLE "caregivers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "license_number" character varying NOT NULL, "specialization" character varying NOT NULL, "clinic_name" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_655a3051fc7e8ba600f9edf1f3e" UNIQUE ("user_id"), CONSTRAINT "UQ_548f3b7efa2ed5b93897e194883" UNIQUE ("license_number"), CONSTRAINT "REL_655a3051fc7e8ba600f9edf1f3" UNIQUE ("user_id"), CONSTRAINT "PK_cb3817d7d9b45f612016f7645b9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "role_id" uuid NOT NULL, "full_name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "phone" character varying, "birth_date" date, "gender" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "document_summaries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "document_id" uuid NOT NULL, "summary_text" text NOT NULL, "extracted_text" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_568ad074931e564160959f6656a" UNIQUE ("document_id"), CONSTRAINT "REL_568ad074931e564160959f6656" UNIQUE ("document_id"), CONSTRAINT "PK_1737d1c3968e08d9d46eb86ebe2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."medical_documents_summary_status_enum" AS ENUM('SUCCESS', 'FAILED')`);
        await queryRunner.query(`CREATE TYPE "public"."medical_documents_document_type_enum" AS ENUM('LAB_RESULT', 'REFERRAL', 'DISCHARGE_SUMMARY', 'IMAGING', 'PRESCRIPTION', 'OTHER')`);
        await queryRunner.query(`CREATE TABLE "medical_documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "patient_id" uuid NOT NULL, "uploaded_by_user_id" uuid NOT NULL, "summary_status" "public"."medical_documents_summary_status_enum" NOT NULL, "document_type" "public"."medical_documents_document_type_enum", "file_name" character varying NOT NULL, "file_url" character varying NOT NULL, "file_format" character varying, "uploaded_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "processing_count" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_4fbc002ccb937c26d28c9bd6287" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "patients" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "hmo" character varying, "blood_type" character varying, "address" character varying NOT NULL, "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_7fe1518dc780fd777669b5cb7a0" UNIQUE ("user_id"), CONSTRAINT "REL_7fe1518dc780fd777669b5cb7a" UNIQUE ("user_id"), CONSTRAINT "PK_a7f0b9fcbb3469d5ec0b0aceaa7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."visit_recordings_status_enum" AS ENUM('PENDING', 'RECORDING', 'PROCESSING', 'TRANSCRIBED', 'AI_PROCESSING', 'AI_SUCCESS', 'AI_PARTIAL_SUCCESS', 'FAILED')`);
        await queryRunner.query(`CREATE TABLE "visit_recordings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "visit_id" uuid NOT NULL, "status" "public"."visit_recordings_status_enum" NOT NULL DEFAULT 'PENDING', "audio_url" character varying NOT NULL, "transcript_text" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_13124d3a7b9fc33aa089441e9fa" UNIQUE ("visit_id"), CONSTRAINT "REL_13124d3a7b9fc33aa089441e9f" UNIQUE ("visit_id"), CONSTRAINT "PK_8ab8c75e165968c4162ead2d10a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "diagnoses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying NOT NULL, "description" character varying NOT NULL, CONSTRAINT "UQ_769438236a34658041d67d9fb29" UNIQUE ("code"), CONSTRAINT "PK_d1bfabf423f99c537817e6ad244" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "visit_diagnoses" ("visit_id" uuid NOT NULL, "diagnosis_id" uuid NOT NULL, "note" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c6de221db343313300e19795fbc" PRIMARY KEY ("visit_id", "diagnosis_id"))`);
        await queryRunner.query(`CREATE TABLE "medicines" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "UQ_07f8fe9649327c6cffe35c5849b" UNIQUE ("name"), CONSTRAINT "PK_77b93851766f7ab93f71f44b18b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "visit_medicines" ("visit_id" uuid NOT NULL, "medicine_id" uuid NOT NULL, "dosage" character varying NOT NULL, "frequency" character varying NOT NULL, "duration" character varying NOT NULL, "instructions" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a40172239a509c5dc8f8e0e3903" PRIMARY KEY ("visit_id", "medicine_id"))`);
        await queryRunner.query(`CREATE TABLE "visits" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "patient_id" uuid NOT NULL, "caregiver_id" uuid NOT NULL, "slot_id" uuid, "visit_date" TIMESTAMP NOT NULL, "blood_pressure" text, "pulse" text, "body_temp" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_d99ab04d53a67b19513f3be662d" UNIQUE ("slot_id"), CONSTRAINT "PK_0b0b322289a41015c6ea4e8bf30" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."visit_summaries_visit_type_enum" AS ENUM('RECORDING', 'MANUAL_INPUT')`);
        await queryRunner.query(`CREATE TABLE "visit_summaries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "visit_id" uuid NOT NULL, "summary_text" text NOT NULL, "visit_type" "public"."visit_summaries_visit_type_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_13f90b58a062e7ed7a9dcdf537a" UNIQUE ("visit_id"), CONSTRAINT "REL_13f90b58a062e7ed7a9dcdf537" UNIQUE ("visit_id"), CONSTRAINT "PK_f3e1a930509870abe2c07854a9c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "slots" ADD CONSTRAINT "FK_d2f106327cf1bd5bd82cc5d2ccf" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "slots" ADD CONSTRAINT "FK_d8224ba599b30adbed833d751d7" FOREIGN KEY ("caregiver_id") REFERENCES "caregivers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "caregivers" ADD CONSTRAINT "FK_655a3051fc7e8ba600f9edf1f3e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "document_summaries" ADD CONSTRAINT "FK_568ad074931e564160959f6656a" FOREIGN KEY ("document_id") REFERENCES "medical_documents"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medical_documents" ADD CONSTRAINT "FK_d31157c1680919456aca9e48170" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medical_documents" ADD CONSTRAINT "FK_94c6090bd7be7dc6f9aa7d2cf4b" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patients" ADD CONSTRAINT "FK_7fe1518dc780fd777669b5cb7a0" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "visit_recordings" ADD CONSTRAINT "FK_13124d3a7b9fc33aa089441e9fa" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "visit_diagnoses" ADD CONSTRAINT "FK_1955e04e1d695109eaf54b6423e" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "visit_diagnoses" ADD CONSTRAINT "FK_33471980aaac2098f4a9875b305" FOREIGN KEY ("diagnosis_id") REFERENCES "diagnoses"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "visit_medicines" ADD CONSTRAINT "FK_03c38bcd9bc9d3e6f621736002c" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "visit_medicines" ADD CONSTRAINT "FK_5385918ba85b60dd6233aed8459" FOREIGN KEY ("medicine_id") REFERENCES "medicines"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "visits" ADD CONSTRAINT "FK_5054db93135a6d966fd3939caa6" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "visits" ADD CONSTRAINT "FK_81ace3b37c7d880f656fe2e0ee0" FOREIGN KEY ("caregiver_id") REFERENCES "caregivers"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "visits" ADD CONSTRAINT "FK_d99ab04d53a67b19513f3be662d" FOREIGN KEY ("slot_id") REFERENCES "slots"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "visit_summaries" ADD CONSTRAINT "FK_13f90b58a062e7ed7a9dcdf537a" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "visit_summaries" DROP CONSTRAINT "FK_13f90b58a062e7ed7a9dcdf537a"`);
        await queryRunner.query(`ALTER TABLE "visits" DROP CONSTRAINT "FK_d99ab04d53a67b19513f3be662d"`);
        await queryRunner.query(`ALTER TABLE "visits" DROP CONSTRAINT "FK_81ace3b37c7d880f656fe2e0ee0"`);
        await queryRunner.query(`ALTER TABLE "visits" DROP CONSTRAINT "FK_5054db93135a6d966fd3939caa6"`);
        await queryRunner.query(`ALTER TABLE "visit_medicines" DROP CONSTRAINT "FK_5385918ba85b60dd6233aed8459"`);
        await queryRunner.query(`ALTER TABLE "visit_medicines" DROP CONSTRAINT "FK_03c38bcd9bc9d3e6f621736002c"`);
        await queryRunner.query(`ALTER TABLE "visit_diagnoses" DROP CONSTRAINT "FK_33471980aaac2098f4a9875b305"`);
        await queryRunner.query(`ALTER TABLE "visit_diagnoses" DROP CONSTRAINT "FK_1955e04e1d695109eaf54b6423e"`);
        await queryRunner.query(`ALTER TABLE "visit_recordings" DROP CONSTRAINT "FK_13124d3a7b9fc33aa089441e9fa"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP CONSTRAINT "FK_7fe1518dc780fd777669b5cb7a0"`);
        await queryRunner.query(`ALTER TABLE "medical_documents" DROP CONSTRAINT "FK_94c6090bd7be7dc6f9aa7d2cf4b"`);
        await queryRunner.query(`ALTER TABLE "medical_documents" DROP CONSTRAINT "FK_d31157c1680919456aca9e48170"`);
        await queryRunner.query(`ALTER TABLE "document_summaries" DROP CONSTRAINT "FK_568ad074931e564160959f6656a"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1"`);
        await queryRunner.query(`ALTER TABLE "caregivers" DROP CONSTRAINT "FK_655a3051fc7e8ba600f9edf1f3e"`);
        await queryRunner.query(`ALTER TABLE "slots" DROP CONSTRAINT "FK_d8224ba599b30adbed833d751d7"`);
        await queryRunner.query(`ALTER TABLE "slots" DROP CONSTRAINT "FK_d2f106327cf1bd5bd82cc5d2ccf"`);
        await queryRunner.query(`DROP TABLE "visit_summaries"`);
        await queryRunner.query(`DROP TYPE "public"."visit_summaries_visit_type_enum"`);
        await queryRunner.query(`DROP TABLE "visits"`);
        await queryRunner.query(`DROP TABLE "visit_medicines"`);
        await queryRunner.query(`DROP TABLE "medicines"`);
        await queryRunner.query(`DROP TABLE "visit_diagnoses"`);
        await queryRunner.query(`DROP TABLE "diagnoses"`);
        await queryRunner.query(`DROP TABLE "visit_recordings"`);
        await queryRunner.query(`DROP TYPE "public"."visit_recordings_status_enum"`);
        await queryRunner.query(`DROP TABLE "patients"`);
        await queryRunner.query(`DROP TABLE "medical_documents"`);
        await queryRunner.query(`DROP TYPE "public"."medical_documents_document_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."medical_documents_summary_status_enum"`);
        await queryRunner.query(`DROP TABLE "document_summaries"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "caregivers"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ad80a6c2fce5da253b281ba4f9"`);
        await queryRunner.query(`DROP TABLE "slots"`);
        await queryRunner.query(`DROP TABLE "roles"`);
    }

}
