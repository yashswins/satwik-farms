/**
 * Weekday × hour grid. Single-hue green ramp; every cell carries its value
 * in a title so the colour is never the only signal.
 */
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Heatmap({ grid, max, valueLabel = 'invoices', hours = [6, 22] }) {
  if (!max) return <p className="py-6 text-center text-sm text-shop-text-secondary">No invoices in this period.</p>;
  const [h0, h1] = hours;
  const cols = Array.from({ length: h1 - h0 }, (_, i) => h0 + i);
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-0.5 text-[10px]">
        <thead>
          <tr>
            <th className="w-8" />
            {cols.map((h) => <th key={h} className="font-normal text-shop-text-secondary">{h % 3 === 0 ? `${h}h` : ''}</th>)}
          </tr>
        </thead>
        <tbody>
          {grid.map((row, d) => (
            <tr key={d}>
              <th className="pr-1 text-left font-normal text-shop-text-secondary">{DAYS[d]}</th>
              {cols.map((h) => {
                const cell = row[h];
                const t = cell.invoices / max;
                return (
                  <td
                    key={h}
                    title={`${DAYS[d]} ${h}:00 — ${cell.invoices} ${valueLabel}`}
                    className="h-5 rounded-sm"
                    style={{ backgroundColor: t === 0 ? 'rgba(83,177,117,0.08)' : `rgba(83,177,117,${0.2 + 0.8 * t})` }}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
