import { Outlet } from "react-router-dom";
import SideBar from "../Components/SideBar";

function UserLayout() {
  return (
    <div  className="flex min-h-screen">

      <SideBar/>
      <main className="flex-1">
      <Outlet/>
      </main>
    </div>
  );
}

export default UserLayout;