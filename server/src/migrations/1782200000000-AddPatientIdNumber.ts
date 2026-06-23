import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPatientIdNumber1782200000000 implements MigrationInterface {
  name = 'AddPatientIdNumber1782200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "patients" ADD COLUMN "id_number" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "patients" ADD CONSTRAINT "UQ_patients_id_number" UNIQUE ("id_number")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "patients" DROP CONSTRAINT "UQ_patients_id_number"`,
    );
    await queryRunner.query(
      `ALTER TABLE "patients" DROP COLUMN "id_number"`,
    );
  }
}
