"use client";
import React, {useEffect, useState} from "react";
import Image from "next/image";
import { FaHeart, FaComment } from "react-icons/fa6";
import { format } from "date-fns";
import Link from "next/link";
import Post from "@/app/components/post";

export default function Home() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetch("http://localhost:3001/auth/me", { credentials: "include" })
            .then((res) => res.json())
            .then((data) => {
                setUser(data)
            })
            .catch(() => setUser(null));

    }, []);
    const [newPostText, setNewPostText] = useState("");

    const submitNewPost = async (e) => {
        e.preventDefault();

        if(!newPostText.trim()){
            alert("Post cant be empty, dummy!")
            return;
        }

        try{
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts`, {
                method: "POST",
                body: JSON.stringify({post_text : newPostText}),
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            })
            setNewPostText("")
            window.location.reload();
        } catch(error){
            console.error(error);
            alert(error.message);
        }
    }

    const [posts, setPosts] = useState([]);
    const [offset, setOffset] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchPosts = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts?offset=${offset}`);
            const data = await res.json();
            if (data.length > 0) {
                setPosts(prevPosts => [...prevPosts, ...data]);
                setOffset(prevOffset => prevOffset + 10);
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
        }
        setLoading(false);

    };

    useEffect(() => {
        fetchPosts();
        console.log(posts);
    }, []);

    // infinite scroll
    useEffect(() => {
        let timeout; // Debounce timer
        const handleScroll = () => {
            if (loading) return;

            // Only fetch when user scrolls near the bottom (e.g., 300px from bottom)
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
                clearTimeout(timeout); // Reset debounce timer
                timeout = setTimeout(() => {
                    fetchPosts();
                }, 300); // Delay calls by 300ms to prevent spam
            }
        };
        console.log(posts);
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            clearTimeout(timeout);
        };
    }, [loading]);



    // const communities = [
    //     "Komunitas MARAH-MARAH",
    //     "Hello Kitty Fan Club",
    //     "Anti-social social club"
    // ]
  return (
    <>

        <div className="flex justify-center font-medium">

            <div className="w-full md:w-[80vw] lg:w-[60vw] xl:w-[50vw]">
                {user ? (
                    <form className="w-full bg-black flex flex-col p-5 pb-4 sm:pb-5 border-x border-b border-gray-600" onSubmit={submitNewPost}>
                        <div className="w-full flex gap-5 items-center">
                            <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 " >
                                <Image src={user.avatar_url || "/defaultpfp.png"} className="rounded-full" alt="" fill/>
                            </div>
                            <div>
                                <textarea placeholder={`Welcome, ${user.name}! confess here...`}
                                       className="outline-0 placeholder-gray-400 text-md sm:text-xl text-white w-[90%] w-full"
                                       value={newPostText} onChange={(e) => setNewPostText(e.target.value)}></textarea>
                            </div>
                        </div>
                        <div className="flex justify-between pt-4 sm:px-5 sm:pt-6">
                            {/* havent setup value or controlled state*/}
                            <div className="flex items-center gap-1">
                            <div className="text-gray-500 text-sm sm:text-xl">Post for </div>
                                {/*<select name="community" className="text-white border-1 border-gray-600 px-3 py-1 rounded-4xl w-28">*/}
                                {/*    <option value="null">everyone</option>*/}
                                {/*    {communities.map((item, index) => (*/}
                                {/*        <option key={index}>{item}</option>*/}
                                {/*    ))}*/}
                                {/*</select>*/}
                            </div>

                            <button type="submit"
                                    className="bg-white flex w-max px-6 py-1 sm:px-8  sm:py-1.5 rounded-4xl text-sm sm:text-lg">Post
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="w-full bg-black text-white text-center p-4 border-x border-b border-gray-600">You need to log in to post</div>
                )}
                { posts ? (posts.map((post, index) => (
                    <Post key={index} post_id={post.post_id} avatar_url={post.avatar_url} post_text={post.post_text} name={post.name} created_at={post.created_at}
                          like_count={post.like_count} comment_count={post.comment_count} user={user}/>
                ))) : ""}
            </div>
        </div>
    </>
  );
}
