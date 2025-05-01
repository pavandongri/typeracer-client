import { Link } from "react-router-dom";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { UserCircleIcon, MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom"

const user = JSON.parse(localStorage.getItem('user'))

const Navbar = ({ darkMode, setDarkMode }) => {
    const navigate = useNavigate()

    const logoutUser = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        navigate("/signin")
    }

    return (
        <nav className="bg-transparent dark:bg-slate-900 shadow-sm px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-none">

            <Link to="/">
                <img
                    className="h-[30px] w-[50px] sm:h-[45px] sm:w-[60px] rounded-[10px] border border-grey"
                    src="/typer.jpeg"
                    alt="typer-logo"
                />
            </Link>


            <Link to="/" className="ml-2 mr-2 font-bold text-[20px] sm:text-[30px] text-gray-900 dark:text-white">
                Typeracer
            </Link>

            <div className="flex items-center space-x-4">
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="text-gray-900 dark:text-white hover:text-yellow-400 transition"
                >
                    {darkMode ? <SunIcon className="sm:h-8 sm:w-8 h-6 w-6" /> : <MoonIcon className="sm:h-8 sm:w-8 h-6 w-6" />}
                </button>

                <Menu as="div" className="relative inline-block text-left">
                    <MenuButton className="flex items-center space-x-1">
                        <UserCircleIcon className="sm:h-10 sm:w-10 h-8 w-8  text-gray-900 dark:text-white" />
                    </MenuButton>
                    <Transition
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <MenuItems className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="py-1">
                                <MenuItem>
                                    <span className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                                        {user?.username || "guest"}
                                    </span>
                                </MenuItem>
                                <MenuItem>
                                    {() => (
                                        <button onClick={logoutUser} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-slate-700">
                                            Logout
                                        </button>
                                    )}
                                </MenuItem>
                            </div>
                        </MenuItems>
                    </Transition>
                </Menu>
            </div>
        </nav>
    );
};

export default Navbar;



