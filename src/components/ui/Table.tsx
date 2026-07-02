interface TableProps {
  columns: Array<{
    key: string;
    label: string;
    width?: string;
    render?: (value: any, row: any) => React.ReactNode;
  }>;
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
}

export const Table = ({
  columns,
  data,
  loading = false,
  emptyMessage = 'Nenhum registro encontrado',
}: TableProps) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <p className="text-gray-500">⏳ Carregando...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-3 text-left font-medium text-gray-700"
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-3 text-gray-900">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
