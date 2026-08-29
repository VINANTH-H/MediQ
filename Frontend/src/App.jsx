import { Routes, Route } from 'react-router-dom';

import ChatPage from './Pages/ChatPage';
import DoctorsPage from './Pages/DoctorsPage';
import MyAppointmentsPage from './Pages/MyAppointmentsPage';
import ProfilePage from './Pages/ProfilePage';
import UserLayout from './Layouts/userLayout';


function App() {
  return (
    <Routes>
      <Route path="/user" element ={<UserLayout/>}>

      <Route path="chat" element={<ChatPage />} />

      <Route path="doctors" element={<DoctorsPage />} />

      <Route
        path="appointments"
        element={<MyAppointmentsPage />}
      />
      <Route path="profile" element={<ProfilePage/>}/>
      </Route>
    </Routes>
  );
}

export default App;