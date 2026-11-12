import { cloneElement, lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthProvider";
import { Loading } from "./ui/kit";
import { normInvite } from "./lib/member";

import Splash from "./screens/Splash";

// First run: real screens.
const SignUp = lazy(() => import("./pages/onboarding/SignUp"));
const VerifyEmail = lazy(() => import("./pages/onboarding/VerifyEmail"));
const ProfileSetup = lazy(() => import("./pages/onboarding/ProfileSetup"));
const Rules = lazy(() => import("./pages/onboarding/Rules"));
const FirstSession = lazy(() => import("./pages/onboarding/FirstSession"));
const AccountProblem = lazy(() => import("./pages/onboarding/AccountProblem"));

// Public explainer screens (from the design).
const Welcome = lazy(() => import("./screens/Welcome"));
const HowItWorks = lazy(() => import("./screens/HowItWorks"));

// Member screens (from the design; wired to live data next).
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
const StateVerify = lazy(() => import("./screens/StateVerify"));
const StateInactive = lazy(() => import("./screens/StateInactive"));
const HomeLight = lazy(() => import("./screens/HomeLight"));
const MineActiveLight = lazy(() => import("./screens/MineActiveLight"));

/* ── Guards ─────────────────────────────────────────────────────────────── */

/** Public screens: a signed-in person goes to where they are in the first run. */
function Public({ children }) {
  const { ready, stepPath } = useAuth();
  if (!ready) return <Loading />;
  if (stepPath && stepPath !== "/welcome") return <Navigate to={stepPath} replace />;
  return children;
}

/** One first-run step: shown only when it's the person's current step. */
function Step({ name, children }) {
  const { ready, step, stepPath } = useAuth();
  const holdingFirstSession = name === "firstSession" && sessionStorage.getItem("alke.firstSession") === "1";
  if (!ready || (step === null && !holdingFirstSession)) return <Loading />;
  if (step !== name && !holdingFirstSession) return <Navigate to={stepPath} replace />;
  return children;
}

function maskEmail(e) {
  if (!e || !e.includes("@")) return "";
  const [u, d] = e.split("@");
  return `${u[0]}•••@${d}`;
}

function greeting(d = new Date()) {
  const h = d.getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

/** Member screens: only after the first run is complete. The screen gets the
    member's details as props (the design screens read them as $.memberName…). */
function Member({ children }) {
  const a = useAuth();
  if (!a.ready || a.step === null) return <Loading />;
  if (a.step !== "done") return <Navigate to={a.stepPath} replace />;
  const since = a.member?.createdAt?.toDate?.();
  return cloneElement(children, {
    memberName: a.displayName,
    initials: a.initials,
    username: a.member?.username || "",
    greeting: greeting(),
    memberId: a.nuruId,
    memberBadge: "Member",
    memberSince: since ? since.toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "",
    sessionCount: String(a.member?.sessionCount || 0),
    streak: "0",
    lessons: "0",
    contribution: "0",
    maskedEmail: maskEmail(a.user?.email),
    personhood: "Not yet",
    signOut: a.signOut,
  });
}

/** The brand moment, then wherever the person belongs. */
function SplashRoute() {
  const navigate = useNavigate();
  const { ready, stepPath } = useAuth();
  useEffect(() => {
    if (!ready || !stepPath) return;
    const t = setTimeout(() => navigate(stepPath, { replace: true }), 1400);
    return () => clearTimeout(t);
  }, [ready, stepPath, navigate]);
  return <Splash />;
}

/** alke.network invite links: /join/CODE. */
function JoinRoute() {
  const { code } = useParams();
  rememberInvite(code);
  return <Navigate to="/" replace />;
}

function rememberInvite(code) {
  const c = normInvite(code);
  if (!c) return;
  try {
    sessionStorage.setItem("alke.invite", c);
  } catch {
    /* private mode: the code just isn't prefilled */
  }
}

/* ── Routes ─────────────────────────────────────────────────────────────── */

const pub = (el) => <Public>{el}</Public>;
const step = (name, el) => <Step name={name}>{el}</Step>;
const member = (el) => <Member>{el}</Member>;

const ROUTES = [
  ["/", <SplashRoute />],
  ["/join/:code", <JoinRoute />],
  ["/welcome", pub(<Welcome />)],
  ["/how-it-works", pub(<HowItWorks />)],
  ["/sign-up", pub(<SignUp mode="signup" />)],
  ["/sign-in", pub(<SignUp mode="signin" />)],
  ["/verify-email", step("verifyEmail", <VerifyEmail />)],
  ["/profile-setup", step("profile", <ProfileSetup />)],
  ["/rules", step("rules", <Rules />)],
  ["/first-session", step("firstSession", <FirstSession />)],
  ["/account-problem", step("error", <AccountProblem />)],
  ["/home", member(<Home />)],
  ["/mine", member(<MineIdle />)],
  ["/mine/session", member(<MineActive />)],
  ["/mine/allocation", member(<Rewards />)],
  ["/mine/history", member(<History />)],
  ["/games", member(<GamesHub />)],
  ["/games/hex", member(<HexHub />)],
  ["/games/hex/play", member(<HexPlay />)],
  ["/games/hex/victory", member(<HexVictory />)],
  ["/games/hex/defeat", member(<HexDefeat />)],
  ["/games/hex/leaderboards", member(<HexLeaderboard />)],
  ["/games/rush", member(<RushIntro />)],
  ["/games/rush/play", member(<RushPlay />)],
  ["/games/rush/lost", member(<RushHazard />)],
  ["/games/rush/banked", member(<RushBanked />)],
  ["/games/rush/leaderboards", member(<RushLeaderboard />)],
  ["/network", member(<Network />)],
  ["/profile", member(<Profile />)],
  ["/notifications", member(<Notifications />)],
  ["/settings", member(<Settings />)],
  ["/verify", member(<StateVerify />)],
  ["/status/inactive", member(<StateInactive />)],
  ["/light/home", member(<HomeLight />)],
  ["/light/mine/session", member(<MineActiveLight />)],
];

function Shell() {
  const { pathname, search } = useLocation();
  const light = pathname.startsWith("/light/");

  // ?invite=CODE on any link is kept for the profile step.
  useEffect(() => {
    const code = new URLSearchParams(search).get("invite");
    if (code) rememberInvite(code);
  }, [search]);

  return (
    <div className="stage" data-theme={light ? "light" : "dark"}>
      <div className="device">
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

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
