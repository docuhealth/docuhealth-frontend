// The hospital logo arrives with the staff profile, so the first-load splash would
// never have it. Remember it for the session (same lifetime as hospital_token,
// cleared together on logout) so later loads can brand the splash.
const LOGO_KEY = "hospital_logo";

export function rememberHospitalLogo(url?: string | null) {
  if (!url) return;
  try {
    sessionStorage.setItem(LOGO_KEY, url);
  } catch {
    // storage blocked: the loader just falls back to the DocuHealth logo
  }
}

export function getRememberedHospitalLogo(): string | null {
  try {
    return sessionStorage.getItem(LOGO_KEY);
  } catch {
    return null;
  }
}
