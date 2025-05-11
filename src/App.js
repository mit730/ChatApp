import './App.css';
import ChatApp from './Components/ChatApp';
import Home from './Components/Home';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import socketIO from 'socket.io-client';

// Initialize socket with token
const token = localStorage.getItem('token');
const socket = socketIO.connect(process.env.REACT_APP_SOCKET_URL, {
  auth: { token }
});

// A protected route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Home />} />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatApp socket={socket} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;