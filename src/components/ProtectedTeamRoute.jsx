import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedTeamRoute = ({ children }) => {
    const { team } = useSelector((state) => state.team);

    if (!team) {
        return <Navigate to="/team/login" />;
    }

    return children;
};

export default ProtectedTeamRoute;