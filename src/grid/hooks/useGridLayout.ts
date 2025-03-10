import { useState, useEffect } from 'react';
import { Layout, WidgetType } from '../../types';
import { widgetsToLayout, layoutToWidgets } from '../layout';

interface UseGridLayoutProps {
  widgets: WidgetType[];
  setWidgets: React.Dispatch<React.SetStateAction<WidgetType[]>>;
  compactType?: 'vertical' | 'horizontal' | null;
}

export const useGridLayout = ({ 
  widgets, 
  setWidgets,
  compactType = null 
}: UseGridLayoutProps) => {
  const [layout, setLayout] = useState<Layout[]>([]);

  // Initialize layout from widgets
  useEffect(() => {
    setLayout(widgetsToLayout(widgets));
  }, [widgets]);

  // Update layout
  const updateLayout = (newLayout: Layout[]) => {
    setLayout(newLayout);
  };

  // Apply layout changes to widgets
  const applyLayout = () => {
    setWidgets(layoutToWidgets(widgets, layout));
  };

  return {
    layout,
    updateLayout,
    applyLayout
  };
};
