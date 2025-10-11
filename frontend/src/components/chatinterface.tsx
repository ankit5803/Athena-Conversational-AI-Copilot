import React from "react";
import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
function Chatinterface() {
  return (
    <div>
      <h1>Chat Interface</h1>
      <SignOutButton>
        <button className="cursor-pointer transform rounded-full bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
          Log Out
        </button>
      </SignOutButton>
    </div>
  );
}

export default Chatinterface;
