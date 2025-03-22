"use client";
import React, {useState} from 'react';
import Image from "next/image";
import {format} from "date-fns";
import {FaComment, FaHeart} from "react-icons/fa6";
import Link from "next/link";
import {motion} from "framer-motion";

function Post(props) {
    const post_id = props.post_id || "";
    const avatar_url = props.avatar_url || "/defaultpfp.png";
    const post_text = props.post_text || "";
    const name = props.name || "";
    const created_at = props.created_at || new Date();
    //const like_count = props.like_count || " ";
    const [like_count, setLike_count] = useState(props.like_count || 0);
    const comment_count = props.comment_count || " ";
    const user = props.user || null;

    const likePost = async () => {
        if (!user) {
            alert("u have to log in to like!!!!")
            return;
        }
        try{
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/likes`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    post_id: post_id,
                })
            })
            if (!res.ok) {
                throw new Error("Failed to fetch likes");
            }
            const data = await res.json();
            setLike_count(data.like_count);

        } catch(error){
            console.log(error);
        }
    }

    return (
        <>
            <Link href={`/post/${post_id}`} className="w-full bg-black flex flex-col px-5 py-3 text-white border-x border-b border-gray-600">
                <div className="w-full flex gap-5 items-start sm:items-center">
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 mt-1 sm:mt-0">
                        <Image src={avatar_url} className="rounded-full" alt="" fill/>
                    </div>
                    <div className="text-md sm:text-xl gap-2">
                        <div className="flex gap-3 items-baseline">
                            <div className="font-extrabold">{name}</div>
                            <div className="text-sm text-gray-500">{format(new Date(created_at), "hh:mm")}</div>
                        </div>
                        <div>{post_text}</div>
                    </div>
                </div>
                <div className="flex justify-between mx-auto gap-14 sm:gap-0 sm:ml-18 sm:mr-10 mt-3.5 sm:mt-4 text-gray-500 items-center">
                    <div className="flex gap-10 sm:gap-8 text-lg">
                        <motion.div className="flex items-center gap-2 sm:gap-3 font-mono"
                             onClick={(e) => {
                                 e.preventDefault();
                                 likePost();
                             }}
                                    whileHover={{scale:1.15}}
                                    whileTap={{scale:1.15, translateY:-6}}
                        ><FaHeart size="1.45em"/> {like_count}</motion.div>
                        <motion.div className="flex items-center gap-2 sm:gap-3 font-mono"
                        ><FaComment size="1.45em"/> {comment_count}</motion.div>
                    </div>
                    <div className="text-sm sm:text-md">{format(new Date(created_at), "d MMMM yyyy")}</div>
                </div>
            </Link>
        </>
    );
}

export default Post;