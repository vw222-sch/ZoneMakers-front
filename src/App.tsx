import { Route, Routes } from 'react-router';
import './App.css'
import Home from './pages/Home';
import Layout from './pages/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserDetails from './pages/UserDetails';
import Support from './pages/Support';
import News from './pages/News';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path='support' element={<Support />} />
        <Route path='news' element={<News />} />
      </Route>

      <Route path='login' element={<Login />} />
      <Route path='signup' element={<Signup />} />
      <Route path='user-details' element={<UserDetails />} />
    </Routes>
  );
}