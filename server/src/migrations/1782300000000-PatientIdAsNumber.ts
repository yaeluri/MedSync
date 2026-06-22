import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Replaces patients.id UUID primary key with the 9-digit idNumber value.
 * Drops the now-redundant id_number column. All FK columns referencing
 * patients(id) are converted from uuid to varchar.
 */
export class PatientIdAsNumber1782300000000 implements MigrationInterface {
  name = 'PatientIdAsNumber1782300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Drop FKs referencing patients(id)
    await queryRunner.query(
      `ALTER TABLE "slots" DROP CONSTRAINT "FK_d2f106327cf1bd5bd82cc5d2ccf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_documents" DROP CONSTRAINT "FK_d31157c1680919456aca9e48170"`,
    );
    await queryRunner.query(
      `ALTER TABLE "visits" DROP CONSTRAINT "FK_5054db93135a6d966fd3939caa6"`,
    );

    // 2. Drop unique constraint on id_number (its value becomes the PK)
    await queryRunner.query(
      `ALTER TABLE "patients" DROP CONSTRAINT "UQ_patients_id_number"`,
    );

    // 3. Convert column types (still hold uuid-strings at this point)
    await queryRunner.query(
      `ALTER TABLE "patients" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "patients" ALTER COLUMN "id" TYPE varchar USING "id"::text`,
    );
    await queryRunner.query(
      `ALTER TABLE "slots" ALTER COLUMN "patient_id" TYPE varchar USING "patient_id"::text`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_documents" ALTER COLUMN "patient_id" TYPE varchar USING "patient_id"::text`,
    );
    await queryRunner.query(
      `ALTER TABLE "visits" ALTER COLUMN "patient_id" TYPE varchar USING "patient_id"::text`,
    );

    // 4. Repoint referencing tables to use id_number values, then update patients.id
    //    Backfill any remaining NULL id_number rows first so the PK is never NULL.
    await queryRunner.query(`
      DO $$
      DECLARE
        r record;
        candidate text;
        attempts int;
        exists_count int;
      BEGIN
        FOR r IN SELECT "id" FROM "patients" WHERE "id_number" IS NULL LOOP
          attempts := 0;
          LOOP
            attempts := attempts + 1;
            candidate := (100000000 + floor(random() * 899999999))::bigint::text;
            SELECT count(*) INTO exists_count FROM "patients" WHERE "id_number" = candidate;
            EXIT WHEN exists_count = 0 OR attempts >= 20;
          END LOOP;
          UPDATE "patients" SET "id_number" = candidate WHERE "id" = r."id";
        END LOOP;
      END $$;
    `);
    await queryRunner.query(
      `UPDATE "slots" s SET "patient_id" = p."id_number" FROM "patients" p WHERE s."patient_id" = p."id"`,
    );
    await queryRunner.query(
      `UPDATE "medical_documents" m SET "patient_id" = p."id_number" FROM "patients" p WHERE m."patient_id" = p."id"`,
    );
    await queryRunner.query(
      `UPDATE "visits" v SET "patient_id" = p."id_number" FROM "patients" p WHERE v."patient_id" = p."id"`,
    );
    await queryRunner.query(`UPDATE "patients" SET "id" = "id_number"`);

    // 5. Drop the now-redundant id_number column
    await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "id_number"`);

    // 6. Recreate the FKs with the same names
    await queryRunner.query(
      `ALTER TABLE "slots" ADD CONSTRAINT "FK_d2f106327cf1bd5bd82cc5d2ccf" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_documents" ADD CONSTRAINT "FK_d31157c1680919456aca9e48170" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "visits" ADD CONSTRAINT "FK_5054db93135a6d966fd3939caa6" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    throw new Error(
      'PatientIdAsNumber migration cannot be reverted automatically; ' +
        'the original UUIDs are lost.',
    );
  }
}
