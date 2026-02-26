import { Route, Routes } from 'react-router';

import Layout from '@/pages/Layout';
import Home from '@/pages/Home';
import Map from '@/pages/Map';
import Chat from '@/pages/Chat';
import News from '@/pages/News';
import Support from '@/pages/Support';

import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import UserDetails from '@/pages/UserDetails';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path='chat' element={<Chat />} />
        <Route path='news' element={<News />} />
        <Route path='support' element={<Support />} />
      </Route>

      <Route path='map' element={<Map />} />
      <Route path='login' element={<Login />} />
      <Route path='signup' element={<Signup />} />
      <Route path='user-details' element={<UserDetails />} />
    </Routes>
  );
}