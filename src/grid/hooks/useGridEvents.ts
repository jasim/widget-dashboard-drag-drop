import { useEffect } from 'react';
import { DragState } from './useDragState';

interface UseGridEventsProps {
  dragState: DragState;
  startDrag: (id: string, clientX: number, clientY: number, isResize: boolean) => void;
  updateDragPosition: (clientX: number, clientY: number) => void;
  updateDropTargetArea: (clientX: number, clientY: number, containerRect: DOMRect) => void;
  endDrag: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
  isResizable: boolean;
  isDraggable: boolean;
}

export const useGridEvents = ({
  dragState,
  startDrag,
  updateDragPosition,
  updateDropTargetArea,
  endDrag,
  containerRef,
  isResizable,
  isDraggable
}: UseGridEventsProps) => {
  // Set up global event listeners for drag and resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragState.active) {
        // Update position
        updateDragPosition(e.clientX, e.clientY);
        
        // Update drop target area if dragging (not resizing)
        if (!dragState.isResize && containerRef.current) {
          updateDropTargetArea(
            e.clientX, 
            e.clientY, 
            containerRef.current.getBoundingClientRect()
          );
        }
      }
    };
    
    const handleMouseUp = () => {
      if (dragState.active) {
        endDrag();
      }
    };
    
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Clean up
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, updateDragPosition, updateDropTargetArea, endDrag, containerRef]);
  
  // Handle mouse down on the grid container
  const handleMouseDown = (e: React.MouseEvent) => {
    // Find the target element and check if it's a grid item or resize handle
    const target = e.target as HTMLElement;
    
    // Find the closest grid item parent
    const gridItemElement = target.closest('[data-grid-item]') as HTMLElement;
    if (!gridItemElement) return;
    
    // Get the widget id from the element
    const id = gridItemElement.dataset.id;
    if (!id) return;
    
    // Check if it's a resize handle
    const isResizeHandle = target.closest('[data-resize-handle]');
    
    if (isResizeHandle && isResizable) {
      // Handle resize start
      e.preventDefault();
      e.stopPropagation();
      startDrag(id, e.clientX, e.clientY, true);
    } else if (isDraggable) {
      // Handle drag start
      e.preventDefault();
      startDrag(id, e.clientX, e.clientY, false);
    }
  };

  return {
    handleMouseDown
  };
};
