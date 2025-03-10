import { WidgetType } from '../../types';
import ChartWidget from './ChartWidget';
import StatsWidget from './StatsWidget';
import TableWidget from './TableWidget';
import TextWidget from './TextWidget';
import styles from './Widget.module.css';

interface WidgetProps {
  widget: WidgetType;
  onRemove: () => void;
}

const Widget = ({ widget, onRemove }: WidgetProps) => {
  const renderWidgetContent = () => {
    switch (widget.type) {
      case 'chart':
        return <ChartWidget />;
      case 'stats':
        return <StatsWidget />;
      case 'table':
        return <TableWidget />;
      case 'text':
        return <TextWidget />;
      default:
        return <div>Unknown widget type</div>;
    }
  };

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <h3 className={styles.title}>{widget.title}</h3>
        <div className={styles.actions}>
          <button className={styles.actionButton} onClick={onRemove}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <div className={styles.content}>
        {renderWidgetContent()}
      </div>
    </div>
  );
};

export default Widget;
