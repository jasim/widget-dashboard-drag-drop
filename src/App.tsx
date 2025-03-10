import {useState} from 'react'
import Dashboard from './components/Dashboard/Dashboard'
import {WidgetType} from './types'

function App() {
  const [widgets, setWidgets] = useState<WidgetType[]>([
    {id: '1', type: 'chart', title: 'Sales Overview', x: 0, y: 0, w: 2, h: 2},
    {id: '2', type: 'stats', title: 'Key Metrics', x: 6, y: 0, w: 6, h: 2},
    {id: '3', type: 'table', title: 'Recent Transactions', x: 4, y: 2, w: 3, h: 3},
    {id: '4', type: 'chart', title: 'Monthly Revenue', x: 0, y: 4, w: 4, h: 4},
    {id: '5', type: 'chart', title: 'User Growth', x: 5, y: 5, w: 5, h: 4},
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
