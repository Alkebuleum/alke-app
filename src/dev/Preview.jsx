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
import Chat from "../pages/app/Chat";
import { WarmingRules, WarmingSection } from "../pages/app/Warming";
import { AppPage, SubBar } from "../ui/shell";
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
  setup: ProfileSetup,
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
  warming: () => (
    <AppPage tab="mine" bar={<SubBar title="Allocation" back="/mine" />}>
      <WarmingSection cold={120} />
      <WarmingRules />
    </AppPage>
  ),
  chat: () => {
    const t = (min) => ({ toDate: () => new Date(Date.now() - min * 60000) });
    const msgs = [
      { id: "s", type: "system", text: "Kojo joined", createdAt: t(300) },
      { id: "1", type: "text", senderAin: "K1", senderName: "Kojo Boateng", text: "Morning Alkers! Who started their session today?", createdAt: t(240) },
      { id: "2", type: "text", senderAin: "K1", senderName: "Kojo Boateng", text: "Day 12 for me", createdAt: t(239) },
      { id: "3", type: "text", senderAin: "preview", senderName: "Amara Mensah", text: "Day 5 here. The new app looks clean!", createdAt: t(200) },
      { id: "4", type: "image", senderAin: "E2", senderName: "Esi Mensah", text: "", createdAt: t(120) },
      { id: "5", type: "text", senderAin: "E2", senderName: "Esi Mensah", text: "Anyone cleared Hex level 10 yet? The traps are brutal", createdAt: t(119) },
      { id: "6", type: "text", senderAin: "preview", senderName: "Amara Mensah", text: "Not yet, stuck on 7", createdAt: t(30) },
    ];
    return <Chat demo={{ ids: { chatId: "x", communityId: "y", name: "Alké Network" }, joined: new URLSearchParams(window.location.search).get("join") !== "1", chat: { name: "Alkers", memberCount: 1284 }, msgs }} />;
  },
  hexhub: HexHub,
  hexplay: HexPlay,
  hexboard: () => <Leaderboard game="hex" boards={{ hexToday: [], hexAll: [], rushToday: [], rushAll: [] }} />,
  rushhub: RushIntro,
  rushplay: RushPlay,
  rushbanked: RushBanked,
  rushlost: RushHazard,
  rushboard: () => (
    <Leaderboard game="rush" memberId="me" demoNames={{ a: "Kojo Boateng", c: "Esi Mensah" }} boards={{ rushToday: [{ id: "a", rushBest: 320 }, { id: "me", rushBest: 250 }, { id: "c", rushBest: 140 }], rushAll: [], hexToday: [], hexAll: [] }} />
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
