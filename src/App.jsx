import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import Splash from "./screens/Splash";
const Welcome = lazy(() => import("./screens/Welcome"));
const HowItWorks = lazy(() => import("./screens/HowItWorks"));
const SignUp = lazy(() => import("./screens/SignUp"));
const ProfileSetup = lazy(() => import("./screens/ProfileSetup"));
const Rules = lazy(() => import("./screens/Rules"));
const FirstSession = lazy(() => import("./screens/FirstSession"));
const Home = lazy(() => import("./screens/Home"));
const MineIdle = lazy(() => import("./screens/MineIdle"));
const MineActive = lazy(() => import("./screens/MineActive"));
const Rewards = lazy(() => import("./screens/Rewards"));
const History = lazy(() => import("./screens/History"));
const GamesHub = lazy(() => import("./screens/GamesHub"));
const HexHub = lazy(() => import("./screens/HexHub"));
const HexPlay = lazy(() => import("./screens/HexPlay"));
const HexVictory = lazy(() => import("./screens/HexVictory"));
const HexDefeat = lazy(() => import("./screens/HexDefeat"));
const HexLeaderboard = lazy(() => import("./screens/HexLeaderboard"));
const RushIntro = lazy(() => import("./screens/RushIntro"));
const RushPlay = lazy(() => import("./screens/RushPlay"));
const RushHazard = lazy(() => import("./screens/RushHazard"));
const RushBanked = lazy(() => import("./screens/RushBanked"));
const RushLeaderboard = lazy(() => import("./screens/RushLeaderboard"));
const Network = lazy(() => import("./screens/Network"));
const Profile = lazy(() => import("./screens/Profile"));
const Notifications = lazy(() => import("./screens/Notifications"));
const Settings = lazy(() => import("./screens/Settings"));
const StateLoading = lazy(() => import("./screens/StateLoading"));
const StateEmpty = lazy(() => import("./screens/StateEmpty"));
const StateVerify = lazy(() => import("./screens/StateVerify"));
const StateError = lazy(() => import("./screens/StateError"));
const StateInactive = lazy(() => import("./screens/StateInactive"));
const HomeLight = lazy(() => import("./screens/HomeLight"));
const MineActiveLight = lazy(() => import("./screens/MineActiveLight"));

const ONBOARDED = "alke.onboarded.v1";
const isOnboarded = () => {
  try {
    return localStorage.getItem(ONBOARDED) === "1";
  } catch {
    return false;
  }
};

/* Splash shows the brand moment, then moves on: members to Home, everyone else to Welcome. */
function SplashRoute() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate(isOnboarded() ? "/home" : "/welcome", { replace: true }), 1800);
    return () => clearTimeout(t);
  }, [navigate]);
  return <Splash />;
}

/* Reaching Home means the first run is done; next launch skips onboarding. */
function MarkOnboarded({ children }) {
  useEffect(() => {
    try {
      localStorage.setItem(ONBOARDED, "1");
    } catch {
      /* private mode: onboarding just shows again */
    }
  }, []);
  return children;
}

const ROUTES = [
  ["/", <SplashRoute />],
  ["/welcome", <Welcome />],
  ["/how-it-works", <HowItWorks />],
  ["/sign-up", <SignUp />],
  ["/profile-setup", <ProfileSetup />],
  ["/rules", <Rules />],
  ["/first-session", <FirstSession />],
  ["/home", <MarkOnboarded><Home /></MarkOnboarded>],
  ["/mine", <MineIdle />],
  ["/mine/session", <MineActive />],
  ["/mine/allocation", <Rewards />],
  ["/mine/history", <History />],
  ["/games", <GamesHub />],
  ["/games/hex", <HexHub />],
  ["/games/hex/play", <HexPlay />],
  ["/games/hex/victory", <HexVictory />],
  ["/games/hex/defeat", <HexDefeat />],
  ["/games/hex/leaderboards", <HexLeaderboard />],
  ["/games/rush", <RushIntro />],
  ["/games/rush/play", <RushPlay />],
  ["/games/rush/lost", <RushHazard />],
  ["/games/rush/banked", <RushBanked />],
  ["/games/rush/leaderboards", <RushLeaderboard />],
  ["/network", <Network />],
  ["/profile", <Profile />],
  ["/notifications", <Notifications />],
  ["/settings", <Settings />],
  ["/verify", <StateVerify />],
  ["/status/loading", <StateLoading />],
  ["/status/empty", <StateEmpty />],
  ["/status/error", <StateError />],
  ["/status/inactive", <StateInactive />],
  ["/light/home", <HomeLight />],
  ["/light/mine/session", <MineActiveLight />],
];

export default function App() {
  const { pathname } = useLocation();
  const light = pathname.startsWith("/light/");
  return (
    <div className="stage" data-theme={light ? "light" : "dark"}>
      <div className="device">
        {/* key remounts each screen on navigation, so timers and scroll start fresh */}
        <Suspense fallback={<div className="screen" />}>
        <Routes>
          {ROUTES.map(([path, el]) => (
            <Route key={path} path={path} element={<div className="screen" key={path}>{el}</div>} />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </div>
    </div>
  );
}
