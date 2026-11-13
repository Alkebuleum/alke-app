import { Button, Logo, Page } from "../../ui/ob";

export default function Welcome() {
  return (
    <Page
      bar={<header className="ob-bar" />}
      footer={
        <>
          <Button to="/how-it-works">Get started</Button>
          <Button kind="ghost" to="/sign-in">
            I already have an account
          </Button>
        </>
      }
    >
      <div style={{ margin: "auto 0", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 28 }}>
        <Logo size={96} />
        <div>
          <h1 className="ob-title xl">
            Join the network.
            <br />
            Shape the future.
          </h1>
          <p className="ob-sub">The community home of the Alkebuleum blockchain.</p>
        </div>
      </div>
    </Page>
  );
}
