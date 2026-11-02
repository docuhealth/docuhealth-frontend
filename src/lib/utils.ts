import { createCn } from "cn/config";

/** The design's type roles, defined as `type-*` utilities in src/index.css. */
const typeRoles = [
  "h1",
  "h2",
  "h3",
  "heading-sm",
  "heading-sm-regular",
  "quote",
  "accent-h1",
  "accent-h2",
  "accent-h3",
  "accent-h4",
  "body",
  "body-sm",
  "body-sm-regular",
  "body-sm-tight",
  "link-sm",
  "caption",
  "caption-tight",
  "label",
];

/**
 * clsx + tailwind-merge, taught that a `type-*` role sets font, size, weight, line height,
 * tracking and case together — so `cn("text-sm font-medium", "type-h2")` keeps only `type-h2`.
 */
export const cn = createCn({
  extend: {
    classGroups: { "type-role": [{ type: typeRoles }] },
    conflictingClassGroups: {
      "type-role": [
        "font-family",
        "font-size",
        "font-weight",
        "leading",
        "tracking",
        "text-transform",
      ],
    },
  },
});
