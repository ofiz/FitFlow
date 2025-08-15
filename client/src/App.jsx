import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Register from './pages/Auth/Register'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        {/* Routes - זה מחליף את ה-useState */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App;