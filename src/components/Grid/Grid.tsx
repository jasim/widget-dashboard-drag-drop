import {DropAction} from "@/grid/placement.ts";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import GridOverlay from './GridOverlay';
import {Layout, WidgetType} from '../../types';
import GridItem from './GridItem';
import BorderForHoveredGridItem from './BorderForHoveredGridItem';
import DropTargetIndicator from './DropTargetIndicator';
import { getLayoutHeight } from '../../grid/geometry';
import { useEffect } from 'react';
import { useGridLayout } from '../../grid/hooks/useGridLayout';
import {DragState, useDragState} from '../../grid/hooks/useDragState';
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
  
  // State to track if dragging is active
  const [isDragging, setIsDragging] = useState(false);
  
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
    
    // Update dragging state for grid overlay
    setIsDragging(dragState.active);
  }, [dragState.active, dragState.itemId, applyLayout]);
  
  // Get container width for grid overlay
  const [containerWidth, setContainerWidth] = useState(0);
  
  // Update container width on resize
  const updateContainerWidth = useCallback(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, []);
  
  useEffect(() => {
    updateContainerWidth();
    window.addEventListener('resize', updateContainerWidth);
    return () => window.removeEventListener('resize', updateContainerWidth);
  }, [updateContainerWidth]);
  
  // Update debug info whenever relevant state changes - using a ref to prevent infinite loops
  const prevDebugStateRef = useRef<{
    active: boolean;
    itemId: string | null;
    isResize: boolean;
    dropActionType: "swap" | "placeLeft" | "placeRight" | "placeTop" | "placeBottom" | "reject" | undefined | null;
    dropTargetArea: string | null;
    layoutLength: number;
  }>({
    active: false,
    itemId: null,
    isResize: false,
    dropActionType: null,
    dropTargetArea: null,
    layoutLength: 0
  });
  
  useEffect(() => {
    if (!onDebugInfoUpdate) return;
    
    // Extract only the necessary properties to compare
    const currentState = {
      active: dragState.active,
      itemId: dragState.itemId,
      isResize: dragState.isResize,
      dropActionType: dragState.dropTarget?.dropAction?.type,
      dropTargetArea: dropTargetArea ? 
        `${dropTargetArea.x},${dropTargetArea.y},${dropTargetArea.w},${dropTargetArea.h}` : null,
      layoutLength: layout.length
    };
    
    // Compare with previous state using a simple string comparison
    const prevStateStr = JSON.stringify(prevDebugStateRef.current);
    const currentStateStr = JSON.stringify(currentState);
    
    // Only update if something meaningful has changed
    if (prevStateStr !== currentStateStr) {
      onDebugInfoUpdate({
        dragState,
        layout,
        dropAction: dragState.dropTarget?.dropAction,
        dropTargetArea
      });
      
      // Update the ref with current state
      prevDebugStateRef.current = currentState;
    }
  }, [
    dragState.active, 
    dragState.itemId, 
    dragState.isResize, 
    dragState.dropTarget?.dropAction?.type,
    dropTargetArea,
    layout.length
  ]);

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
      {/* Grid overlay - only visible during drag */}
      <GridOverlay 
        visible={isDragging}
        cols={cols}
        rowHeight={gridRowHeight}
        containerWidth={containerWidth}
        containerHeight={gridHeight}
      />
      
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
