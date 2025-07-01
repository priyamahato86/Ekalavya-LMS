import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import Loading from "../student/Loading";

const EducatorRoute = ({ children }) => {
  const { userData, isUserLoading } = useContext(AppContext);
  if (isUserLoading) {
    return <Loading />;
  }
  if (!userData || userData.role !== "educator") {
    return <Navigate to="/" />;
  }
  return children;
};

export default EducatorRoute;
