import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Converts users.id (and the three columns that reference it) from uuid
 * to varchar so the application can store the 9-digit national ID
 * supplied at signup. Existing UUID values are preserved as strings.
 */
export class UserIdAsString1782400000000 implements MigrationInterface {
  name = 'UserIdAsString1782400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Drop FKs referencing users(id)
    await queryRunner.query(
      `ALTER TABLE "caregivers" DROP CONSTRAINT "FK_655a3051fc7e8ba600f9edf1f3e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "patients" DROP CONSTRAINT "FK_7fe1518dc780fd777669b5cb7a0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_documents" DROP CONSTRAINT "FK_94c6090bd7be7dc6f9aa7d2cf4b"`,
    );

    // 2. Convert column types
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "id" TYPE varchar USING "id"::text`,
    );
    await queryRunner.query(
      `ALTER TABLE "patients" ALTER COLUMN "user_id" TYPE varchar USING "user_id"::text`,
    );
    await queryRunner.query(
      `ALTER TABLE "caregivers" ALTER COLUMN "user_id" TYPE varchar USING "user_id"::text`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_documents" ALTER COLUMN "uploaded_by_user_id" TYPE varchar USING "uploaded_by_user_id"::text`,
    );

    // 3. Recreate FKs with the original names
    await queryRunner.query(
      `ALTER TABLE "caregivers" ADD CONSTRAINT "FK_655a3051fc7e8ba600f9edf1f3e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "patients" ADD CONSTRAINT "FK_7fe1518dc780fd777669b5cb7a0" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_documents" ADD CONSTRAINT "FK_94c6090bd7be7dc6f9aa7d2cf4b" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    throw new Error(
      'UserIdAsString migration cannot be reverted automatically.',
    );
  }
}
