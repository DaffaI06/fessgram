"use client";
import React, {useEffect, useState} from 'react';
import { FaGoogle } from "react-icons/fa";
import Link from "next/link";
import {motion} from "framer-motion"

function Navbar(props) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetch("http://localhost:3001/auth/me", { credentials: "include" })
            .then((res) => res.json())
            .then((data) => setUser(data.email ? data : null))
            .catch(() => setUser(null));
    }, []);

    const handleLogout = async () => {
        await fetch("http://localhost:3001/auth/logout", { credentials: "include" });
        setUser(null);
        window.location.reload();
    };
    return (
        <>
            <div
                className="w-full sticky top-0 bg-black text-white font-medium border-b border-gray-600 transition-all">
                <div className="w-[65vw] mx-auto flex justify-between items-center p-6">
                    <Link href="/" className="font-extrabold text-xl cursor-pointer">
                        <motion.div whileHover={{scale:1.1}} whileTap={{scale:0.9}}><span className="text-red-400">Fess</span>gram</motion.div>

                    </Link>
                    <div className="flex gap-8">
                        <Link href="/"><motion.div whileHover={{scale:1.1}} whileTap={{scale:0.9}}>Home</motion.div>
                        </Link>
                        <Link href="/"><motion.div whileHover={{scale:1.1}} whileTap={{scale:0.9}}>Community</motion.div>
                        </Link>
                        <Link href="/"><motion.div whileHover={{scale:1.1}} whileTap={{scale:0.9}}>Your Profile</motion.div>
                            </Link>
                    </div>
                    {user ? (
                        <div
                            className="cursor-pointer flex items-center gap-2 text-red-500 text-lg"
                            onClick={handleLogout}
                        >
                            <FaGoogle/>
                            <div>Logout</div>
                        </div>
                    ) : (
                        <a
                            href="http://localhost:3001/auth/google"
                            className="cursor-pointer flex items-center gap-2 text-blue-500 text-xl"
                        >
                            <FaGoogle/>
                            <div>Login</div>
                        </a>
                    )}
                </div>
            </div>

        </>
    );
}

export default Navbar;