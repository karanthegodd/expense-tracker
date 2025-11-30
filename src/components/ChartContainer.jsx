import Card from './Card';

const ChartContainer = ({ title, icon, children, className = '' }) => {
  return (
    <Card className={`glass-card ${className}`}>
      <div className="flex items-center mb-6">
        {icon && <span className="text-2xl mr-3">{icon}</span>}
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>
      <div className="chart-wrapper">
        {children}
      </div>
    </Card>
  );
};

export default ChartContainer;

