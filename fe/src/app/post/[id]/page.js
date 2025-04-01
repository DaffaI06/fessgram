"use client";
import React, {use, useCallback, useEffect, useState} from 'react';
import Image from "next/image";
import {format} from "date-fns";
import {FaComment, FaHeart} from "react-icons/fa6";
import {motion} from "framer-motion";
import Post from "@/app/components/post";
import {IoIosArrowBack} from "react-icons/io";
import Link from "next/link";

function Page(props) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`, { credentials: "include" })
            .then((res) => res.json())
            .then((data) => {
                setUser(data)
            })
            .catch(() => setUser(null));

    }, []);

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const {id} = use(props.params)
    const fetchPost = useCallback(async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/${id}`);
            const data = await res.json();
            setPost(data.post);
            setLike_count(data.post.like_count);
            setComments(data.comments);
        } catch (error) {
            console.error("Error fetching post:", error);
            setPost(null);
        }
    },[id])
    useEffect(() => {
        fetchPost();
    }, [fetchPost]);

    const [postText, setPostText] = useState("");
    useEffect(() => {
        if (post) {
            setPostText(post.post_text);
        }
    }, [post]);

    const submitChanges = async (e) => {
        e.preventDefault();

        try {
            await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/${post.post_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ post_text: postText })
            });

            window.location.reload();
        } catch (error) {
            console.error("Failed to update post:", error);
        }
    };

    const deletePost = async () => {
        if (!window.confirm("delete? frfr?")) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/${post.post_id}`, {
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

            window.location.href = "/";
        } catch (error) {
            console.error("Failed to delete post:", error);
        }
    };

    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {

        if (user && post) {
            setIsOwner(user.email === post.posted_by);
        } else {
            setIsOwner(false);
        }
    }, [user, post]);

    const [like_count, setLike_count] = useState(post?.like_count || 0);
    const comment_count = post?.comment_count || 0;

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

    const [newCommentText, setNewCommentText] = useState("");

    const submitComment = async (e) => {
        e.preventDefault();

        if(!newCommentText.trim()){
            alert("Post cant be empty, dummy!")
            return;
        }

        try{
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/${post.post_id}`, {
                method: "POST",
                body: JSON.stringify({post_text : newCommentText}),
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            })


            setNewCommentText("")
            window.location.reload();
        } catch(error){
            console.error(error);
            alert(error.message);
        }
    }

    return (
        <>
            <div className="flex justify-center font-medium">
                <div className="w-full md:w-[80vw] lg:w-[60vw] xl:w-[50vw]">
                    {post ? (
                        <>
                            <form
                                className="w-full bg-black flex flex-col px-5 py-3 text-white border-x border-gray-600"
                                onSubmit={submitChanges}>
                                <Link href={post.parent_id ? `/post/${post.parent_id}` : `/`} className="w-full flex pb-3 sm:pb-6 text-md sm:text-xl font-medium gap-4 items-center">
                                    <IoIosArrowBack />
                                    <div>Back</div>
                                </Link>
                                <div className="w-full flex gap-5 items-center">
                                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 mt-1 sm:mt-0">
                                        <Image src={post.avatar_url || "/defaultpfp.png"} className="rounded-full"
                                               alt=""
                                               fill/>
                                    </div>
                                    <div className="text-md sm:text-xl gap-2 flex-1">
                                        <div className="flex gap-3 items-baseline">
                                            <div className="font-extrabold">{post.name}</div>
                                            <div
                                                className="text-sm text-gray-500">{format(new Date(post.created_at), "hh:mm")}</div>
                                        </div>
                                        {isOwner ? (
                                            <textarea value={postText}
                                                   onChange={(e) => setPostText(e.target.value)} rows="1"
                                                   className="outline-0 placeholder-gray-400 w-[95%] sm:w-[80%] text-md sm:text-xl text-white rounded-xl bg-gray-800 pl-3 p-1 resize-none overflow-hidden"
                                                   onInput={(e) => {
                                                      e.target.style.height = "auto";
                                                      e.target.style.height = `${e.target.scrollHeight}px`;
                                                   }}
                                            />
                                        ) : (
                                            <div>{post.post_text}</div>
                                        )}
                                    </div>
                                </div>
                                <div
                                    className="flex justify-between mx-auto gap-10 sm:gap-0 sm:ml-18 sm:mr-10 mt-4 sm:my-4 text-gray-500 items-center">
                                    <div className="flex gap-10 sm:gap-8 text-lg">
                                        <motion.div
                                            className="flex items-center gap-2 sm:gap-3 font-mono cursor-pointer"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                likePost();
                                            }}
                                            whileHover={{scale: 1.15}}
                                            whileTap={{scale: 1.15, translateY: -6}}
                                        ><FaHeart size="1.45em"/> {like_count}</motion.div>
                                        <motion.div className="flex items-center gap-2 sm:gap-3 font-mono"
                                                    whileHover={{scale: 1.15}}
                                                    whileTap={{scale: 1.15, translateY: -6}}
                                        ><FaComment size="1.45em"/> {comment_count}</motion.div>
                                    </div>
                                    <div
                                        className="text-sm sm:text-md">{format(new Date(post.created_at), "d MMMM yyyy")}</div>
                                </div>

                                {isOwner ? (
                                    <div
                                        className="flex text-center font-medium text-sm sm:text-xl sm:px-5 mt-4 mb-2 sm:mb-4 gap-6 sm:gap-16">
                                        <button onClick={deletePost}
                                                className="bg-red-500 w-[50%]  rounded-full py-2 sm:p-2 cursor-pointer">Delete
                                        </button>
                                        <button type="submit"
                                                className="bg-white w-[50%] text-black rounded-full py-2 sm:p-2 cursor-pointer">Save
                                            Changes
                                        </button>
                                    </div>

                                ) : ""}
                            </form>
                            <div className="border-t-gray-600 border-t-1 w-[95%] mx-auto flex"></div>
                            {user ? (
                                <form
                                    className="w-full bg-black flex flex-col p-5 pb-4 sm:pb-7 border-x border-b border-gray-600"
                                    onSubmit={submitComment}>
                                    <div className="w-full flex gap-5">
                                        <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 ">
                                            <Image src={user.avatar_url || "/defaultpfp.png"} className="rounded-full"
                                                   alt="" fill/>
                                        </div>
                                        <div className="flex-1">
                                            <textarea placeholder={`Write a comment...`} value={newCommentText} rows="1"
                                                      className="outline-0 placeholder-gray-400 text-md sm:text-xl text-white w-[90%] w-full resize-none overflow-hidden"
                                                      onChange={(e) => setNewCommentText(e.target.value)}
                                                      onInput={(e) => {
                                                          e.target.style.height = "auto";
                                                          e.target.style.height = `${e.target.scrollHeight}px`;
                                                      }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end sm:justify-center pt-4 sm:pt-6 sm:px-5">

                                        <button type="submit"
                                                className="bg-white flex w-max px-6 py-1 sm:px-16  sm:py-1.5 rounded-4xl text-sm sm:text-xl">Post
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div
                                    className="w-full bg-black text-white text-center p-4 border-x border-b border-gray-600">You
                                    need to log in to comment</div>
                            )}
                            {comments ? (comments.map((comment, index) => (
                                <Post key={index} post_id={comment.post_id} avatar_url={comment.avatar_url} post_text={comment.post_text} name={comment.name} created_at={comment.created_at}
                                      like_count={comment.like_count} comment_count={comment.comment_count} user={user}/>
                            ))) : (
                                <div className="font-medium text-white text-center text-xl my-12">No comments yet</div>
                            )}
                        </>
                    ) : ""}
                </div>
            </div>
        </>
    );
}

export default Page;