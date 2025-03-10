import { useState } from 'react';
import styles from './Header.module.css';
import { DragState } from '@/grid/hooks/useDragState.ts';
import { DropAction } from '@/grid/placement.ts';

interface HeaderProps {
  onAddWidget: (type: string) => void;
  dragState?: DragState;
  layout?: Array<{ i: string; x: number; y: number; w: number; h: number }>;
  dropAction?: DropAction | null;
  dropTargetArea?: { x: number; y: number; w: number; h: number } | null;
  cols?: number;
  rowHeight?: number;
}

const Header = ({ 
  onAddWidget, 
  dragState = { active: false, itemId: null, startPos: { x: 0, y: 0 }, startGrid: { x: 0, y: 0 }, isResize: false },
  layout = [],
  dropAction = null,
  dropTargetArea = null,
  cols = 12,
  rowHeight = 100
}: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const widgetTypes = [
    { type: 'chart', label: 'Chart' },
    { type: 'stats', label: 'Stats' },
    { type: 'table', label: 'Table' },
    { type: 'text', label: 'Text' }
  ];

  // Get the current item being dragged
  const draggedItem = dragState.itemId ? layout.find(item => item.i === dragState.itemId) : null;

  // Format coordinates for display
  const formatCoord = (value: number) => value.toFixed(1);

  // Helper to get action description
  const getActionDescription = (action: DropAction | null) => {
    if (!action) return 'None';
    
    switch (action.type) {
      case 'swap': return 'SWAP';
      case 'placeLeft': return `LEFT(w:${action.newWidth})`;
      case 'placeRight': return `RIGHT(w:${action.newWidth})`;
      case 'placeTop': return `TOP(h:${action.newHeight})`;
      case 'placeBottom': return `BOTTOM(h:${action.newHeight})`;
      default: return 'Unknown';
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <h1 className={styles.title}>Dashboard</h1>
        <div className={styles.gridInfo}>
          {cols}×{Math.max(...layout.map(item => item.y + item.h), 4)} ({rowHeight}px)
        </div>
      </div>
      
      <div className={styles.debugPanel}>
        {dragState.active ? (
          <div className={styles.debugInfo}>
            <div className={styles.debugSection}>
              <span className={styles.debugLabel}>ID:</span>
              <span className={styles.debugValue}>{dragState.itemId || 'none'}</span>
              
              <span className={styles.debugLabel}>Mode:</span>
              <span className={styles.debugValue}>{dragState.isResize ? 'RESIZE' : 'MOVE'}</span>
              
              {draggedItem && (
                <>
                  <span className={styles.debugLabel}>Pos:</span>
                  <span className={styles.debugValue}>
                    {draggedItem.x},{draggedItem.y} ({draggedItem.w}×{draggedItem.h})
                  </span>
                </>
              )}
              
              {dragState.dropTarget?.dropAction && (
                <>
                  <span className={styles.debugLabel}>Action:</span>
                  <span className={styles.debugValue}>
                    {getActionDescription(dragState.dropTarget.dropAction)}
                  </span>
                </>
              )}
              
              {dropTargetArea && (
                <>
                  <span className={styles.debugLabel}>Target:</span>
                  <span className={styles.debugValue}>
                    {dropTargetArea.x},{dropTargetArea.y} ({dropTargetArea.w}×{dropTargetArea.h})
                  </span>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.statusMessage}>
            Ready | {layout.length} widgets
          </div>
        )}
      </div>
      
      <div className={styles.headerRight}>
        <div className={styles.addWidgetContainer}>
          <button 
            className={styles.addButton}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span>Add Widget</span>
            <svg className={styles.dropdownIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isMenuOpen && (
            <div className={styles.dropdown}>
              <ul>
                {widgetTypes.map(widget => (
                  <li key={widget.type}>
                    <button
                      className={styles.dropdownItem}
                      onClick={() => {
                        onAddWidget(widget.type);
                        setIsMenuOpen(false);
                      }}
                    >
                      {widget.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
