import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router'
import { toast } from "react-toastify";

const API_URL = process.env.REACT_APP_API_URL

const SignIn = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) return

        try {
            const res = await axios.post(API_URL + "/users/login", {
                email: formData.email,
                password: formData.password,
            });

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));

            toast.success("Login successful")

            navigate("/");
        } catch (error) {
            const errMsg = error.response?.data?.error || "Login failed";
            toast.error(errMsg)
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-800 flex items-center justify-center">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg px-6 py-8 ring shadow-xl ring-gray-900/5">
                <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">Sign In</h2>
                <form onSubmit={handleSubmit}>
                    {/* Email */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="email">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full mt-2 p-3 border rounded-md dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    {/* Password */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="password">
                            Password
                        </label>
                        <div className="relative mt-2">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-white pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-500"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        Sign In
                    </button>
                </form>

                {/* Sign Up Link */}
                <div className="mt-4 text-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-blue-600 hover:text-blue-800 ml-2">
                            Sign Up
                        </Link>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
