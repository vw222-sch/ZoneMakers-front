import { Route, Routes } from 'react-router';
import './App.css'
import Home from './pages/Home';
import Layout from './pages/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserDetails from './pages/UserDetails';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path='user-details' element={<UserDetails />} />
      </Route>

      <Route path='login' element={<Login />} />
      <Route path='signup' element={<Signup />} />
    </Routes>
  );
}