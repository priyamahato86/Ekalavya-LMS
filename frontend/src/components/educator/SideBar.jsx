import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import { NotebookPen, Shapes, FileCheck,UserRoundCheck,SquarePlus } from "lucide-react";

const Sidebar = () => {
  const { isEducator } = useContext(AppContext);
  const menuItems = [
    { name: "Dashboard", path: "/educator", icon: assets.home_icon },
    { name: "Course", path: "/educator/course", icon: <SquarePlus /> },
    {
      name: "Assignments",
      path: "/educator/assignment",
      icon: <NotebookPen />,
    },
    { name: "Quizz", path: "/educator/quiz", icon: <Shapes /> },
    {
      name: "Students Enrolled",
      path: "/educator/students-enrolled",
      icon: <UserRoundCheck />,
    },
    {
      name: "Submitted ",
      path: "/educator/submitted-assignments",
      icon: <FileCheck />,
    },
  ];
  return (
    isEducator && (
      <div className="md:w-64 w-16 border-r min-h-screen text-base border-gray-500 py-2 flex flex-col">
        {menuItems.map((item) => (
          <NavLink
            to={item.path}
            key={item.name}
            end={item.path === "/educator"}
            className={({ isActive }) =>
              `flex items-center md:flex-row flex-col md:justify-start justify-center py-3.5 md:px-10 gap-3  ${
                isActive
                  ? "bg-indigo-50 border-r-[6px] border-indigo-500/90"
                  : "hover:bg-gray-100/90 border-r-[6px] border-white hover:border-gray-100/90"
              }`
            }
          >
            {/* <img src={item.icon} alt="" className="w-6 h-6" /> */}
            {typeof item.icon === "string" ? (
              <img
                src={item.icon}
                alt={item.name}
                className="w-5 h-5 text-black fomt-bold"
              />
            ) : (
              item.icon
            )}
            <p className="md:block hidden text-center">{item.name}</p>
          </NavLink>
        ))}
      </div>
    )
  );
};

export default Sidebar;
