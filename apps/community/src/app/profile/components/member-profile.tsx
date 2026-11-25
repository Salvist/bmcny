import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ProviderMark, type Provider } from "@/app/components/account";
import { Dialog } from "@/app/components/detail-dialog";
import { Icon } from "@/app/components/icons";
import { sampleAccount, type Demo, type MemberProfile, type Preferences } from "@/app/model/bulletin";

function Avatar({ profile }: { profile: MemberProfile }) {
  const words = profile.name.trim().split(/\s+/);
  const initials = [words[0], ...(words.length > 1 ? words.slice(-1) : [])]
    .map((part) => Array.from(part)[0]).join("").toLocaleUpperCase();
  return <span className="member-avatar" aria-hidden="true">
    {profile.photo
      // Uploaded avatars are small, local data URLs.
      // eslint-disable-next-line @next/next/no-img-element
      ? <img src={profile.photo} alt="" /> : initials}
  </span>;
}

async function readPhoto(file: File) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Choose a JPG, PNG, or WebP image.");
  }
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error();
    const side = Math.min(bitmap.width, bitmap.height);
    ctx.drawImage(bitmap, (bitmap.width-side)/2, (bitmap.height-side)/2, side, side, 0, 0, 256, 256);
    return canvas.toDataURL("image/png");
  } finally {
    bitmap.close();
  }
}

type Save<T> = (value: T) => boolean;
const storageError = "Couldn’t save to this browser. Your edits are still here. Check browser storage and try again.";

function ProfileEditor({ profile, save, close }: { profile: MemberProfile; save: Save<MemberProfile>; close: () => void }) {
  const [draft, setDraft] = useState(profile);
  const [error, setError] = useState("");
  const [reading, setReading] = useState(false);
  return <Dialog title="Edit profile" onClose={close}>
    <h2>Edit profile</h2>
    <form onSubmit={(event) => {
      event.preventDefault();
      if (reading) return;
      if (save({ ...draft, name: draft.name.trim(), email: draft.email.trim(), phone: draft.phone.trim() })) close();
      else setError(storageError);
    }}>
      <div className="photo-editor">
        <Avatar profile={draft} />
        <div>
          <label>Profile photo
            <input type="file" accept="image/jpeg,image/png,image/webp" disabled={reading} onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              setReading(true);
              setError("");
              try {
                const photo = await readPhoto(file);
                setDraft((current) => ({ ...current, photo }));
              } catch {
                setError("Couldn’t read this photo. Choose a JPG, PNG, or WebP image and try again.");
              } finally {
                setReading(false);
              }
            }} />
          </label>
          {draft.photo && <button type="button" className="text-btn" disabled={reading} onClick={() => setDraft({ ...draft, photo: "" })}>Remove photo</button>}
        </div>
      </div>
      <label>Display name<input autoComplete="name" required pattern=".*\S.*" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} /></label>
      <label>Contact email<input type="email" autoComplete="email" required value={draft.email} onChange={e => setDraft({ ...draft, email: e.target.value })} /></label>
      <label>Phone number (optional)<input type="tel" autoComplete="tel" value={draft.phone} onChange={e => setDraft({ ...draft, phone: e.target.value })} /></label>
      {error && <p role="alert">{error}</p>}
      <div className="actions"><button className="primary" disabled={reading}>Save changes</button><button type="button" className="secondary" onClick={close}>Cancel</button></div>
    </form>
  </Dialog>;
}

function Notifications({ demo, save, close }: { demo: Demo; save: Save<Preferences>; close: () => void }) {
  const [draft, setDraft] = useState(demo.preferences);
  const [error, setError] = useState(false);
  const options = { gatherings: "Gathering reminders", rsvps: "RSVP updates", assignments: "Assignment reminders" } as const;
  return <Dialog title="Notifications" onClose={close}>
    <h2>Notifications</h2>
    <p>Preview settings are saved on this device.</p>
    {(Object.keys(options) as (keyof Preferences)[]).filter(k => k !== "assignments" || demo.volunteer).map(k =>
      <label className="preference" key={k}>{options[k]}<input type="checkbox" role="switch" checked={draft[k]} onChange={e => setDraft({ ...draft, [k]: e.target.checked })} /></label>
    )}
    {error && <p role="alert">{storageError}</p>}
    <div className="actions"><button className="primary" onClick={() => save(draft) ? close() : setError(true)}>Save changes</button><button className="secondary" onClick={close}>Cancel</button></div>
  </Dialog>;
}

export function MemberPage({ demo, provider, saveProfile, savePreferences, onPreview, onSignOut, serving, children }: {
  demo: Demo; provider: Provider; saveProfile: Save<MemberProfile>; savePreferences: Save<Preferences>;
  onPreview: () => void; onSignOut: () => void; serving?: ReactNode; children: ReactNode;
}) {
  const [panel, setPanel] = useState<"details" | "notifications" | "provider">();
  const close = () => setPanel(undefined);
  return <>
    <section className="member-identity">
      <Avatar profile={demo.profile} />
      <div><h2>{demo.profile.name}</h2><p>{demo.profile.email}</p></div>
      <button className="secondary" onClick={() => setPanel("details")}>Edit profile</button>
    </section>
    <div className="member-columns">
      <div>
        <section><h2>My Schedule</h2>
          {children || <div className="member-empty"><Icon name="schedule" /><h3>No upcoming gatherings</h3>
            <div className="actions"><Link href="/events">Browse events</Link></div>
          </div>}
          <Link className="member-link" href="/schedule">View schedule <Icon name="arrow" size={16} /></Link>
        </section>
        {serving !== undefined && <section className="member-serving"><h2>Serving</h2>
          {serving || <div className="member-empty"><Icon name="schedule" /><h3>No upcoming assignments</h3></div>}
          <Link className="member-link" href="/serving">View serving schedule <Icon name="arrow" size={16} /></Link>
        </section>}
      </div>
      <section><h2>Account settings</h2>
        <div className="member-settings">
          <button onClick={() => setPanel("details")}><Icon name="person" />Personal details<Icon name="chevron" size={16}/></button>
          <button onClick={() => setPanel("notifications")}><Icon name="bell" />Notifications<Icon name="chevron" size={16}/></button>
          <button onClick={() => setPanel("provider")}><ProviderMark provider={provider}/>Sign-in method ({provider})<Icon name="chevron" size={16}/></button>
        </div>
        <div className="member-footer"><button onClick={onSignOut}>Sign out</button><button onClick={onPreview}>Preview settings</button></div>
      </section>
    </div>
    {panel === "details" && <ProfileEditor profile={demo.profile} save={saveProfile} close={close}/>}
    {panel === "notifications" && <Notifications demo={demo} save={savePreferences} close={close}/>}
    {panel === "provider" && <Dialog title="Sign-in method" onClose={close}><h2>Sign-in method</h2>
      <div className="member-provider"><ProviderMark provider={provider}/><strong>{provider}</strong></div>
      <p>Sample account · {sampleAccount.email}</p>
      <button className="secondary" onClick={close}>Done</button>
    </Dialog>}
  </>;
}
