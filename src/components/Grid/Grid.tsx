import React, { useState } from 'react';
import { WidgetType } from '../../types';
import GridItem from './GridItem';
import BorderForHoveredGridItem from './BorderForHoveredGridItem';
import DropTargetIndicator from './DropTargetIndicator';
import { useGridState, rowHeight } from './useGridState';
import { getLayoutHeight } from '../../utils/gridUtils';
import styles from './Grid.module.css';

interface GridProps {
  widgets: WidgetType[];
  setWidgets: React.Dispatch<React.SetStateAction<WidgetType[]>>;
  cols: number;
  isDraggable?: boolean;
  isResizable?: boolean;
  compactType?: 'vertical' | 'horizontal' | null;
  children: React.ReactNode[];
  // We need to add rowHeight back as an optional prop with default value
  rowHeight?: number;
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
  compactType = 'vertical',
  rowHeight: propRowHeight,
  children
}) => {
  // Use the prop value if provided, otherwise use the default
  const gridRowHeight = propRowHeight || rowHeight;
  // State to track the currently hovered item
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  
  // State to track the drop target area during drag operations
  const [dropTargetArea, setDropTargetArea] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  
  // Use our custom hook for grid state management
  const {
    layout,
    containerRef,
    colWidth,
    dragState,
    startDrag,
    registerItemRef,
    registerResizeHandleRef,
    updateDropTargetArea
  } = useGridState({
    widgets,
    setWidgets,
    cols,
    compactType,
    setDropTargetArea
  });
  
  // Calculate grid height based on layout
  const gridHeight = Math.max(getLayoutHeight(layout), 4) * gridRowHeight;
  
  // Handle mouse down on the grid container
  const handleMouseDown = (e: React.MouseEvent) => {
    // Find the target element and check if it's a grid item or resize handle
    const target = e.target as HTMLElement;
    
    // Find the closest grid item parent
    let gridItemElement = target.closest(`.${styles.gridItem}`) as HTMLElement;
    if (!gridItemElement) return;
    
    // Get the widget id from the element
    const id = gridItemElement.dataset.id;
    if (!id) return;
    
    // Check if it's a resize handle
    const isResizeHandle = target.closest(`.${styles.resizeHandle}`);
    
    if (isResizeHandle && isResizable) {
      // Handle resize start
      e.preventDefault();
      e.stopPropagation();
      startDrag(id, e, true);
    } else if (isDraggable) {
      // Handle drag start
      e.preventDefault();
      startDrag(id, e, false);
    }
  };

  // State to track the currently hovered item
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  
  // State to track the drop target area during drag operations
  const [dropTargetArea, setDropTargetArea] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  // Calculate grid height based on layout
  const gridHeight = Math.max(getLayoutHeight(layout), 4) * gridRowHeight;

  // Handle mouse enter and leave for grid items
  const handleItemMouseEnter = (id: string) => {
    setHoveredItemId(id);
  };

  const handleItemMouseLeave = () => {
    setHoveredItemId(null);
  };

  // Handle mouse move to update drop target area
  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragState.active && !dragState.isResize) {
      updateDropTargetArea(e);
    }
  };

  // Handle mouse up to clear drop target area
  const handleMouseUp = () => {
    if (dropTargetArea) {
      setDropTargetArea(null);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={styles.gridContainer}
      style={{ height: `${gridHeight}px` }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
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
