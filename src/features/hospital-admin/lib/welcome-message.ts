/** The most text (not HTML) a welcome message can hold. */
export const MESSAGE_LIMIT = 1500;

const escape = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * The default welcome message for a new team member, as editor HTML: a greeting, the email they
 * log in with in bold, and the admin's name. The API emails them a temporary password with it, so
 * the message doesn't carry one. Blank values keep the design's "[Name]" placeholders.
 */
export function welcomeMessage({
  name,
  email,
  from,
}: {
  name: string;
  email: string;
  from: string;
}) {
  return [
    `<p>Hi ${escape(name.trim() || "[Name]")},</p>`,
    "<p>Welcome onboard! You can log into your private dashboard with the email below and the temporary password we’ll send you separately. Kindly change your password once you log in.</p>",
    `<p><strong>Email: ${escape(email.trim())}</strong></p>`,
    `<p>${escape(from)}</p>`,
  ].join("");
}

/** The text of a message's HTML, for checking it isn't empty or too long. */
export function messageText(html: string) {
  return html
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");
}
