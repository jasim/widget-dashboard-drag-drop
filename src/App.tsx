import {useState} from 'react'
import Dashboard from './components/Dashboard/Dashboard'
import {WidgetType} from './types'

function App() {
  const [widgets, setWidgets] = useState<WidgetType[]>([
    {id: '1', type: 'text', title: 'Welcome Message', x: 0, y: 0, w: 6, h: 2},
    {id: '6', type: 'table', title: 'Data Analysis', x: 7, y: 0, w: 6, h: 3},
    {id: '3', type: 'table', title: 'Recent Transactions', x: 16, y: 0, w: 8, h: 3},
    {id: '4', type: 'stats', title: 'Performance Stats', x: 0, y: 3, w: 4, h: 3},
    {id: '2', type: 'stats', title: 'Key Metrics', x: 8, y: 4, w: 6, h: 3},
  ])

  const addWidget = (type: string) => {
    const newWidget: WidgetType = {
      id: Date.now().toString(),
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      x: 0,
      y: 0,
      w: 4,
      h: 3
    }
    setWidgets([...widgets, newWidget])
  }

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(widget => widget.id !== id))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow p-4">
        <Dashboard
          onAddWidget={addWidget}
          widgets={widgets}
          setWidgets={setWidgets}
          onRemoveWidget={removeWidget}
        />
      </main>
    </div>
  )
}

export default App
