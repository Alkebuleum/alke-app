import { useParams, useSearchParams } from "react-router-dom";
import { AuthContext } from "../auth/AuthProvider";
import SignUp from "../pages/onboarding/SignUp";
import VerifyEmail from "../pages/onboarding/VerifyEmail";
import CreateAccount from "../pages/onboarding/CreateAccount";
import AlkerID from "../pages/onboarding/AlkerID";
import JoinCommunity from "../pages/onboarding/JoinCommunity";
import Story from "../pages/onboarding/Story";
import Rules from "../pages/onboarding/Rules";
import FirstSession from "../pages/onboarding/FirstSession";
import AccountProblem from "../pages/onboarding/AccountProblem";
import Welcome from "../pages/onboarding/Welcome";
import HowItWorks from "../pages/onboarding/HowItWorks";
import Splash from "../pages/onboarding/Splash";
import { Loading } from "../ui/kit";
import Home from "../pages/app/Home";
import Drill from "../pages/app/Drill";
import Allocation from "../pages/app/Allocation";
import History from "../pages/app/History";
import Games from "../pages/app/Games";
import Network from "../pages/app/Network";
import Profile from "../pages/app/Profile";
import Notifications from "../pages/app/Notifications";
import Settings from "../pages/app/Settings";
import Leaderboard from "../pages/app/Leaderboard";
import Chat from "../pages/app/Chat";
import { WarmingSection } from "../pages/app/Warming";
import Redeem from "../pages/app/Redeem";
import Live from "../pages/app/Live";
import { AppPage, SubBar } from "../ui/shell";
import HexHub from "../screens/HexHub";
import HexPlay from "../screens/HexPlay";
import RushIntro from "../screens/RushIntro";
import RushPlay from "../screens/RushPlay";
import RushBanked from "../screens/RushBanked";
import RushHazard from "../screens/RushHazard";
import StoryEpisodes from "../pages/app/Story";

/* Dev only (/__preview/<screen>): renders an onboarding screen with a stand-in
   account so its design can be checked without signing in. Not in builds. */
const SCREENS = {
  splash: Splash,
  welcome: Welcome,
  how: HowItWorks,
  signup: () => <SignUp mode="signup" />,
  signin: () => <SignUp mode="signin" />,
  verify: VerifyEmail,
  account: CreateAccount,
  alkerid: AlkerID,
  community: JoinCommunity,
  story: Story,
  rules: Rules,
  first: FirstSession,
  problem: AccountProblem,
  loading: Loading,
  home: Home,
  episodes: StoryEpisodes,
  drill: Drill,
  allocation: Allocation,
  history: History,
  games: Games,
  network: Network,
  profile: Profile,
  notifications: Notifications,
  settings: Settings,
  warming: () => (
    <AppPage tab="drill" bar={<SubBar title="Allocation" back="/drill" />}>
      <WarmingSection cold={120} />
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
  redeem: Redeem,
  live: Live,
  // Drill, with a burst of taps on the rock shortly before the screenshot.
  tap: () => {
    setTimeout(() => {
      const el = document.querySelector(".ob-drill-scene.on .hit");
      if (!el) return;
      const b = el.getBoundingClientRect();
      for (let i = 0; i < 7; i++) {
        setTimeout(() => el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: b.left + b.width * (0.4 + Math.random() * 0.2), clientY: b.top + b.height * (0.45 + Math.random() * 0.15) })), i * 90);
      }
    }, 4300);
    return <Drill />;
  },
  // Drill, scrolled down to the invite section.
  deeper: () => {
    setTimeout(() => document.querySelector(".ob-deeper")?.scrollIntoView({ block: "start" }), 1500);
    return <Drill />;
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
// The stand-in session started at a fixed moment, so its clock runs.
const T0 = Date.now();

export default function Preview() {
  const { name } = useParams();
  const [q] = useSearchParams();
  const started = q.get("started") === "1";
  const Screen = SCREENS[name] || Welcome;
  const value = {
    ready: true,
    step: name === "account" ? "profile" : name,
    stepPath: null,
    nuruId: "preview",
    user: { email: "amara.mensah@example.com", displayName: "Amara Mensah" },
    person: { name: "Amara Mensah", emojiColor: 0 },
    member: started
      ? { username: "amara", onboardedAt: new Date(), sessionCount: 12, streak: 5, bestStreak: 9, createdAt: { toDate: () => new Date(2026, 9, 2) }, lastSessionAt: { toMillis: () => T0 - 3600e3, toDate: () => new Date(T0 - 3600e3) } }
      : name === "first" ? { username: "amara", alkerId: "ALK-9886-9849-8498" } : name === "account" ? null : { username: "amara", alkerId: "ALK-9886-9849-8498", sessionCount: 12, streak: 5, bestStreak: 9, createdAt: { toDate: () => new Date(2026, 9, 2) }, lastSessionAt: { toMillis: () => T0 - 30 * 3600e3, toDate: () => new Date(T0 - 30 * 3600e3) } },
    firstName: "Amara",
    displayName: "Amara Mensah",
    initials: "AM",
    error: "Missing or insufficient permissions.",
    refresh: noop,
    signOut: noop,
    advance: noop,
  };
  return <AuthContext.Provider value={value}><Screen /></AuthContext.Provider>;
}
