import { useNavigate } from "react-router-dom";
import { Gold, Onb } from "../../ui/onb";
import { Episodes } from "../../ui/episodes";
import { hold } from "../../lib/signup";

/* Step 6: the ALKÉ story, three short episodes (src/lib/episodes.js). */
export default function Story() {
  const navigate = useNavigate();
  const done = () => {
    hold(null);
    navigate("/home", { replace: true });
  };
  return (
    <Onb
      step={6}
      label="The story"
      title="The ALKÉ story."
      sub="Three short episodes on where ALKÉ comes from and where it's going."
      footer={
        <>
          <Gold onClick={done}>Go to my dashboard</Gold>
          <p className="onb-note center">All three episodes stay on Home.</p>
        </>
      }
    >
      <Episodes />
    </Onb>
  );
}
