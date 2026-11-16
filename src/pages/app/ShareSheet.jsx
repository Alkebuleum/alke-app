import { useEffect, useState } from "react";
import { copyText } from "../../lib/clipboard";
import { Button } from "../../ui/ob";
import { canShareFile, shareCardFile } from "./shareCard";

/* Preview of the share card with Share / Save / Copy link. Sharing runs from
   the tap on this sheet, so phones allow it (they refuse a share sheet that
   opens after the card's async drawing). */
export function ShareSheet({ card, onClose }) {
  const [note, setNote] = useState(null);
  const canShare = canShareFile(card);

  useEffect(() => {
    if (!card) return;
    const esc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [card, onClose]);
  useEffect(() => () => card && URL.revokeObjectURL(card.url), [card]);

  if (!card) return null;

  const share = async () => {
    setNote(null);
    try {
      if ((await shareCardFile(card)) === "shared") onClose();
    } catch {
      setNote("Sharing isn't available here. Save the image instead, or copy your invite link.");
    }
  };
  const copy = async () => setNote((await copyText(card.link)) ? "Invite link copied" : "Couldn't copy. Press and hold the link in Network to copy it.");

  return (
    <div className="ob-sheet" role="dialog" aria-modal="true" aria-label="Share card" onClick={onClose}>
      <div className="ob-sheet-card" onClick={(e) => e.stopPropagation()}>
        <img src={card.url} alt="Your ALKE share card" />
        <div className="ob-sheet-actions">
          {canShare ? <Button onClick={share}>Share</Button> : null}
          <a className={`ob-btn ${canShare ? "secondary" : "primary"}`} href={card.url} download="alke.png" onClick={() => setNote("If nothing downloads, press and hold the image to save it.")}>
            Save image
          </a>
          <Button kind="secondary" onClick={copy}>
            Copy invite link
          </Button>
          <Button kind="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        {note ? <p className="ob-small center" role="status">{note}</p> : null}
      </div>
    </div>
  );
}
