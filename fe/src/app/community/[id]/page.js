"use client";
import React, {use, useEffect, useState} from 'react';
import Link from "next/link";
import Image from "next/image";
import Post from "@/app/components/post";

function Page(props) {
    const {id} = use(props.params);
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`, { credentials: "include" })
            .then((res) => res.json())
            .then((data) => {
                setUser(data)
            })
            .catch(() => setUser(null));

    }, []);

    const [community, setCommunity] = useState(null);
    const [newPostText, setNewPostText] = useState("");

    const FetchCommunity = async () => {
        try{

            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/communities/${id}`,{
                credentials: "include",
            })
            const data = await res.json();
            setCommunity(data);

        } catch(error){
            console.log(error);
        }
    }

    useEffect(() => {
        FetchCommunity();
    }, [])



    const convertLink = (url) => {
        const match = url.match(/\/d\/([^/]+)\//);
        return match ? `https://drive.google.com/uc?id=${match[1]}` : url;
    }

    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newBanner, setNewBanner] = useState("");
    const [newPfp, setNewPfp] = useState("");
    const [isOwner, setIsOwner] = useState(false);
    const [hasJoined, setHasJoined] = useState(false);

    useEffect(()=>{
        if(community){
            setNewName(community.community_name);
            setNewDesc(community.description);
            setNewBanner(community.banner_url);
            setNewPfp(community.pfp_url);
            setIsOwner(community.is_owner);
            setHasJoined(community.has_joined);
        }

    }, [community]);

    const deleteCommunity = async (e) => {
        e.preventDefault();
        try{
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/communities/${id}`, {
                method: "DELETE",
                credentials: "include",
            })
            if (!res.ok){
                console.log("Error!")
            }
            window.location.href = "/community";
        } catch(error) {
            console.error(error);
        }
    }

    const updateCommunity = async (e) => {
        e.preventDefault();

        try{
            await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/communities/${id}`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: newName,
                    description: newDesc,
                    banner_url: newBanner,
                    pfp_url: newPfp,
                })
            })
            window.location.reload();
        }catch(err){
            console.error(err)
        }
    }

    const joinCommunity = async (e) => {
        e.preventDefault();

        if(!user){
            alert("Log in to join community!");
            return;
        }

        try{
            await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/communities/${id}`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                }
            })
            FetchCommunity();
        } catch(err){
            console.error(err);
        }
    }



    const submitPost = async (e) => {
        e.preventDefault()

        if(!newPostText.trim()){
            return;
        }

        try{
            await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/communities/posts/${id}`, {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    post_text: newPostText
                }),
                headers: {
                    "Content-Type": "application/json",
                }
            })
            setNewPostText("");
            window.location.reload();
        }catch(err){
            console.log(err);
        }
    }

    return (
        <>
            <div className="flex justify-center font-medium text-white">
                <div className="w-full md:w-[80vw] lg:w-[60vw] xl:w-[50vw]">
                    {community ? (
                        <div className="border-x-2 border-b-2 border-gray-600 ">
                            <form onSubmit={updateCommunity}
                                  className="relative flex flex-col w-full bg-gray-950">
                                <div className="relative w-full h-52 sm:h-64 md:h-56 xl:h-64 mt-0">
                                    <Image src={convertLink(community.banner_url) || "/defaultbanner.avif"}
                                           className="object-cover"
                                           alt="" fill sizes="(max-width: 640px) 100vw, 50vw" priority/>
                                </div>
                                <div
                                    className="absolute top-40 sm:top-48 md:top-40 xl:top-44 left-6 sm:left-16 w-24 h-24 sm:w-30 sm:h-30 lg:w-34 lg:h-34 mt-1 sm:mt-0">
                                    <Image src={convertLink(community.pfp_url) || "/defaultpfp.png"}
                                           className="rounded-2xl border-4 border-gray-950 bg-gray-950 object-cover"
                                           alt="" fill sizes="(max-width: 640px) 96px, 120px"/>
                                </div>

                                <div className="flex justify-end m-4 gap-8 items-center font-semibold">
                                    {hasJoined ? (
                                        <div onClick={joinCommunity}
                                             className="bg-red-500 px-6 py-1 rounded-4xl text-lg cursor-pointer">Leave</div>
                                    ) : (
                                        <div onClick={joinCommunity}
                                             className="bg-white text-black px-6 py-1 rounded-4xl text-lg cursor-pointer">Join</div>
                                    )}
                                </div>
                                {isOwner ? (
                                    <div className="flex flex-col p-4 pt-3 px-6 sm:px-10 gap-6">
                                        <div className="flex flex-col gap-3">
                                            <input type="text" value={newName}
                                                   onChange={(e) => setNewName(e.target.value)}
                                                   className="outline-0 placeholder-gray-400 text-md sm:text-lg text-white rounded-md bg-gray-800 w-[50%] pl-2"/>
                                            <textarea type="text" value={newDesc}
                                                      onChange={(e) => setNewDesc(e.target.value)}
                                                      className="outline-0 placeholder-gray-400 text-md sm:text-lg text-white rounded-md bg-gray-800 w-full pl-2 resize-none"/>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <div>Banner url</div>
                                            <input type="text" value={newBanner}
                                                   onChange={(e) => setNewBanner(e.target.value)}
                                                   className="outline-0 placeholder-gray-400 text-md sm:text-lg text-white rounded-md bg-gray-800 w-full pl-2"/>
                                            <div>Pfp url</div>
                                            <input type="text" value={newPfp}
                                                   onChange={(e) => setNewPfp(e.target.value)}
                                                   className="outline-0 placeholder-gray-400 text-md sm:text-lg text-white rounded-md bg-gray-800 w-full pl-2"/>
                                        </div>
                                        <div
                                            className="flex text-center font-medium text-sm sm:text-xl sm:px-5 mt-4 mb-2 sm:mb-4 gap-6 sm:gap-16">
                                            <button onClick={deleteCommunity}
                                                    className="bg-red-500 w-[50%]  rounded-full py-2 sm:p-2 cursor-pointer">Delete
                                            </button>
                                            <button type="submit"
                                                    className="bg-white w-[50%] text-black rounded-full py-2 sm:p-2 cursor-pointer">Save
                                                Changes
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col w-full p-4 pt-2 md:pt-3 lg:pt-4">
                                        <div className="text-xl">{community.community_name}</div>
                                        <div className="text-lg text-gray-400">{community.description}</div>
                                    </div>
                                )}



                            </form>
                            <div className="text-md text-gray-500 px-4">Made by: {community.name}</div>
                            <div className="border-t-gray-600 border-t-1 w-[95%] mx-auto flex mt-4"></div>
                            {user && hasJoined ? (
                                <form
                                    className="w-full bg-black flex flex-col p-5 pb-4 sm:pb-5"
                                    onSubmit={submitPost}>
                                    <div className="w-full flex gap-5 items-center">
                                        <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 ">
                                            <Image src={user.avatar_url || "/defaultpfp.png"} className="rounded-full"
                                                   alt=""
                                                   fill sizes="(max-width: 640px) 48px, 56px"/>
                                        </div>
                                        <div className="flex-1">
                                            <textarea placeholder={`Welcome, ${user.name}! confess here...`} rows="1"
                                              className="outline-0 placeholder-gray-400 text-md sm:text-xl text-white w-full resize-none overflow-hidden"
                                              value={newPostText}
                                              onChange={(e) => setNewPostText(e.target.value)}
                                              onInput={(e) => {
                                                  e.target.style.height = "auto";
                                                  e.target.style.height = `${e.target.scrollHeight}px`;
                                              }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-between pt-4 sm:px-5 sm:pt-6">
                                        <div className="flex items-center gap-2">
                                            <div className="text-gray-500 text-sm sm:text-xl">Post to this community
                                            </div>
                                        </div>

                                        <button type="submit"
                                                className="bg-white text-black flex w-max px-6 py-1 sm:px-8  sm:py-1.5 rounded-4xl text-sm sm:text-lg cursor-pointer">Post
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div
                                    className="w-full bg-black text-white text-center p-2.5 sm:p-4 my-1 sm:my-2">You
                                    need to join to post</div>
                            )}
                        </div>

                    ) : ""}

                    {community?.posts ? (community.posts.map((post, index) => (
                        <Post key={index} post_id={post.post_id} avatar_url={post.avatar_url} post_text={post.post_text}
                              name={post.name} created_at={post.created_at}
                              like_count={post.like_count} comment_count={post.comment_count} user={user}/>
                    ))) : ""}
                </div>
            </div>
        </>
    );
}

export default Page;