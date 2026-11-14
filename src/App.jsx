import { cloneElement, lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthProvider";
import { Loading } from "./ui/kit";
import { namesOf, normInvite } from "./lib/member";
import { refreshPush } from "./lib/notifications";
import { ensureGameOwner, loadLeaderboards, personLook, syncGames } from "./lib/games";
import { useState } from "react";

import Splash from "./pages/onboarding/Splash";

// First run: real screens.
const SignUp = lazy(() => import("./pages/onboarding/SignUp"));
const VerifyEmail = lazy(() => import("./pages/onboarding/VerifyEmail"));
const ProfileSetup = lazy(() => import("./pages/onboarding/ProfileSetup"));
const Rules = lazy(() => import("./pages/onboarding/Rules"));
const FirstSession = lazy(() => import("./pages/onboarding/FirstSession"));
const AccountProblem = lazy(() => import("./pages/onboarding/AccountProblem"));

// Public explainer screens.
const Welcome = lazy(() => import("./pages/onboarding/Welcome"));
const HowItWorks = lazy(() => import("./pages/onboarding/HowItWorks"));

// Member screens (from the design; wired to live data next).
const Home = lazy(() => import("./pages/app/Home"));
const Mine = lazy(() => import("./pages/app/Mine"));
const Allocation = lazy(() => import("./pages/app/Allocation"));
const History = lazy(() => import("./pages/app/History"));
const GamesHub = lazy(() => import("./pages/app/Games"));
const HexHub = lazy(() => import("./screens/HexHub"));
const HexPlay = lazy(() => import("./screens/HexPlay"));
const Leaderboard = lazy(() => import("./pages/app/Leaderboard"));
const RushIntro = lazy(() => import("./screens/RushIntro"));
const RushPlay = lazy(() => import("./screens/RushPlay"));
const RushHazard = lazy(() => import("./screens/RushHazard"));
const RushBanked = lazy(() => import("./screens/RushBanked"));
const Network = lazy(() => import("./pages/app/Network"));
const Profile = lazy(() => import("./pages/app/Profile"));
const Notifications = lazy(() => import("./pages/app/Notifications"));
const Settings = lazy(() => import("./pages/app/Settings"));
const Chat = lazy(() => import("./pages/app/Chat"));
const Redeem = lazy(() => import("./pages/app/Redeem"));
const ReleasePolicy = lazy(() => import("./pages/app/ReleasePolicy"));
const ProfileEdit = lazy(() => import("./pages/app/ProfileEdit"));
const DeleteAccount = lazy(() => import("./pages/app/DeleteAccount"));
const Reviews = lazy(() => import("./pages/app/Reviews"));
const Live = lazy(() => import("./pages/app/Live"));
const Verify = lazy(() => import("./pages/app/Verify"));
const Preview = import.meta.env.DEV ? lazy(() => import("./dev/Preview")) : null;

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
  ensureGameOwner(a.nuruId);
  const since = a.member?.createdAt?.toDate?.();
  return cloneElement(children, {
    memberName: a.displayName,
    initials: a.initials,
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

/** Loads the real leaderboards for a leaderboard screen. */
function Boards({ children, ...props }) {
  const { nuruId, displayName } = useAuth();
  const [boards, setBoards] = useState(null);
  useEffect(() => {
    loadLeaderboards()
      .then(async (b) => {
        const ids = [...b.hexToday.slice(0, 10), ...b.rushToday.slice(0, 10)].map((r) => r.id);
        const names = await namesOf(ids).catch(() => ({}));
        const named = (rows) => rows.map((r) => ({ ...r, name: names[r.id] || "" }));
        setBoards({ ...b, hexToday: named(b.hexToday), rushToday: named(b.rushToday) });
      })
      .catch(() => setBoards({ hexToday: [], hexAll: [], rushToday: [], rushAll: [] }));
  }, []);
  return cloneElement(children, { ...props, boards, look: personLook, me: { id: nuruId, name: displayName } });
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
  ["/mine", member(<Mine />)],
  ["/mine/session", member(<Mine />)],
  ["/mine/allocation", member(<Allocation />)],
  ["/mine/history", member(<History />)],
  ["/games", member(<GamesHub />)],
  ["/games/hex", member(<Boards><HexHub /></Boards>)],
  ["/games/hex/play", member(<Boards><HexPlay /></Boards>)],
  ["/games/hex/leaderboards", member(<Boards><Leaderboard game="hex" /></Boards>)],
  ["/games/rush", member(<Boards><RushIntro /></Boards>)],
  ["/games/rush/play", member(<RushPlay />)],
  ["/games/rush/lost", member(<RushHazard />)],
  ["/games/rush/banked", member(<Boards><RushBanked /></Boards>)],
  ["/games/rush/leaderboards", member(<Boards><Leaderboard game="rush" /></Boards>)],
  ["/network", member(<Network />)],
  ["/chat", member(<Chat />)],
  ["/how-to-redeem", member(<Redeem />)],
  ["/release-policy", member(<ReleasePolicy />)],
  ["/mine/live", member(<Live />)],
  ["/profile", member(<Profile />)],
  ["/profile/edit", member(<ProfileEdit />)],
  ["/settings/delete", member(<DeleteAccount />)],
  ["/team/reviews", member(<Reviews />)],
  ["/notifications", member(<Notifications />)],
  ["/settings", member(<Settings />)],
  ["/verify", member(<Verify />)],
];

function Shell() {
  const { pathname, search } = useLocation();

  // Game results and progress → server, whenever the member moves between screens.
  const auth = useAuth();
  useEffect(() => {
    if (auth.step === "done") syncGames(auth.nuruId).catch(() => {});
  }, [pathname, auth.step, auth.nuruId]);
  useEffect(() => {
    if (auth.step === "done") refreshPush(auth.nuruId);
  }, [auth.step, auth.nuruId]);

  // ?invite=CODE on any link is kept for the profile step.
  useEffect(() => {
    const code = new URLSearchParams(search).get("invite");
    if (code) rememberInvite(code);
  }, [search]);

  return (
    <div className="stage">
      <div className="device">
        <Suspense fallback={<div className="screen" />}>
          <Routes>
            {ROUTES.map(([path, el]) => (
              <Route key={path} path={path} element={<div className="screen" key={path}>{el}</div>} />
            ))}
            {Preview ? <Route path="/__preview/:name" element={<div className="screen"><Preview /></div>} /> : null}
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
