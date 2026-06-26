import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProcessingSummaryStatus1782900000000
  implements MigrationInterface
{
  name = 'AddProcessingSummaryStatus1782900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."medical_documents_summary_status_enum" ADD VALUE IF NOT EXISTS 'PROCESSING'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Postgres cannot drop a single enum value, so recreate the type without PROCESSING.
    await queryRunner.query(
      `UPDATE "medical_documents" SET "summary_status" = 'FAILED' WHERE "summary_status" = 'PROCESSING'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."medical_documents_summary_status_enum" RENAME TO "medical_documents_summary_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."medical_documents_summary_status_enum" AS ENUM('SUCCESS', 'FAILED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_documents" ALTER COLUMN "summary_status" TYPE "public"."medical_documents_summary_status_enum" USING "summary_status"::text::"public"."medical_documents_summary_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."medical_documents_summary_status_enum_old"`,
    );
  }
}
