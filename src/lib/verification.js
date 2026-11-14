/* Personhood check (see functions/verification.js).
 *
 *   status: none | pending | processing | needs_input | manual | review | verified | rejected
 *   method: stripe | manual
 */
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { app, db, functions } from "./firebase";
import { useAuth } from "../auth/AuthProvider";

/** The member's verification status, live. undefined while loading. */
export function useVerification() {
  const { nuruId } = useAuth();
  const [v, setV] = useState(undefined);
  useEffect(() => {
    if (!nuruId) return;
    return onSnapshot(
      doc(db, "alke_members", nuruId, "verification", "status"),
      (s) => setV(s.exists() ? s.data() : { status: "none" }),
      () => setV({ status: "none" }),
    );
  }, [nuruId]);
  return v;
}

export const isVerified = (v) => v?.status === "verified";

/** "Done" / "In review" / "Not yet", for status rows. */
export function verificationLabel(v) {
  if (!v) return "…";
  return { verified: "Done", review: "In review", pending: "In progress", processing: "Checking", needs_input: "Try again", rejected: "Not approved" }[v.status] || "Not yet";
}

const call = (name) => async (data) => (await httpsCallable(functions, name)(data)).data;

/** Starts the check for the country of residence: { method: "stripe", url } or { method: "manual" }. */
export const startVerification = call("alkeVerifyStart");
/** Sends the manual-review details once the photos are uploaded. */
export const submitManualVerification = call("alkeVerifySubmit");

/** Uploads one review photo (key: id-front | id-back | selfie) to the member's private folder. */
export async function uploadVerificationPhoto(nuruId, key, file) {
  const ext = (/\.(jpe?g|png|webp|heic)$/i.exec(file.name || "")?.[1] || (file.type.split("/")[1] || "jpg")).toLowerCase().replace("jpeg", "jpg");
  const path = `alke_verification/${nuruId}/${key}.${ext === "jpeg" ? "jpg" : ext}`;
  await uploadBytes(ref(getStorage(app), path), file, { contentType: file.type || "image/jpeg" });
  return path;
}

/* The ALKE team's review tools. */
export const amIAdmin = async () => (await call("alkeIsAdmin")({}))?.admin === true;
export const listReviews = async () => (await call("alkeReviewList")({}))?.reviews || [];
export const decideReview = call("alkeReviewDecide");

/* Countries for the picker (ISO 3166-1 alpha-2), named in the reader's language. */
const CODES =
  "AF AX AL DZ AS AD AO AI AG AR AM AW AU AT AZ BS BH BD BB BY BE BZ BJ BM BT BO BA BW BR VG BN BG BF BI KH CM CA CV KY CF TD CL CN CO KM CG CD CK CR CI HR CU CW CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FK FO FJ FI FR GF PF GA GM GE DE GH GI GR GL GD GP GU GT GG GN GW GY HT HN HK HU IS IN ID IR IQ IE IM IL IT JM JP JE JO KZ KE KI XK KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MQ MR MU YT MX FM MD MC MN ME MS MA MZ MM NA NR NP NL NC NZ NI NE NG NU KP MK MP NO OM PK PW PS PA PG PY PE PH PL PT PR QA RE RO RU RW WS SM ST SA SN RS SC SL SG SX SK SI SB SO ZA KR SS ES LK KN LC VC SD SR SE CH SY TW TJ TZ TH TL TG TO TT TN TR TM TC TV UG UA AE GB US UY UZ VU VA VE VN VI YE ZM ZW".split(
    " ",
  );

export function countries() {
  let names;
  try {
    names = new Intl.DisplayNames([navigator.language || "en"], { type: "region" });
  } catch {
    names = { of: (c) => c };
  }
  return CODES.map((code) => ({ code, name: names.of(code) || code })).sort((a, b) => a.name.localeCompare(b.name));
}
