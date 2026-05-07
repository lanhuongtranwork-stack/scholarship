export default function MapLegend() {
  return (
    <div className="flex items-center gap-4 text-xs text-gray-500">
      <span className="font-medium">Số học bổng:</span>
      {[
        { color: '#d1d5db', label: 'Chưa có dữ liệu' },
        { color: '#bfdbfe', label: '1–2' },
        { color: '#3b82f6', label: '3–5' },
        { color: '#1d4ed8', label: '6+' },
      ].map(({ color, label }) => (
        <div key={label} className="flex items-center gap-1">
          <span className="inline-block w-4 h-3 rounded-sm" style={{ background: color }} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}
