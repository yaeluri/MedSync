import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Replaces any pre-existing UUID-shaped users.id values with the matching
 * 9-digit patient/caregiver id, so users.id == patients.id (and so the
 * user_id FK columns hold the same 9-digit string everywhere).
 *
 * Designed to be idempotent: rows that already use the 9-digit id are
 * left untouched.
 */
export class AlignUserIdsWithPatientIds1782500000000
  implements MigrationInterface
{
  name = 'AlignUserIdsWithPatientIds1782500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop FKs so we can update both sides of the relation
    await queryRunner.query(
      `ALTER TABLE "patients" DROP CONSTRAINT "FK_7fe1518dc780fd777669b5cb7a0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "caregivers" DROP CONSTRAINT "FK_655a3051fc7e8ba600f9edf1f3e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_documents" DROP CONSTRAINT "FK_94c6090bd7be7dc6f9aa7d2cf4b"`,
    );

    // Repoint medical_documents.uploaded_by_user_id to the new id, where it
    // currently points at a user that will be renamed.
    await queryRunner.query(`
      UPDATE "medical_documents" m
      SET "uploaded_by_user_id" = p."id"
      FROM "patients" p
      WHERE m."uploaded_by_user_id" = p."user_id"
        AND p."user_id" <> p."id"
    `);
    await queryRunner.query(`
      UPDATE "medical_documents" m
      SET "uploaded_by_user_id" = c."id"::text
      FROM "caregivers" c
      WHERE m."uploaded_by_user_id" = c."user_id"
        AND c."user_id" <> c."id"::text
    `);

    // Rewrite the user PK to the 9-digit value
    await queryRunner.query(`
      UPDATE "users" u
      SET "id" = p."id"
      FROM "patients" p
      WHERE u."id" = p."user_id" AND p."user_id" <> p."id"
    `);
    await queryRunner.query(`
      UPDATE "users" u
      SET "id" = c."id"::text
      FROM "caregivers" c
      WHERE u."id" = c."user_id" AND c."user_id" <> c."id"::text
    `);

    // Mirror the change on the dependent rows
    await queryRunner.query(
      `UPDATE "patients" SET "user_id" = "id" WHERE "user_id" <> "id"`,
    );
    await queryRunner.query(
      `UPDATE "caregivers" SET "user_id" = "id"::text WHERE "user_id" <> "id"::text`,
    );

    // Restore FKs with original names
    await queryRunner.query(
      `ALTER TABLE "patients" ADD CONSTRAINT "FK_7fe1518dc780fd777669b5cb7a0" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "caregivers" ADD CONSTRAINT "FK_655a3051fc7e8ba600f9edf1f3e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_documents" ADD CONSTRAINT "FK_94c6090bd7be7dc6f9aa7d2cf4b" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    throw new Error('AlignUserIdsWithPatientIds is not reversible.');
  }
}
