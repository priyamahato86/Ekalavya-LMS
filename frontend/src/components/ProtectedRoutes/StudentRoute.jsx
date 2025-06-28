import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';

const StudentRoute = ({ children }) => {
  const { userData } = useContext(AppContext);
  if (!userData || userData.role !== 'student') {
    return <Navigate to="/" />;
  }
  return children;
};

export default StudentRoute;
