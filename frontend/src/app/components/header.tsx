import React from "react";
import Link from "next/link";
import Image from "next/image";

function Header() {
  return (
    <header className="fixed top-0 w-full px-4 lg:px-6 h-14 flex items-center bg-transparent text-primary-foreground">
      <div>
        <Link
          href="#"
          className="flex items-center gap-4 text-lg"
          prefetch={false}
        >
          <Image width={24} height={24} src={"/globe.svg"} alt="Logo"></Image>
          Athena AI
        </Link>
      </div>
    </header>
  );
}

export default Header;
