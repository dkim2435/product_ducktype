interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  large?: boolean;
  color?: string;
}

export function StatCard({ label, value, unit, large, color }: StatCardProps) {
  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{
        fontSize: '12px',
        color: 'var(--sub-color)',
        marginBottom: '4px',
        textTransform: 'lowercase',
      }}>
        {label}
      </div>
      <div style={{
        fontSize: large ? '56px' : '32px',
        fontWeight: 300,
        color: color || 'var(--main-color)',
        lineHeight: 1.1,
      }}>
        {value}
        {unit && (
          <span style={{ fontSize: '16px', marginLeft: '4px', color: 'var(--sub-color)' }}>
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
