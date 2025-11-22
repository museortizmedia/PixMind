import './App.css'
import Navbar from './components/navbar';
import Dashboard from './pages/dashboard/dashboard';
import Home from './pages/home/home';
import Login from './pages/login/login';
import Register from './pages/register/register';
import DocsPage from './pages/docs/DocsPage';;

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
    case "/docs":
      return <DocsPage/>;
    default:
      return <Home />;
  }
}

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      <Navbar />
      <CustomRouter />
    </div>
  )
}

export default App
