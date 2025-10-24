"use client";
import { SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import DarkVeil from "../components/darkveil";
import { motion } from "framer-motion";
import Header from "../components/header";
import Footer from "../components/footer";

export default function Home() {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="fixed w-full h-full flex flex-col items-center justify-center top:0 right:0 bottom:0 left:0 bg-transparent">
        <Header />
        <h1 className="flex md:gap-2 flex-wrap mx-auto max-w-4xl text-center text-3xl font-bold text-slate-700 md:text-4xl lg:text-7xl dark:text-slate-300">
          {"Athena AI".split(" ").map((word, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.1,
                ease: "easeInOut",
              }}
              className="mr-2 inline-block"
            >
              {word}
            </motion.span>
          ))}
        </h1>
        <h1 className="my-2 mx-auto max-w-4xl text-center text-lg text-slate-700 md:text-xl lg:text-3xl dark:text-slate-300">
          {"Your Research Copilot".split(" ").map((word, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.1,
                ease: "easeInOut",
              }}
              className="mr-2 inline-block"
            >
              {word}
            </motion.span>
          ))}
        </h1>
        <motion.p
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.3,
            delay: 0.8,
          }}
          className="mx-auto w-[70vw] md:w-full max-w-2xl py-2 text-center text-lg font-normal text-neutral-600 dark:text-neutral-400"
        >
          With Athena, you can launch your website in hours, not days. Try our
          best in class, state of the art, cutting edge AI tools to get your
          website up.
        </motion.p>
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.3,
            delay: 1,
          }}
          className="mt-5 flex flex-wrap items-center justify-center gap-4"
        >
          <SignedOut>
            <SignInButton forceRedirectUrl="/chat">
              <button className="cursor-pointer transform rounded-full bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                Log in
              </button>
            </SignInButton>
            <SignUpButton forceRedirectUrl="/chat">
              <button className="cursor-pointer transform rounded-full border border-gray-300 bg-white px-6 py-2 font-medium text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-100 dark:border-gray-700 dark:bg-black dark:text-white dark:hover:bg-gray-900">
                Sign up
              </button>
            </SignUpButton>
          </SignedOut>
        </motion.div>
        <Footer />
      </div>
      <DarkVeil
        speed={1.5}
        hueShift={250}
        warpAmount={0.5}
        noiseIntensity={0.02}
        scanlineFrequency={5}
        // scanlineIntensity={0.1}
      />
    </div>
  );
}
