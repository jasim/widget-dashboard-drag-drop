const TableWidget = () => {
  const data = [
    { id: 1, name: 'John Doe', amount: '$120.50', date: '2023-04-12', status: 'Completed' },
    { id: 2, name: 'Jane Smith', amount: '$75.20', date: '2023-04-11', status: 'Pending' },
    { id: 3, name: 'Bob Johnson', amount: '$250.00', date: '2023-04-10', status: 'Completed' },
    { id: 4, name: 'Alice Brown', amount: '$180.75', date: '2023-04-09', status: 'Failed' },
    { id: 5, name: 'Charlie Wilson', amount: '$95.40', date: '2023-04-08', status: 'Pending' },
    { id: 6, name: 'Eva Martinez', amount: '$145.30', date: '2023-04-07', status: 'Completed' },
    { id: 7, name: 'David Lee', amount: '$210.25', date: '2023-04-06', status: 'Pending' },
    { id: 8, name: 'Grace Kim', amount: '$65.90', date: '2023-04-05', status: 'Failed' },
    { id: 9, name: 'Frank Thomas', amount: '$320.15', date: '2023-04-04', status: 'Completed' },
    { id: 10, name: 'Helen Garcia', amount: '$175.60', date: '2023-04-03', status: 'Pending' },
    { id: 11, name: 'Ian Wright', amount: '$90.45', date: '2023-04-02', status: 'Completed' },
    { id: 12, name: 'Julia Chen', amount: '$135.80', date: '2023-04-01', status: 'Failed' },
    { id: 13, name: 'Kevin Patel', amount: '$260.70', date: '2023-03-31', status: 'Pending' },
    { id: 14, name: 'Laura Scott', amount: '$110.25', date: '2023-03-30', status: 'Completed' },
    { id: 15, name: 'Mike Johnson', amount: '$195.40', date: '2023-03-29', status: 'Pending' },
    { id: 16, name: 'Nina Rodriguez', amount: '$85.15', date: '2023-03-28', status: 'Failed' },
    { id: 17, name: 'Oscar Williams', amount: '$310.90', date: '2023-03-27', status: 'Completed' },
    { id: 18, name: 'Penny Adams', amount: '$150.30', date: '2023-03-26', status: 'Pending' },
    { id: 19, name: 'Quincy Taylor', amount: '$225.75', date: '2023-03-25', status: 'Completed' },
    { id: 20, name: 'Rachel Moore', amount: '$70.60', date: '2023-03-24', status: 'Failed' },
    { id: 21, name: 'Steve Davis', amount: '$290.20', date: '2023-03-23', status: 'Pending' },
    { id: 22, name: 'Tina Lopez', amount: '$130.45', date: '2023-03-22', status: 'Completed' },
  ];

  return (
    <div className="h-full overflow-auto">
      <table className="min-w-full divide-y divide-gray-200 text-xs">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              <td className="px-2 py-1 whitespace-nowrap text-gray-500">{row.id}</td>
              <td className="px-2 py-1 whitespace-nowrap font-medium text-gray-900">{row.name}</td>
              <td className="px-2 py-1 whitespace-nowrap text-gray-500">{row.amount}</td>
              <td className="px-2 py-1 whitespace-nowrap text-gray-500">{row.date}</td>
              <td className="px-2 py-1 whitespace-nowrap">
                <span className={`px-1.5 py-0.5 inline-flex text-xs leading-4 font-medium rounded-full 
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
