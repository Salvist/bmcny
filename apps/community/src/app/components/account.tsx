import { useState } from "react";
import { Dialog } from "./detail-dialog";
import { sampleAccount } from "../model/bulletin";

export type Provider = "Google" | "Apple";

export function ProviderMark({ provider }: { provider: Provider }) {
  return provider === "Apple" ? (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M17.05 12.54c.03 3 2.63 4 2.66 4.02-.02.07-.42 1.42-1.37 2.82-.82 1.2-1.67 2.4-3.01 2.42-1.32.03-1.75-.78-3.26-.78-1.52 0-1.99.76-3.23.81-1.29.05-2.28-1.3-3.11-2.49-1.68-2.43-2.96-6.86-1.24-9.85a4.83 4.83 0 0 1 4.09-2.48c1.28-.03 2.49.86 3.27.86.78 0 2.24-1.06 3.78-.9.65.03 2.46.26 3.62 1.96-.09.06-2.16 1.27-2.2 3.61ZM14.58 5.38c.69-.85 1.16-2.03 1.03-3.21-1 .04-2.21.67-2.93 1.51-.64.74-1.2 1.93-1.04 3.06 1.12.09 2.26-.57 2.94-1.36Z"/>
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z"/>
      <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 1.9-6.9 1.9-5.3 0-9.9-3.6-11.5-8.4H5.7v5.2A20.4 20.4 0 0 0 24 44Z"/>
      <path fill="#FBBC05" d="M12.5 27.5a12.1 12.1 0 0 1 0-7.1v-5.2H5.7a20 20 0 0 0 0 17.5l6.8-5.2Z"/>
      <path fill="#EA4335" d="M24 12.1c3 0 5.6 1 7.7 3l5.8-5.7A19.6 19.6 0 0 0 24 4 20.4 20.4 0 0 0 5.7 15.2l6.8 5.2A12.2 12.2 0 0 1 24 12.1Z"/>
    </svg>
  );
}

export function AccountChoices({ onContinue }: { onContinue: (provider: Provider) => void }) {
  const [provider, setProvider] = useState<Provider>();
  const [failed, setFailed] = useState(false);
  return (
    <>
      {failed && <p role="alert">We couldn’t sign you in. Try again or choose another option.</p>}
      <div className="provider-list">
        {(["Google", "Apple"] as const).map((name) => (
          <button key={name} className={`provider-button ${name.toLowerCase()}`} onClick={() => {
            setFailed(false);
            setProvider(name);
          }}>
            <ProviderMark provider={name} /> Continue with {name}
          </button>
        ))}
      </div>
      {provider && <Dialog title={`${provider} sign-in preview`} onClose={() => setProvider(undefined)}>
        <span className="eyebrow">Design preview</span>
        <h2>Continue with {provider}</h2>
        <p>Use the sample profile to try this flow.</p>
        <div className="actions">
          <button className="primary" onClick={() => onContinue(provider)}>Continue as {sampleAccount.name}</button>
          <button className="secondary" onClick={() => setProvider(undefined)}>Cancel</button>
        </div>
        <button className="text-btn preview-error" onClick={() => {
          setProvider(undefined);
          setFailed(true);
        }}>Preview sign-in error</button>
      </Dialog>}
    </>
  );
}
