import React, { useState } from 'react';
import { WidgetType } from '@/types.ts';
import { DragState } from '../../grid/hooks/useDragState';
import { DropAction } from '../../grid/placement';
import Widget from '../Widget/Widget';
import Grid from '../Grid/Grid';
import Header from '../Header/Header';
import styles from './Dashboard.module.css';

interface DashboardProps {
  widgets: WidgetType[];
  setWidgets: React.Dispatch<React.SetStateAction<WidgetType[]>>;
  onRemoveWidget: (id: string) => void;
  onAddWidget: (type: string) => void;
}

const Dashboard = ({ widgets, setWidgets, onRemoveWidget, onAddWidget }: DashboardProps) => {
  // State to track grid debugging information
  const [debugInfo, setDebugInfo] = useState<{
    dragState: DragState;
    layout: Array<{ i: string; x: number; y: number; w: number; h: number }>;
    dropAction: DropAction | null;
    dropTargetArea: { x: number; y: number; w: number; h: number } | null;
  }>({
    dragState: { 
      active: false, 
      itemId: null, 
      startPos: { x: 0, y: 0 }, 
      startGrid: { x: 0, y: 0 }, 
      isResize: false 
    },
    layout: [],
    dropAction: null,
    dropTargetArea: null
  });

  // Columns and row height configuration
  const cols = 24;
  const rowHeight = 100;

  // Handler to update debug information
  const handleDebugInfoUpdate = React.useCallback((info: {
    dragState: DragState;
    layout: Array<{ i: string; x: number; y: number; w: number; h: number }>;
    dropAction?: DropAction | null;
    dropTargetArea?: { x: number; y: number; w: number; h: number } | null;
  }) => {
    setDebugInfo({
      dragState: {
        active: info.dragState.active,
        itemId: info.dragState.itemId,
        startPos: info.dragState.startPos,
        startGrid: info.dragState.startGrid,
        isResize: info.dragState.isResize,
        startSize: info.dragState.startSize,
        dropTarget: info.dragState.dropTarget
      },
      layout: info.layout,
      dropAction: info.dropAction || null,
      dropTargetArea: info.dropTargetArea || null
    });
  }, []);

  return (
    <div className={styles.dashboardContainer}>
      <Header 
        onAddWidget={onAddWidget}
        dragState={debugInfo.dragState}
        layout={debugInfo.layout}
        dropTargetArea={debugInfo.dropTargetArea}
        cols={cols}
        rowHeight={rowHeight}
      />
      <div className={styles.dashboardContent}>
        <Grid
          widgets={widgets}
          setWidgets={setWidgets}
          cols={cols}
          rowHeight={rowHeight}
          isDraggable={true}
          isResizable={true}
          onDebugInfoUpdate={handleDebugInfoUpdate}
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
    </div>
  );
};

export default Dashboard;
