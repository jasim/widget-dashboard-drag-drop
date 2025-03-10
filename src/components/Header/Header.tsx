import { useState } from 'react'
import styles from './Header.module.css'

interface HeaderProps {
  onAddWidget: (type: string) => void;
}

const Header = ({ onAddWidget }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const widgetTypes = [
    { type: 'chart', label: 'Chart' },
    { type: 'stats', label: 'Stats' },
    { type: 'table', label: 'Table' },
    { type: 'text', label: 'Text' }
  ]

  return (
    <header className={styles.header}>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">React Dashboard</h1>
        
        <div className="relative">
          <button 
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-md flex items-center"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span>Add Widget</span>
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <ul className="py-1">
                {widgetTypes.map(widget => (
                  <li key={widget.type}>
                    <button
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        onAddWidget(widget.type)
                        setIsMenuOpen(false)
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
  )
}

export default Header
