import { WidgetType } from '@/types.ts';
import Widget from '../Widget/Widget';
import Grid from '../Grid/Grid';
import styles from './Dashboard.module.css';

interface DashboardProps {
  widgets: WidgetType[];
  setWidgets: React.Dispatch<React.SetStateAction<WidgetType[]>>;
  onRemoveWidget: (id: string) => void;
}

const Dashboard = ({ widgets, setWidgets, onRemoveWidget }: DashboardProps) => {
  return (
    <div className={styles.dashboard}>
      <Grid
        widgets={widgets}
        setWidgets={setWidgets}
        cols={12}
        rowHeight={100}
        isDraggable={true}
        isResizable={true}
        compactType="vertical"
      >
        {widgets.map(widget => (
          <div key={widget.id} className={styles.widgetContainer}>
            <Widget
              widget={widget}
              onRemove={() => onRemoveWidget(widget.id)}
            />
          </div>
        ))}
      </Grid>
    </div>
  );
};

export default Dashboard;
