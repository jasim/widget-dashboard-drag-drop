const TableWidget = () => {
  const data = [
    { id: 1, name: 'John Doe', amount: '$120.50', status: 'Completed' },
    { id: 2, name: 'Jane Smith', amount: '$75.20', status: 'Pending' },
    { id: 3, name: 'Bob Johnson', amount: '$250.00', status: 'Completed' },
    { id: 4, name: 'Alice Brown', amount: '$180.75', status: 'Failed' },
    { id: 5, name: 'Charlie Wilson', amount: '$95.40', status: 'Pending' },
  ];

  return (
    <div className="h-full overflow-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row) => (
            <tr key={row.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.amount}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${row.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                    row.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'}`}>
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableWidget;
