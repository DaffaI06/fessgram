"use client";
import React, {useEffect, useState} from 'react';
import { FaGoogle } from "react-icons/fa";
import Link from "next/link";
import {motion} from "framer-motion";
import { MdMenu } from "react-icons/md";

function Navbar(props) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`, { credentials: "include" })
            .then((res) => res.json())
            .then((data) => setUser(data.email ? data : null))
            .catch(() => setUser(null));
    }, []);

    const handleLogout = async () => {
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, { credentials: "include" });
        setUser(null);
        window.location.reload();
    };

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    //not using a separate function makes it infinitely render somehow
    const OpenMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    }

    return (
        <>
            <div
                className="w-full sticky top-0 bg-black text-white font-medium border-b border-gray-700 transition-all z-10">
                <div className="w-[90vw] md:w-[80vw] xl:w-[65vw] mx-auto flex justify-between items-center p-2 sm:p-6 py-4 sm:py-6 sm:pl-0">
                    <Link href="/" className="font-extrabold text-xl cursor-pointer">
                        <motion.div whileHover={{scale:1.1}} whileTap={{scale:0.9}}><span className="text-red-400">Fess</span>gram</motion.div>

                    </Link>
                    <div className="hidden sm:flex gap-8">
                        <Link href="/"><motion.div whileHover={{scale:1.1}} whileTap={{scale:0.9}}>Home</motion.div>
                        </Link>
                        <Link href="/community"><motion.div whileHover={{scale:1.1}} whileTap={{scale:0.9}}>Community</motion.div>
                        </Link>
                    </div>
                    {user ? (
                        <div
                            className="cursor-pointer hidden sm:flex items-center gap-2 text-red-500 text-lg"
                            onClick={handleLogout}
                        >
                            <FaGoogle/>
                            <div>Logout</div>
                        </div>
                    ) : (
                        <a
                            href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google`}
                            className="cursor-pointer hidden sm:flex items-center gap-2 text-blue-500 text-xl"
                        >
                            <FaGoogle/>
                            <div>Login</div>
                        </a>
                    )}
                    <div className="sm:hidden" onClick={OpenMenu}><MdMenu size="24"/></div>
                </div>
            </div>

        </>
    );
}

export default Navbar;