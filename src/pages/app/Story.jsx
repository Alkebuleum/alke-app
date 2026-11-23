import { useSearchParams } from "react-router-dom";
import { EPISODES } from "../../lib/episodes";
import { Episodes } from "../../ui/episodes";
import { AppPage, SubBar } from "../../ui/shell";

/* The ALKÉ story from Home: the same three episodes as onboarding step 6.
   /episodes?ep=2 opens on episode 2. */
export default function StoryEpisodes() {
  const [q] = useSearchParams();
  const n = Math.min(Math.max(Number(q.get("ep")) || 1, 1), EPISODES.length);
  return (
    <AppPage tab="home" bar={<SubBar title="The ALKÉ story" back="/home" />}>
      <Episodes start={n - 1} />
    </AppPage>
  );
}
