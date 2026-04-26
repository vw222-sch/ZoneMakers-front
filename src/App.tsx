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

import AdminLayout from '@/pages/admin/AdminLayout';
import AdminSupport from '@/pages/admin/AdminSupport';
import AdminZones from '@/pages/admin/AdminZones';
import AdminZoneReports from './pages/admin/AdminZoneReports';
import AdminUserReports from './pages/admin/AdminUserReports';
import AdminPostReports from './pages/admin/AdminPostReports';
import AdminUserSearch from './pages/admin/AdminUserSearch';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path='news' element={<News />} />
        <Route path='support' element={<Support />} />
        <Route path='notifications' element={<Notifications />} />
        <Route path='chat/:regionId' element={<Chatroom />} />
      </Route>

      <Route path='chat' element={<Chat />} />
      <Route path='map' element={<Map />} />
      <Route path='login' element={<Login />} />
      <Route path='signup' element={<Signup />} />
      <Route path='user-details/:userId' element={<UserDetails />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminSupport />} />
        <Route path="support" element={<AdminSupport />} />
        <Route path="zones" element={<AdminZones />} />
        <Route path="zone-reports" element={<AdminZoneReports />} />
        <Route path="user-reports" element={<AdminUserReports />} />
        <Route path="post-reports" element={<AdminPostReports />} />
        <Route path="user-search" element={<AdminUserSearch />} />
      </Route>
    </Routes>
  );
}