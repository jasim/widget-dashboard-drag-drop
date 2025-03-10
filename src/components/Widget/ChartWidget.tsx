const ChartWidget = () => {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="w-full h-4/5 flex items-end space-x-2">
          {[65, 40, 85, 30, 55, 60, 75].map((height, index) => (
            <div 
              key={index} 
              className="bg-primary bg-opacity-80 rounded-t-md w-full"
              style={{ height: `${height}%` }}
            ></div>
          ))}
        </div>
        <div className="w-full mt-2 flex justify-between text-xs text-gray-500">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>
      </div>
    </div>
  );
};

export default ChartWidget;
