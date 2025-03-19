"use client";
import React, {useEffect, useState} from "react";
import Image from "next/image";
import { FaHeart, FaComment } from "react-icons/fa6";
import { format } from "date-fns";
import Link from "next/link";

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
            const response = await fetch("http://localhost:3001/posts", {
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
            const res = await fetch(`http://localhost:3001/posts?offset=${offset}`);
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

            <div className="h-[100vh] w-full md:w-[80vw] lg:w-[60vw] xl:w-[50vw] bg-yellow-200">
                {user ? (
                    <form className="w-full bg-black flex flex-col p-5 border-x border-b border-gray-600" onSubmit={submitNewPost}>
                        <div className="w-full flex gap-5 items-center">
                            <div>
                                <Image src={user.avatar_url || "/defaultpfp.png"} className="rounded-full" alt="" width={56} height={56} />
                            </div>
                            <div>
                                <input type="text" placeholder={`Welcome, ${user.name}! confess here...`} className="outline-0 placeholder-gray-400 text-xl text-white"
                                           value={newPostText} onChange={(e) => setNewPostText(e.target.value)}></input>
                            </div>
                        </div>
                        <div className="flex justify-between px-5 pt-6">
                            {/* havent setup value or controlled state*/}
                            <div className="flex items-center gap-1">
                                <div className="text-gray-500">Post for </div>
                                {/*<select name="community" className="text-white border-1 border-gray-600 px-3 py-1 rounded-4xl w-28">*/}
                                {/*    <option value="null">everyone</option>*/}
                                {/*    {communities.map((item, index) => (*/}
                                {/*        <option key={index}>{item}</option>*/}
                                {/*    ))}*/}
                                {/*</select>*/}
                            </div>

                            <button type="submit"
                                    className="bg-white flex w-max px-8 py-1.5 rounded-4xl text-lg">Post
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="w-full bg-black text-white text-center p-4 border-x border-b border-gray-600">You need to log in to post</div>
                )}
                { posts ? (posts.map((post, index) => (
                    <Link href={`/post/${post.post_id}`} className="w-full bg-black flex flex-col px-5 py-3 text-white border-x border-b border-gray-600" key={index}>
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
                                <div>{post.post_text}</div>
                            </div>
                        </div>
                        <div className="flex justify-between mx-18 mt-4 text-gray-500">
                            <div className="flex gap-8 text-xl">
                                <div className="flex items-center gap-1.5"><FaHeart/> {post.like_count}</div>
                                <div className="flex items-center gap-1.5"><FaComment /> {post.comment_count}</div>
                            </div>
                            <div>{format(new Date(post.created_at), "d MMMM yyyy")}</div>
                        </div>
                    </Link>
                ))) : ""}
            </div>
        </div>
    </>
  );
}
