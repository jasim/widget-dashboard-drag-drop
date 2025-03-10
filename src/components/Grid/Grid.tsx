import React, { useState, useEffect, useRef } from 'react';
import { Layout, WidgetType } from '../../types';
import GridItem from './GridItem';
import { widgetsToLayout, layoutToWidgets, compactLayout } from '../../utils/gridUtils';
import styles from './Grid.module.css';

interface GridProps {
  widgets: WidgetType[];
  setWidgets: React.Dispatch<React.SetStateAction<WidgetType[]>>;
  cols: number;
  rowHeight: number;
  isDraggable?: boolean;
  isResizable?: boolean;
  compactType?: 'vertical' | 'horizontal' | null;
  children: React.ReactNode[];
}

const Grid: React.FC<GridProps> = ({
  widgets,
  setWidgets,
  cols = 12,
  rowHeight = 100,
  isDraggable = true,
  isResizable = true,
  compactType = 'vertical',
  children
}) => {
  const [layout, setLayout] = useState<Layout[]>([]);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate column width based on container width
  const colWidth = containerWidth / cols;

  // Initialize layout from widgets
  useEffect(() => {
    setLayout(widgetsToLayout(widgets));
  }, [widgets]);

  // Update container width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    
    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDrag = (id: string, x: number, y: number) => {
    const newLayout = layout.map(item => 
      item.i === id ? { ...item, x, y } : item
    );
    setLayout(newLayout);
  };

  const handleDragStop = () => {
    setIsDragging(false);
    
    // Apply compaction if needed
    let newLayout = [...layout];
    if (compactType === 'vertical') {
      newLayout = compactLayout(newLayout);
    }
    
    // Update widgets with new layout
    setWidgets(layoutToWidgets(widgets, newLayout));
  };

  const handleResizeStart = () => {
    setIsResizing(true);
  };

  const handleResize = (id: string, w: number, h: number) => {
    const newLayout = layout.map(item => 
      item.i === id ? { ...item, w, h } : item
    );
    setLayout(newLayout);
  };

  const handleResizeStop = () => {
    setIsResizing(false);
    
    // Apply compaction if needed
    let newLayout = [...layout];
    if (compactType === 'vertical') {
      newLayout = compactLayout(newLayout);
    }
    
    // Update widgets with new layout
    setWidgets(layoutToWidgets(widgets, newLayout));
  };

  return (
    <div 
      ref={containerRef}
      className={styles.gridContainer}
      style={{ height: `${Math.max(...layout.map(item => item.y + item.h), 4) * rowHeight}px` }}
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return null;
        
        const widget = widgets[index];
        const layoutItem = layout.find(item => item.i === widget.id);
        
        if (!layoutItem) return null;
        
        return (
          <GridItem
            key={layoutItem.i}
            id={layoutItem.i}
            x={layoutItem.x}
            y={layoutItem.y}
            w={layoutItem.w}
            h={layoutItem.h}
            rowHeight={rowHeight}
            colWidth={colWidth}
            isDraggable={isDraggable}
            isResizable={isResizable}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragStop={handleDragStop}
            onResizeStart={handleResizeStart}
            onResize={handleResize}
            onResizeStop={handleResizeStop}
          >
            {child}
          </GridItem>
        );
      })}
    </div>
  );
};

export default Grid;
