import { AccountChoices, type Provider } from "./account";
import { Icon } from "./icons";

export function ProfileSignIn({ onContinue }: { onContinue: (provider: Provider) => void }) {
  return (
    <section className="account-panel">
      <span className="icon-tile"><Icon name="person" /></span>
      <h2>Welcome to your community profile</h2>
      <p>Sign in or create an account to RSVP to events and see your schedule.</p>
      <AccountChoices onContinue={onContinue} />
    </section>
  );
}
