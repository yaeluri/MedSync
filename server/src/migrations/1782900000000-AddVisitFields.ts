import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVisitFields1782900000000 implements MigrationInterface {
  name = 'AddVisitFields1782900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "visits" ADD COLUMN IF NOT EXISTS "weight" text`);
    await queryRunner.query(`ALTER TABLE "visits" ADD COLUMN IF NOT EXISTS "height" text`);
    await queryRunner.query(`ALTER TABLE "visits" ADD COLUMN IF NOT EXISTS "oxygen_sat" text`);
    await queryRunner.query(`ALTER TABLE "visits" ADD COLUMN IF NOT EXISTS "chief_complaint" text`);
    await queryRunner.query(`ALTER TABLE "visits" ADD COLUMN IF NOT EXISTS "visit_type" character varying`);
    await queryRunner.query(`ALTER TABLE "visits" ADD COLUMN IF NOT EXISTS "follow_up_date" date`);
    await queryRunner.query(`ALTER TABLE "visits" ADD COLUMN IF NOT EXISTS "referral_notes" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "visits" DROP COLUMN IF EXISTS "referral_notes"`);
    await queryRunner.query(`ALTER TABLE "visits" DROP COLUMN IF EXISTS "follow_up_date"`);
    await queryRunner.query(`ALTER TABLE "visits" DROP COLUMN IF EXISTS "visit_type"`);
    await queryRunner.query(`ALTER TABLE "visits" DROP COLUMN IF EXISTS "chief_complaint"`);
    await queryRunner.query(`ALTER TABLE "visits" DROP COLUMN IF EXISTS "oxygen_sat"`);
    await queryRunner.query(`ALTER TABLE "visits" DROP COLUMN IF EXISTS "height"`);
    await queryRunner.query(`ALTER TABLE "visits" DROP COLUMN IF EXISTS "weight"`);
  }
}
