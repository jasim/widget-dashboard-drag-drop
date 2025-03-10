import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Layout, WidgetType } from '../../types';
import Widget from '../Widget/Widget';
import styles from './Dashboard.module.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardProps {
  widgets: WidgetType[];
  setWidgets: React.Dispatch<React.SetStateAction<WidgetType[]>>;
  onRemoveWidget: (id: string) => void;
}

const Dashboard = ({ widgets, setWidgets, onRemoveWidget }: DashboardProps) => {
  const layouts = {
    lg: widgets.map(widget => ({
      i: widget.id,
      x: widget.x,
      y: widget.y,
      w: widget.w,
      h: widget.h,
      minW: 2,
      minH: 2
    }))
  };

  const handleLayoutChange = (currentLayout: Layout[]) => {
    const updatedWidgets = widgets.map(widget => {
      const layoutItem = currentLayout.find(item => item.i === widget.id);
      if (layoutItem) {
        return {
          ...widget,
          x: layoutItem.x,
          y: layoutItem.y,
          w: layoutItem.w,
          h: layoutItem.h
        };
      }
      return widget;
    });
    
    setWidgets(updatedWidgets);
  };

  return (
    <div className={styles.dashboard}>
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        onLayoutChange={handleLayoutChange}
        isDraggable
        isResizable
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
      </ResponsiveGridLayout>
    </div>
  );
};

export default Dashboard;
