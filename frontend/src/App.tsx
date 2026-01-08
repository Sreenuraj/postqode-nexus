import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<div>PostQode Nexus - Coming Soon</div>} />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </Router>
  )
}

export default App
