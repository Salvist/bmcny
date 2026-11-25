"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { bulletin, compare, dateLabel, emptyDemo, restoreDemo, type Demo, type Gathering } from "../model/bulletin";
import { assignments, directory, scheduleData, switchMember } from "../model/scheduling";
import { Detail } from "./detail";
import { Dialog } from "./detail-dialog";
import type { Provider } from "./account";
import { Icon } from "./icons";

const tabs = {
  week: "Home",
  services: "Services",
  events: "Events",
  profile: "Profile",
  schedule: "My Schedule",
} as const;
type Tab = keyof typeof tabs;
const destinations = [
  ["week", "home"],
  ["services", "services"],
  ["profile", "person"],
] as const;
const storageKey = "bmcny-community-v1";
type ServiceView = "services" | "events";
const serviceViewKey = "bmcny-community-service-view";
const routes: Partial<Record<string, Tab>> = { "/": "week", "/services": "services", "/events": "events", "/profile": "profile", "/schedule": "schedule" };


type CommunityState = ReturnType<typeof scheduleData> & {
  data: ReturnType<typeof bulletin>;
  demo: Demo;
  provider?: Provider;
  personalShifts: Gathering[];
  scheduleItems: Gathering[];
  department: string;
  setDepartment: (value: string) => void;
  day: string;
  setDay: (value: string) => void;
  signIn: (value?: Provider) => void;
  change: (update: (demo: Demo) => Demo, requireStorage?: boolean) => boolean;
  preview: () => void;
  setItem: (item: Gathering) => void;
};

const CommunityContext = createContext<CommunityState | null>(null);

export function useCommunity() {
  const community = useContext(CommunityContext);
  if (!community) throw new Error("Community views must be rendered inside CommunityApp");
  return community;
}

