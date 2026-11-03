/** The most text (not HTML) a welcome message can hold. */
export const MESSAGE_LIMIT = 1500;

const escape = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * The default welcome message for a new team member, as editor HTML: a greeting, their login
 * details in bold, and the admin's name. Blank values keep the design's "[Name]" placeholders.
 */
export function welcomeMessage({
  name,
  email,
  password,
  from,
}: {
  name: string;
  email: string;
  password: string;
  from: string;
}) {
  return [
    `<p>Hi ${escape(name.trim() || "[Name]")},</p>`,
    "<p>Welcome onboard! You can log into your private dashboard using the login credentials below. Kindly note that you can reset your password once you log in.</p>",
    `<p><strong>Email: ${escape(email.trim())}<br>Password: ${escape(password)}</strong></p>`,
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
