import React, { useState } from 'react';
import { WidgetType } from '../../types';
import GridItem from './GridItem';
import BorderForHoveredGridItem from './BorderForHoveredGridItem';
import DropTargetIndicator from './DropTargetIndicator';
import { getLayoutHeight } from '../../grid/geometry';
import { useEffect } from 'react';
import { useGridLayout } from '../../grid/hooks/useGridLayout';
import { useDragState } from '../../grid/hooks/useDragState';
import { useGridDom } from '../../grid/hooks/useGridDom';
import { useGridEvents } from '../../grid/hooks/useGridEvents';
import styles from './Grid.module.css';

// Default row height
export const DEFAULT_ROW_HEIGHT = 100;

interface GridProps {
  widgets: WidgetType[];
  setWidgets: React.Dispatch<React.SetStateAction<WidgetType[]>>;
  cols: number;
  isDraggable?: boolean;
  isResizable?: boolean;
  compactType?: 'vertical' | 'horizontal' | null;
  children: React.ReactNode[];
  rowHeight?: number;
  onDebugInfoUpdate?: (info: {
    dragState: DragState;
    layout: Layout[];
    dropAction?: DropAction | null;
    dropTargetArea?: { x: number; y: number; w: number; h: number } | null;
  }) => void;
}

/**
 * Grid component - the imperative shell that uses the functional core
 */
const Grid: React.FC<GridProps> = ({
  widgets,
  setWidgets,
  cols = 12,
  isDraggable = true,
  isResizable = true,
  compactType = null,
  rowHeight: propRowHeight,
  children,
  onDebugInfoUpdate
}) => {
  // Use the prop value if provided, otherwise use the default
  const gridRowHeight = propRowHeight || DEFAULT_ROW_HEIGHT;
  
  // State to track the currently hovered item
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  
  // State to track the drop target area during drag operations
  const [dropTargetArea, setDropTargetArea] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  
  // Use our custom hooks for grid state management
  const { layout, updateLayout, applyLayout } = useGridLayout({
    widgets,
    setWidgets,
    compactType
  });
  
  const { 
    containerRef, 
    containerWidth, 
    registerItemRef, 
    registerResizeHandleRef 
  } = useGridDom();
  
  // Calculate column width based on container width
  const colWidth = containerWidth / cols;
  
  const { 
    dragState, 
    startDrag, 
    updateDragPosition, 
    updateDropTargetArea: updateDragTargetArea, 
    endDrag 
  } = useDragState({
    layout,
    updateLayout,
    cols,
    rowHeight: gridRowHeight,
    colWidth,
    setDropTargetArea
  });
  
  // Set up event handlers
  const { handleMouseDown } = useGridEvents({
    dragState,
    startDrag,
    updateDragPosition,
    updateDropTargetArea: updateDragTargetArea,
    endDrag,
    containerRef,
    isResizable,
    isDraggable
  });
  
  // Calculate grid height based on layout
  const gridHeight = Math.max(getLayoutHeight(layout), 4) * gridRowHeight;
  
  // Apply layout changes to widgets when drag ends
  useEffect(() => {
    if (!dragState.active && dragState.itemId !== null) {
      applyLayout();
    }
  }, [dragState.active, dragState.itemId, applyLayout]);
  
  // Update debug info whenever relevant state changes
  useEffect(() => {
    if (onDebugInfoUpdate) {
      onDebugInfoUpdate({
        dragState,
        layout,
        dropAction: dragState.dropTarget?.dropAction,
        dropTargetArea
      });
    }
  }, [dragState, layout, dropTargetArea, onDebugInfoUpdate]);

  // Handle mouse enter and leave for grid items
  const handleItemMouseEnter = (id: string) => {
    setHoveredItemId(id);
  };

  const handleItemMouseLeave = () => {
    setHoveredItemId(null);
  };

  return (
    <div 
      ref={containerRef}
      className={styles.gridContainer}
      style={{ height: `${gridHeight}px` }}
      onMouseDown={handleMouseDown}
    >
      <BorderForHoveredGridItem 
        hoveredItemId={hoveredItemId}
        layout={layout}
        colWidth={colWidth}
        rowHeight={gridRowHeight}
      />
      <DropTargetIndicator
        targetArea={dropTargetArea}
        colWidth={colWidth}
        rowHeight={gridRowHeight}
      />
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
            rowHeight={gridRowHeight}
            colWidth={colWidth}
            isResizable={isResizable}
            registerRef={registerItemRef}
            registerResizeHandleRef={registerResizeHandleRef}
            isDragging={dragState.active && dragState.itemId === layoutItem.i && !dragState.isResize}
            isResizing={dragState.active && dragState.itemId === layoutItem.i && dragState.isResize}
            onMouseEnter={() => handleItemMouseEnter(layoutItem.i)}
            onMouseLeave={handleItemMouseLeave}
          >
            {child}
          </GridItem>
        );
      })}
    </div>
  );
};

export default Grid;
