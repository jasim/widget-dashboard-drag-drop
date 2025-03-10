const StatsWidget = () => {
  return (
    <div className="h-full grid grid-cols-2 gap-4">
      <div className="bg-gray-50 rounded-lg p-3 flex flex-col">
        <span className="text-sm text-gray-500">Revenue</span>
        <span className="text-xl font-bold">$24,780</span>
        <span className="text-xs text-green-500">+12.5%</span>
      </div>
      <div className="bg-gray-50 rounded-lg p-3 flex flex-col">
        <span className="text-sm text-gray-500">Users</span>
        <span className="text-xl font-bold">1,482</span>
        <span className="text-xs text-green-500">+8.2%</span>
      </div>
      <div className="bg-gray-50 rounded-lg p-3 flex flex-col">
        <span className="text-sm text-gray-500">Orders</span>
        <span className="text-xl font-bold">568</span>
        <span className="text-xs text-green-500">+5.3%</span>
      </div>
      <div className="bg-gray-50 rounded-lg p-3 flex flex-col">
        <span className="text-sm text-gray-500">Conversion</span>
        <span className="text-xl font-bold">3.24%</span>
        <span className="text-xs text-red-500">-0.5%</span>
      </div>
    </div>
  );
};

export default StatsWidget;
