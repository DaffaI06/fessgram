import {Geist, Geist_Mono, Poppins} from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/navbar";
import React from "react";
import {GoogleOAuthProvider} from "@react-oauth/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
    variable: "--font-poppins",
    subsets: ["latin"],
    weight: ["100","200","300","400","500","600","700","800","900"],
});

export const metadata = {
  title: "Fessgram - fess here",
  description: "Antisocial social media",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">

      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased`}
      >
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
          <Navbar/>
            {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
