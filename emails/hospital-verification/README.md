# Hospital verification email

Sent to a healthcare facility after it submits "Register your facility". `index.html` is a
self-contained, email-safe template (table layout, inline styles); the backend fills in the
placeholders and sends it.

## Placeholders

| Placeholder                                                 | Value                                                               |
| ----------------------------------------------------------- | ------------------------------------------------------------------- |
| `{{hospital_name}}`                                         | The organisation name from the form                                 |
| `{{verification_url}}`                                      | `https://hospital.<domain>/verify?token=<token>`, the upload page   |
| `{{asset_base_url}}`                                        | Public URL where the files in `assets/` are hosted, no trailing `/` |
| `{{website_url}}`                                           | DocuHealth home page (the logo links here)                          |
| `{{facebook_url}}`, `{{instagram_url}}`, `{{linkedin_url}}` | Social profile links                                                |
| `{{year}}`                                                  | Current year, for the footer                                        |

`{{…}}` matches Django, Jinja and Handlebars syntax; rename if the backend uses something else.

## Assets

`assets/` holds 2x PNGs (email clients don't support SVG). Host them at a public HTTPS URL and set
`{{asset_base_url}}` to it — relative paths don't work in email.

## Notes

- Fonts: Space Grotesk and Inter load where the client allows web fonts (Apple Mail, iOS);
  Gmail and Outlook fall back to Arial.
- On screens under 600px the shield badge is hidden and the title shrinks.
- Test in a real client (or Litmus / Email on Acid) before shipping.
