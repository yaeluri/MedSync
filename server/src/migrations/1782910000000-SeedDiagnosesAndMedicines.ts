import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDiagnosesAndMedicines1782910000000
  implements MigrationInterface
{
  name = 'SeedDiagnosesAndMedicines1782910000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Seed ICD-10 diagnosis codes
    const diagnoses: { code: string; description: string }[] = [
      { code: 'A09', description: 'Infectious gastroenteritis and colitis' },
      { code: 'B34.9', description: 'Viral infection, unspecified' },
      {
        code: 'E11.9',
        description: 'Type 2 diabetes mellitus without complications',
      },
      { code: 'E78.5', description: 'Hyperlipidemia, unspecified' },
      {
        code: 'F32.9',
        description: 'Major depressive disorder, single episode, unspecified',
      },
      { code: 'F41.9', description: 'Anxiety disorder, unspecified' },
      { code: 'I10', description: 'Essential (primary) hypertension' },
      {
        code: 'I25.10',
        description:
          'Atherosclerotic heart disease of native coronary artery',
      },
      {
        code: 'J00',
        description: 'Acute nasopharyngitis (common cold)',
      },
      {
        code: 'J06.9',
        description: 'Acute upper respiratory infection, unspecified',
      },
      { code: 'J18.9', description: 'Pneumonia, unspecified organism' },
      { code: 'J20.9', description: 'Acute bronchitis, unspecified' },
      {
        code: 'J45.909',
        description: 'Unspecified asthma, uncomplicated',
      },
      {
        code: 'K21.0',
        description:
          'Gastro-esophageal reflux disease with esophagitis',
      },
      {
        code: 'K29.70',
        description: 'Gastritis, unspecified, without bleeding',
      },
      {
        code: 'K57.30',
        description:
          'Diverticulosis of large intestine without perforation, abscess, or bleeding',
      },
      {
        code: 'K80.20',
        description: 'Calculus of gallbladder without cholecystitis',
      },
      { code: 'L30.9', description: 'Dermatitis, unspecified' },
      { code: 'M10.9', description: 'Gout, unspecified' },
      { code: 'M54.5', description: 'Low back pain' },
      { code: 'M79.3', description: 'Panniculitis' },
      {
        code: 'N39.0',
        description: 'Urinary tract infection, site not specified',
      },
      {
        code: 'N40.0',
        description:
          'Benign prostatic hyperplasia without lower urinary tract symptoms',
      },
      { code: 'R05', description: 'Cough' },
      { code: 'R10.9', description: 'Unspecified abdominal pain' },
      { code: 'R50.9', description: 'Fever, unspecified' },
      { code: 'R51', description: 'Headache' },
      { code: 'R55', description: 'Syncope and collapse' },
      {
        code: 'Z00.00',
        description:
          'Encounter for general adult medical examination without abnormal findings',
      },
      { code: 'Z23', description: 'Encounter for immunization' },
    ];

    for (const { code, description } of diagnoses) {
      await queryRunner.query(
        `INSERT INTO "diagnoses" ("id", "code", "description")
         VALUES (uuid_generate_v4(), $1, $2)
         ON CONFLICT ("code") DO NOTHING`,
        [code, description],
      );
    }

    // Seed common generic medicine names
    const medicines: string[] = [
      'Amoxicillin',
      'Amoxicillin/Clavulanate',
      'Azithromycin',
      'Metformin',
      'Atorvastatin',
      'Lisinopril',
      'Amlodipine',
      'Omeprazole',
      'Pantoprazole',
      'Ibuprofen',
      'Paracetamol (Acetaminophen)',
      'Aspirin',
      'Atenolol',
      'Metoprolol',
      'Losartan',
      'Albuterol',
      'Salbutamol',
      'Prednisone',
      'Prednisolone',
      'Cetirizine',
      'Loratadine',
      'Sertraline',
      'Escitalopram',
      'Fluoxetine',
      'Diazepam',
      'Alprazolam',
      'Levothyroxine',
      'Insulin Glargine',
      'Insulin Aspart',
      'Clopidogrel',
      'Warfarin',
      'Enoxaparin',
      'Furosemide',
      'Spironolactone',
      'Hydrochlorothiazide',
      'Trimethoprim/Sulfamethoxazole',
      'Ciprofloxacin',
      'Doxycycline',
    ];

    for (const name of medicines) {
      await queryRunner.query(
        `INSERT INTO "medicines" ("id", "name")
         VALUES (uuid_generate_v4(), $1)
         ON CONFLICT ("name") DO NOTHING`,
        [name],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "diagnoses" WHERE "code" IN (
        'A09', 'B34.9', 'E11.9', 'E78.5', 'F32.9', 'F41.9',
        'I10', 'I25.10', 'J00', 'J06.9', 'J18.9', 'J20.9',
        'J45.909', 'K21.0', 'K29.70', 'K57.30', 'K80.20',
        'L30.9', 'M10.9', 'M54.5', 'M79.3', 'N39.0', 'N40.0',
        'R05', 'R10.9', 'R50.9', 'R51', 'R55', 'Z00.00', 'Z23'
      )`,
    );

    await queryRunner.query(
      `DELETE FROM "medicines" WHERE "name" IN (
        'Amoxicillin', 'Amoxicillin/Clavulanate', 'Azithromycin',
        'Metformin', 'Atorvastatin', 'Lisinopril', 'Amlodipine',
        'Omeprazole', 'Pantoprazole', 'Ibuprofen',
        'Paracetamol (Acetaminophen)', 'Aspirin', 'Atenolol',
        'Metoprolol', 'Losartan', 'Albuterol', 'Salbutamol',
        'Prednisone', 'Prednisolone', 'Cetirizine', 'Loratadine',
        'Sertraline', 'Escitalopram', 'Fluoxetine', 'Diazepam',
        'Alprazolam', 'Levothyroxine', 'Insulin Glargine',
        'Insulin Aspart', 'Clopidogrel', 'Warfarin', 'Enoxaparin',
        'Furosemide', 'Spironolactone', 'Hydrochlorothiazide',
        'Trimethoprim/Sulfamethoxazole', 'Ciprofloxacin', 'Doxycycline'
      )`,
    );
  }
}
