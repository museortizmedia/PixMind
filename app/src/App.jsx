import './App.css'
import Navbar from './components/navbar';
import Dashboard from './pages/dashboard/dashboard';
import Home from './pages/home/home';
import Login from './pages/login/login';
import Register from './pages/register/register';

function App() {

  function CustomRouter() {
    const path = window.location.pathname;

    switch (path) {
      case "/":
        return <Home />;
      case "/login":
        return <Login />;
      case "/register":
        return <Register />;
      case "/dashboard":
        return <Dashboard />;
      default:
        return <Home />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
    <Navbar />
    <CustomRouter />
    </div>
  )
}

export default App
