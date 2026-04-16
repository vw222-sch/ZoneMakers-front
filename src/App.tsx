import { Route, Routes } from 'react-router';

import Layout from '@/pages/Layout';
import Home from '@/pages/main/Home';
import Map from '@/pages/main/Map';
import Chat from '@/pages/main/Chat';
import Chatroom from '@/pages/side/Chatroom';
import News from '@/pages/main/News';
import Support from '@/pages/main/Support';

import Login from '@/pages/side/Login';
import Signup from '@/pages/side/Signup';
import UserDetails from '@/pages/side/UserDetails';
import Notifications from '@/pages/main/Notifications';
import Admin from '@/pages/Admin';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path='news' element={<News />} />
        <Route path='support' element={<Support />} />
        <Route path='notifications' element={<Notifications />} />
        <Route path='chat/:id' element={<Chatroom />} />
      </Route>

      <Route path='chat' element={<Chat />} />
      <Route path='map' element={<Map />} />
      <Route path='login' element={<Login />} />
      <Route path='signup' element={<Signup />} />
      <Route path='user-details' element={<UserDetails />} />
      <Route path='admin' element={<Admin />} />
    </Routes>
  );
}