import { Bar, Button, Heading, Page } from "../../ui/ob";

const STEPS = [
  ["Tap once a day", "Starts a 24-hour session. Nothing runs on your phone."],
  ["Learn and play", "Lessons and games build your community record."],
  ["Qualify for a share", "Of the community allocation, locked until release."],
];

export default function HowItWorks() {
  return (
    <Page bar={<Bar back="/welcome" />} footer={<Button to="/sign-up">Create my account</Button>}>
      <Heading title="How it works" />

      <ol className="ob-steps">
        {STEPS.map(([t, d], i) => (
          <li key={t}>
            <span className="num">{i + 1}</span>
            <div>
              <b>{t}</b>
              <span>{d}</span>
            </div>
          </li>
        ))}
      </ol>

      <p className="ob-small ob-push">Free to join. No wallet or purchase needed. No price or returns are promised.</p>
    </Page>
  );
}