export default function CommunityApp({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const tab = routes[pathname];
  const currentServiceView = tab === "events" || tab === "services" ? tab : undefined;
  const [previousPath, setPreviousPath] = useState(pathname);
  const [memberDemo, setDemo] = useState<Demo>(emptyDemo);
  const [provider, setProvider] = useState<Provider>();
  const signedIn = !!provider;
  const demo = signedIn ? memberDemo : emptyDemo();
  const [data, setData] = useState<ReturnType<typeof bulletin>>();
  const [lastServiceView, setLastServiceView] = useState<ServiceView>("services");
  const [item, setItem] = useState<Gathering>();
  const [tools, setTools] = useState(false);
  const [reset, setReset] = useState(false);
  const [department, setDepartment] = useState("");
  const [day, setDay] = useState("");
  if (pathname !== previousPath) {
    setPreviousPath(pathname);
    setItem(undefined);
    setTools(false);
    if (currentServiceView) setLastServiceView(currentServiceView);
  }

  useEffect(() => {
    const refresh = () => setData(bulletin(new Date()));
    function restore() {
      try {
        setDemo(restoreDemo(JSON.parse(localStorage.getItem(storageKey) ?? "null")));
      } catch {
        setDemo(emptyDemo());
      }
    }
    const frame = requestAnimationFrame(() => {
      try {
        const session = sessionStorage.getItem("community-preview-provider");
        if (session === "Google" || session === "Apple") setProvider(session);
      } catch { /* The preview remains available in memory. */ }
      try {
        const saved = localStorage.getItem(serviceViewKey);
        if (saved === "events" || saved === "services") setLastServiceView(saved);
      } catch { /* Use Services for the first visit. */ }
      restore();
      refresh();
    });
    const timer = setInterval(refresh, 60000);
    window.addEventListener("storage", restore);
    return () => {
      cancelAnimationFrame(frame);
      clearInterval(timer);
      window.removeEventListener("storage", restore);
    };
  }, []);

  useEffect(() => {
    if (!currentServiceView) return;
    try { localStorage.setItem(serviceViewKey, currentServiceView); } catch { /* Keep selection in memory. */ }
  }, [currentServiceView]);

  function signIn(value?: Provider) {
    setProvider(value);
    try {
      if (value) sessionStorage.setItem("community-preview-provider", value);
      else sessionStorage.removeItem("community-preview-provider");
    } catch { /* Keep the preview available in memory. */ }
  }
  function change(update: (demo: Demo) => Demo, requireStorage = false) {
    const next = update(memberDemo);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      if (requireStorage) return false;
    }
    setDemo(next);
    return true;
  }
  const preview = () => {
    setReset(false);
    setTools(true);
  };
  if (!tab) return children;
  if (!data)
    return (
      <main className="loading" aria-busy="true">
        Opening the bulletin…
      </main>
    );
  const { rosters, gatherings } = scheduleData(data, demo.scheduling);
  const personalShifts = assignments(rosters, demo.scheduling.member).filter(i => i.date >= data.today);
  const opened = item?.kind === "Assignment" ? personalShifts.find(d => d.id === item.id) : item;
  const schedule = new Map<string, Gathering>();
  for (const i of [
    ...Object.values(demo.saved),
    ...Object.values(demo.registrations).map((r) => r.item),
    ...(demo.volunteer ? personalShifts : []),
  ])
    schedule.set(i.id, i);
  const scheduleItems = [...schedule.values()].sort(compare);
  const section = tab === "events" ? "services" : tab === "schedule" ? "profile" : tab;
  const navigation = destinations.map(([k, icon]) => (
    <Link
      key={k}
      href={k === "week" ? "/" : k === "services" ? "/" + (currentServiceView ?? lastServiceView) : "/" + k}
      aria-current={section === k ? (tab === "schedule" ? "location" : "page") : undefined}
    >
      <Icon name={icon} />
      <span>{tabs[k]}</span>
    </Link>
  ));
  return (
    <CommunityContext.Provider value={{
      data, demo, provider, rosters, gatherings, personalShifts, scheduleItems,
      department, setDepartment, day, setDay, signIn, change, preview, setItem,
    }}>
    <div className="app">
      <aside className="rail">
        <Link className="brand" href="/">
          <span className="brandmark">
            <Icon name="week" size={25} />
          </span>
          <span>
            BMCNY<small>Community</small>
          </span>
        </Link>
        <nav aria-label="Main navigation">{navigation}</nav>
        <div className="rail-bottom">
          <small>
            Bethany Miracle Center
            <br />
            New York
          </small>
        </div>
      </aside>
      <main className="content">
        <header className="masthead">
          <span>
            <Icon name="week" size={17} /> Community bulletin
          </span>
          <span className="local">
            <i /> New York, NY
          </span>
        </header>
        <div className="page-heading">
          <span className="eyebrow">
            {dateLabel(data.today, {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <h1>{section === "profile" && !signedIn ? tabs.profile : tab === "events" ? tabs.services : tabs[tab]}</h1>
        </div>
        {children}
        </main>
        <nav className="bottom-nav" aria-label="Mobile navigation">
          {navigation}
        </nav>
        {opened && (
          <Detail
            key={opened.id}
            item={opened}
            roster={opened.rosterId ? rosters[opened.rosterId] : undefined}
            demo={demo}
            change={change}
            signedIn={signedIn}
            onSignIn={signIn}
            onClose={() => setItem(undefined)}
          />
        )}
        {tools && (
          <Dialog title="Preview settings" onClose={() => setTools(false)}>
            <span className="eyebrow">Prototype</span>
            <h2>Preview settings</h2>
            <p>Choose a view to explore the bulletin.</p>
            <form onSubmit={e => {
              e.preventDefault();
              const value = String(new FormData(e.currentTarget).get("persona"));
              change(s => value === "visitor" ? { ...switchMember(s, "alex", false), volunteer: false } :
                switchMember(s, value === "leader" ? "jo" : value, value === "leader"));
              setDepartment("");
              setDay("");
              setTools(false);
              router.push("/schedule");
            }}>
              <label>Preview as<select name="persona" defaultValue={!demo.volunteer ? "visitor" : demo.scheduling.leader ? "leader" : demo.scheduling.member}>
                <option value="visitor">Visitor</option>
                {Object.entries(directory).map(([id, name]) => <option key={id} value={id}>{name} · Volunteer</option>)}
                <option value="leader">Jo Park · Department leader</option>
              </select></label>
              <button className="primary">Open schedule</button>
            </form>
            <hr />
            {reset ? (
              <>
                <p>
                  Clear this browser’s demo schedule, RSVPs, and availability?
                </p>
                <button
                  className="secondary"
                  onClick={() => {
                    change(emptyDemo);
                    setTools(false);
                    setDay("");
                    router.push("/");
                  }}
                >
                  Confirm reset
                </button>
              </>
            ) : (
              <button className="text-btn" onClick={() => setReset(true)}>
                <Icon name="reset" size={16} /> Reset demo
              </button>
            )}
          </Dialog>
        )}
      </div>
    </CommunityContext.Provider>
  );
}
