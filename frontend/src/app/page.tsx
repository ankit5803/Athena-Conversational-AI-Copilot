"use client";
import {
  SignedOut,
  SignInButton,
  SignUpButton,
  SignOutButton,
  UserButton,
  SignedIn,
} from "@clerk/nextjs";
import DarkVeil from "../components/darkveil";
import { motion } from "framer-motion";
import Header from "../components/header";
import Footer from "../components/footer";

export default function Home() {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="fixed w-full h-full flex flex-col items-center justify-center top:0 right:0 bottom:0 left:0 bg-transparent">
        <Header />
        <h1 className="flex gap-2 flex-wrap mx-auto max-w-4xl text-center text-2xl font-bold text-slate-700 md:text-4xl lg:text-7xl dark:text-slate-300">
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
          className="mx-auto max-w-2xl py-2 text-center text-lg font-normal text-neutral-600 dark:text-neutral-400"
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
          {/* <SignedIn>
            <button
              onClick={() => (window.location.href = "/chat")}
              className="cursor-pointer transform rounded-full bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Start New Chat
            </button>
            <SignOutButton>
              <button className="cursor-pointer transform rounded-full bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                Log Out
              </button>
            </SignOutButton>
          </SignedIn> */}
        </motion.div>
        <Footer />
      </div>
      {/* <Hyperspeed
        effectOptions={{
          onSpeedUp: () => {},
          onSlowDown: () => {},
          distortion: "turbulentDistortion",
          length: 400,
          roadWidth: 10,
          islandWidth: 2,
          lanesPerRoad: 4,
          fov: 90,
          fovSpeedUp: 150,
          speedUp: 2,
          carLightsFade: 0.4,
          totalSideLightSticks: 20,
          lightPairsPerRoadWay: 40,
          shoulderLinesWidthPercentage: 0.05,
          brokenLinesWidthPercentage: 0.1,
          brokenLinesLengthPercentage: 0.5,
          lightStickWidth: [0.12, 0.5],
          lightStickHeight: [1.3, 1.7],
          movingAwaySpeed: [60, 80],
          movingCloserSpeed: [-120, -160],
          carLightsLength: [400 * 0.03, 400 * 0.2],
          carLightsRadius: [0.05, 0.14],
          carWidthPercentage: [0.3, 0.5],
          carShiftX: [-0.8, 0.8],
          carFloorSeparation: [0, 5],
          colors: {
            roadColor: 0x080808,
            islandColor: 0x0a0a0a,
            background: 0x000000,
            shoulderLines: 0xffffff,
            brokenLines: 0xffffff,
            leftCars: [0xd856bf, 0x6750a2, 0xc247ac],
            rightCars: [0x03b3c3, 0x0e5ea5, 0x324555],
            sticks: 0x03b3c3,
          },
        }}
      /> */}
      <DarkVeil
        speed={1.5}
        hueShift={250}
        warpAmount={0.5}
        noiseIntensity={0.02}
        scanlineFrequency={5}
        // scanlineIntensity={0.1}
      />
      {/* <LiquidEther
        colors={["#5227FF", "#FF9FFC", "#B19EEF"]}
        mouseForce={30}
        cursorSize={110}
        isViscous={true}
        viscous={30}
        iterationsViscous={32}
        iterationsPoisson={32}
        resolution={0.5}
        isBounce={false}
        autoDemo={true}
        autoSpeed={0.5}
        autoIntensity={2.2}
        takeoverDuration={0.25}
        autoResumeDelay={3000}
        autoRampDuration={0.6}
      /> */}
    </div>
  );
}
