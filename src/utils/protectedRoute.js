import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const isTokenExpired = (token) => {
    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    } catch (error) {
        return true;
    }
};

const ProtectedRoute = ({ element }) => {
    const token = localStorage.getItem("token");

    if (!token || isTokenExpired(token)) {
        return <Navigate to="/signin" />;
    }

    return React.cloneElement(element);
};

export default ProtectedRoute;
