import { describe, expect, it } from "vitest";
import { messageText, welcomeMessage } from "@/features/hospital-admin/lib/welcome-message";

describe("welcomeMessage", () => {
  it("greets them and puts their login details in bold", () => {
    const html = welcomeMessage({
      name: "Joe",
      email: "joe@luth.example.com",
      password: "Password123!",
      from: "Dr. Folake Adeyemi",
    });
    expect(html).toContain("<p>Hi Joe,</p>");
    expect(html).toContain(
      "<strong>Email: joe@luth.example.com<br>Password: Password123!</strong>",
    );
    expect(html).toContain("<p>Dr. Folake Adeyemi</p>");
  });

  it("keeps a [Name] placeholder until there's a name", () => {
    expect(welcomeMessage({ name: " ", email: "", password: "", from: "Ada" })).toContain(
      "<p>Hi [Name],</p>",
    );
  });

  it("escapes what people type so it stays text", () => {
    const html = welcomeMessage({ name: "<b>Jo</b>", email: "", password: "a&b", from: "Ada" });
    expect(html).toContain("Hi &lt;b&gt;Jo&lt;/b&gt;,");
    expect(html).toContain("Password: a&amp;b");
  });
});

describe("messageText", () => {
  it("drops tags, turns line breaks into newlines and unescapes entities", () => {
    expect(messageText("<p><strong>A &amp; B<br>C</strong></p>")).toBe("A & B\nC");
  });

  it("is empty for an empty editor", () => {
    expect(messageText("<p></p>").trim()).toBe("");
  });
});
