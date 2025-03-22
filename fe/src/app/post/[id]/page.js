"use client";
import React, {use, useEffect, useState} from 'react';
import Image from "next/image";
import {format} from "date-fns";
import {FaComment, FaHeart} from "react-icons/fa6";
import {motion} from "framer-motion";

function Page(props) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetch("http://localhost:3001/auth/me", { credentials: "include" })
            .then((res) => res.json())
            .then((data) => {
                setUser(data)
            })
            .catch(() => setUser(null));

    }, []);

    const [post, setPost] = useState(null);
    const {id} = use(props.params)
    const fetchPost = async () => {
        try {
            const res = await fetch(`http://localhost:3001/posts/${id}`);
            const data = await res.json();
            setPost(data);
            setLike_count(data.like_count);
        } catch (error) {
            console.error("Error fetching post:", error);
            setPost(null);
        }
    };
    useEffect(() => {
        fetchPost();
    }, []);

    const [postText, setPostText] = useState("");
    useEffect(() => {
        if (post) {
            setPostText(post.post_text);
        }
    }, [post]);

    const submitChanges = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`http://localhost:3001/posts/${post.post_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ post_text: postText })
            });

            if (!response.ok) {
                let errorMessage = "An error occurred";
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (jsonError) {
                    console.error("Failed to parse error response:", jsonError);
                }
                console.error("Error updating post:", errorMessage);
                return;
            }

            const updatedPost = await response.json();
            setPostText(updatedPost.post_text);
            console.log("Post updated successfully:", updatedPost);
        } catch (error) {
            console.error("Failed to update post:", error);
        }
    };

    const deletePost = async () => {
        if (!window.confirm("delete? frfr?")) return;

        try {
            const response = await fetch(`http://localhost:3001/posts/${post.post_id}`, {
                method: "DELETE",
                credentials: "include"
            });

            if (!response.ok) {
                let errorMessage = "An error occurred";
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (jsonError) {
                    console.error("Failed to parse error response:", jsonError);
                }
                console.error("Error deleting post:", errorMessage);
                return;
            }

            console.log("Post deleted successfully");
            window.location.href = "/";
        } catch (error) {
            console.error("Failed to delete post:", error);
        }
    };

    useEffect(() => {
        console.log(post)
        console.log(user)
    },[post,user])

    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {

        if (user && post) {
            setIsOwner(user.email === post.posted_by);
        } else {
            setIsOwner(false);
        }
    }, [user, post]);

    const [like_count, setLike_count] = useState(post?.like_count || 0);
    const comment_count = 0;

    const likePost = async () => {
        try{
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/likes`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    post_id: post.post_id,
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
            <div className="flex justify-center font-medium">
                <div className="w-full md:w-[80vw] lg:w-[60vw] xl:w-[50vw]">
                    {post ? (
                        <form
                            className="w-full bg-black flex flex-col px-5 py-3 text-white border-x border-b border-gray-600"
                            onSubmit={submitChanges}>
                            <div className="w-full flex gap-5 items-center">
                                <div>
                                    <Image src={post.avatar_url || "/defaultpfp.png"} className="rounded-full" alt=""
                                           width={48} height={48}/>
                                </div>
                                <div className="text-xl gap-2">
                                    <div className="flex gap-3 items-baseline">
                                        <div className="font-extrabold">{post.name}</div>
                                        <div className="text-sm text-gray-500">{format(new Date(post.created_at), "hh:mm")}</div>
                                    </div>
                                    {isOwner ? (
                                        <input type="text" value={postText} onChange={(e) => setPostText(e.target.value)}
                                               className="outline-0 placeholder-gray-400 text-xl text-white rounded-md"/>
                                    ) : (
                                        <div>{post.post_text}</div>
                                    )}

                                </div>
                            </div>
                            <div className="flex justify-between mx-18 mt-4 text-gray-500">
                                <div className="flex gap-8 text-xl">
                                    <motion.div className="flex items-center gap-3 font-mono"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    likePost();
                                                }}
                                                whileHover={{scale: 1.15}}
                                                whileTap={{scale: 1.15, translateY: -6}}
                                    ><FaHeart size={26}/> {like_count}</motion.div>
                                    <motion.div className="flex items-center gap-3 font-mono"
                                    ><FaComment size={26}/> {comment_count}</motion.div>
                                </div>
                                <div>{format(new Date(post.created_at), "d MMMM yyyy")}</div>
                            </div>

                            {isOwner ? (
                                <div className="flex text-center font-medium text-xl px-5 my-4 gap-16">
                                    <button onClick={deletePost}
                                            className="bg-red-500 w-[50%]  rounded-full p-2 cursor-pointer">Delete
                                    </button>
                                    <button type="submit"
                                            className="bg-white w-[50%] text-black rounded-full p-2 cursor-pointer">Save
                                        Changes
                                    </button>
                                </div>

                            ) : ""}

                        </form>
                    ) : ""}
                </div>=
            </div>
        </>
    );
}

export default Page;