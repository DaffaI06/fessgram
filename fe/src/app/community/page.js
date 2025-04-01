"use client";
import React, {useEffect, useState} from 'react';
import Image from "next/image";
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

    const [communities, setCommunities] = useState(null);

    const FetchCommunities = async () => {
        try{
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/communities/`)
            const data = await res.json();
            setCommunities(data);
        } catch(error){
            setCommunities(null);
            console.log(error);
        }
    }
    useEffect(() => {
        FetchCommunities();
    }, [])


    // raw google drive urls arent img links,
    // converts this https://drive.google.com/file/d/<FILE_ID>/view?usp=drive_link
    // to this https://drive.google.com/uc?id=1PPwThYJ6rtALxXVENKYaACcmBm45NRVr
    const convertLink = (url) => {
        const match = url.match(/\/d\/([^/]+)\//);
        return match ? `https://drive.google.com/uc?id=${match[1]}` : url;
    }

    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newBanner, setNewBanner] = useState("");
    const [newPfp, setNewPfp] = useState("");

    const submitCommunity = async (e) => {
        e.preventDefault();

        if (!user) {
            alert("u have to log in to make one!!")
            return;
        }

        if(!newName.trim()){
            alert("Name cant be empty, dummy")
            return;
        }
        try{
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/communities/`, {
                method: "POST",
                body: JSON.stringify({name: newName, description: newDesc, banner_url: newBanner, pfp_url: newPfp}),
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",

            })
            if (!res.ok){
                console.log("Error!")
            }
            setNewName("");
            setNewDesc("");
            setNewBanner("");
            setNewPfp("");
            window.location.reload();
        } catch(error) {
            console.error(error);
        }

    }

    return (
        <>
            <div className="flex justify-center font-medium">
                <div className="w-full md:w-[80vw] lg:w-[60vw] xl:w-[50vw] ">
                    <div className="grid px-4 md:px-0 grid-cols-1 sm:grid-cols-2 justify-items-center gap-4 sm:gap-8 xl:gap-12 pt-8 sm:pt-12 mb-24">
                        { communities ? communities.map((c, index) => (
                            <Link className="relative text-white border-2 border-gray-600 rounded-xl bg-gray-950 flex flex-col w-full sm:w-[75%] sm:w-full"
                                  href={`/community/${c.community_id}`} key={index}>
                                <div className="relative w-full h-48 sm:h-44 md:h-48 lg:h-52 xl:h-56 mt-0">
                                    <Image src={convertLink(c.banner_url) || "/defaultbanner.avif"} className="rounded-t-xl object-cover"
                                           alt="" fill sizes="(max-width: 640px) 100vw, 50vw" priority/>
                                </div>
                                <div
                                    className="absolute top-38 sm:top-34 md:top-38 lg:top-42 xl:top-46 left-6 w-18 h-18 mt-1 sm:mt-0">
                                    <Image src={convertLink(c.pfp_url) || "/defaultpfp.png"}
                                           className="rounded-2xl border-4 border-gray-950 bg-gray-950 object-cover"
                                           alt="" fill sizes="72px"/>
                                </div>
                                <div className="flex justify-end m-2 text-gray-500 text-xs px-4">Made by: {c.name}</div>
                                <div className="flex flex-col w-full p-4 pt-3">
                                    <div>{c.community_name}</div>
                                    <div className="text-sm text-gray-400">{c.description}</div>
                                </div>
                            </Link>
                        )) : ""}

                    </div>
                    <form onSubmit={submitCommunity} className="flex flex-col mx-auto text-white py-24 mb-32 gap-4 md:border-x-1 border-gray-600">
                        <div className="text-3xl text-center mb-4">Create a community</div>
                        <div className="flex flex-col mx-auto">
                            <div>Community name</div>
                            <input type="text" placeholder="Type name here..." value={newName} onChange={(e) => setNewName(e.target.value)}
                                   className="border-3 border-gray-600 rounded-xl p-2 px-4 outline-0 placeholder-gray-400 text-lg w-[70vw] md:w-[40vw]"></input>
                        </div>
                        <div className="flex flex-col mx-auto">
                            <div>Description</div>
                            <input type="text" placeholder="Type description here..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
                                   className="border-3 border-gray-600 rounded-xl p-2 px-4 outline-0 placeholder-gray-400 text-lg w-[70vw] md:w-[40vw]"></input>
                        </div>
                        <div className="flex flex-col mx-auto">
                            <div>Banner image url</div>
                            <input type="text" placeholder="Type url here..." value={newBanner} onChange={(e) => setNewBanner(e.target.value)}
                                   className="border-3 border-gray-600 rounded-xl p-2 px-4 outline-0 placeholder-gray-400 text-lg w-[70vw] md:w-[40vw]"></input>
                        </div>
                        <div className="flex flex-col mx-auto">
                            <div>Profile image url</div>
                            <input type="text" placeholder="Type url here..." value={newPfp} onChange={(e) => setNewPfp(e.target.value)}
                                   className="border-3 border-gray-600 rounded-xl p-2 px-4 outline-0 placeholder-gray-400 text-lg w-[70vw] md:w-[40vw]"></input>
                        </div>
                        <div className="flex flex-col mx-auto text-gray-700 gap-2 text-center text-xs sm:text-md">
                            <div>Only google drive urls allowed<br/>example: https://drive.google.com/file/d/(FILE_ID)/view?usp=drive_link</div>
                            <button type="submit"
                                className="bg-white text-black rounded-4xl p-2 w-[30vw] flex justify-center mx-auto cursor-pointer">Submit
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default Page;