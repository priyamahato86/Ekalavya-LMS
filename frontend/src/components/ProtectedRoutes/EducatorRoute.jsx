import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';

const EducatorRoute = ({ children }) => {
  const { userData } = useContext(AppContext);
  if (!userData || userData.role !== 'educator') {
    return <Navigate to="/" />;
  }
  return children;
};

export default EducatorRoute;
