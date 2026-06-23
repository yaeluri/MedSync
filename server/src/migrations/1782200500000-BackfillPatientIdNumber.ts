import { MigrationInterface, QueryRunner } from 'typeorm';

export class BackfillPatientIdNumber1782200500000
  implements MigrationInterface
{
  name = 'BackfillPatientIdNumber1782200500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const rows: { id: string }[] = await queryRunner.query(
      `SELECT id FROM patients WHERE id_number IS NULL`,
    );

    const used = new Set<string>();
    const existing: { id_number: string }[] = await queryRunner.query(
      `SELECT id_number FROM patients WHERE id_number IS NOT NULL`,
    );
    for (const r of existing) used.add(r.id_number);

    for (const row of rows) {
      let candidate: string | null = null;
      for (let i = 0; i < 16; i++) {
        const value = String(
          Math.floor(100_000_000 + Math.random() * 899_999_999),
        );
        if (!used.has(value)) {
          used.add(value);
          candidate = value;
          break;
        }
      }
      if (!candidate) {
        throw new Error('Could not allocate unique idNumber during backfill');
      }
      await queryRunner.query(
        `UPDATE patients SET id_number = $1 WHERE id = $2`,
        [candidate, row.id],
      );
    }
  }

  public async down(): Promise<void> {
    // No-op: we don't want to remove generated IDs.
  }
}
