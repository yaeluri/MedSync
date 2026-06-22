import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFileDataToMedicalDocuments1782800000000
  implements MigrationInterface
{
  name = 'AddFileDataToMedicalDocuments1782800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "medical_documents" ADD COLUMN IF NOT EXISTS "file_data" bytea`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "medical_documents" DROP COLUMN IF EXISTS "file_data"`,
    );
  }
}
