import { useParams, useSearchParams } from "react-router-dom";
import { AuthContext } from "../auth/AuthProvider";
import SignUp from "../pages/onboarding/SignUp";
import VerifyEmail from "../pages/onboarding/VerifyEmail";
import ProfileSetup from "../pages/onboarding/ProfileSetup";
import Rules from "../pages/onboarding/Rules";
import FirstSession from "../pages/onboarding/FirstSession";
import AccountProblem from "../pages/onboarding/AccountProblem";
import Welcome from "../pages/onboarding/Welcome";
import HowItWorks from "../pages/onboarding/HowItWorks";
import Splash from "../pages/onboarding/Splash";
import { Loading } from "../ui/kit";
import Home from "../pages/app/Home";
import Mine from "../pages/app/Mine";
import Allocation from "../pages/app/Allocation";
import History from "../pages/app/History";
import Games from "../pages/app/Games";
import Network from "../pages/app/Network";
import Profile from "../pages/app/Profile";
import Notifications from "../pages/app/Notifications";
import Settings from "../pages/app/Settings";
import Leaderboard from "../pages/app/Leaderboard";
import HexHub from "../screens/HexHub";
import HexPlay from "../screens/HexPlay";
import RushIntro from "../screens/RushIntro";
import RushPlay from "../screens/RushPlay";
import RushBanked from "../screens/RushBanked";
import RushHazard from "../screens/RushHazard";

/* Dev only (/__preview/<screen>): renders an onboarding screen with a stand-in
   account so its design can be checked without signing in. Not in builds. */
const SCREENS = {
  splash: Splash,
  welcome: Welcome,
  how: HowItWorks,
  signup: () => <SignUp mode="signup" />,
  signin: () => <SignUp mode="signin" />,
  verify: VerifyEmail,
  profile: ProfileSetup,
  rules: Rules,
  first: FirstSession,
  problem: AccountProblem,
  loading: Loading,
  home: Home,
  mine: Mine,
  allocation: Allocation,
  history: History,
  games: Games,
  network: Network,
  profile: Profile,
  notifications: Notifications,
  settings: Settings,
  hexhub: HexHub,
  hexplay: HexPlay,
  hexboard: () => <Leaderboard game="hex" boards={{ hexToday: [], hexAll: [], rushToday: [], rushAll: [] }} />,
  rushhub: RushIntro,
  rushplay: RushPlay,
  rushbanked: RushBanked,
  rushlost: RushHazard,
  rushboard: () => (
    <Leaderboard game="rush" memberId="me" boards={{ rushToday: [{ id: "a", username: "kojo.b", rushBest: 320 }, { id: "me", username: "amara", rushBest: 250 }, { id: "c", username: "esi_m", rushBest: 140 }], rushAll: [], hexToday: [], hexAll: [] }} />
  ),
};

const noop = async () => {};

export default function Preview() {
  const { name } = useParams();
  const [q] = useSearchParams();
  const started = q.get("started") === "1";
  const Screen = SCREENS[name] || Welcome;
  const value = {
    ready: true,
    step: name,
    stepPath: null,
    nuruId: "preview",
    user: { email: "amara.mensah@example.com", displayName: "Amara Mensah" },
    person: { name: "Amara Mensah", emojiColor: 0 },
    member: started
      ? { username: "amara", onboardedAt: new Date(), sessionCount: 12, streak: 5, bestStreak: 9, createdAt: { toDate: () => new Date(2026, 9, 2) }, lastSessionAt: { toMillis: () => Date.now() - 3600e3, toDate: () => new Date(Date.now() - 3600e3) } }
      : name === "first" ? null : { username: "amara", sessionCount: 12, streak: 5, bestStreak: 9, createdAt: { toDate: () => new Date(2026, 9, 2) }, lastSessionAt: { toMillis: () => Date.now() - 30 * 3600e3, toDate: () => new Date(Date.now() - 30 * 3600e3) } },
    firstName: "Amara",
    displayName: "Amara Mensah",
    initials: "AM",
    error: "Missing or insufficient permissions.",
    refresh: noop,
    signOut: noop,
  };
  return <AuthContext.Provider value={value}><Screen /></AuthContext.Provider>;
}
