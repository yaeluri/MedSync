import styles from './InfoGrid.module.css';

export interface InfoField {
  label: string;
  value?: string | number | null;
}

interface Props {
  fields: InfoField[];
}

export default function InfoGrid({ fields }: Props) {
  return (
    <div className={styles.infoGrid}>
      {fields.map((f) => (
        <div key={f.label} className={styles.infoCard}>
          <div className={styles.infoLabel}>{f.label}</div>
          <div className={styles.infoValue}>{f.value ?? '—'}</div>
        </div>
      ))}
    </div>
  );
}
