import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { send } = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock("resend", () => ({ Resend: class { emails = { send }; } }));
import { POST } from "@/app/api/contact/route";

const sample = { name: "Local Test", email: "local-test@example.invalid", phone: "", category: "labor", source: "ai", message: "Local regression test" };
const request = (body: object) => new NextRequest("http://localhost/api/contact", { method: "POST", body: JSON.stringify(body) });

describe("contact routing (all email delivery mocked)", () => {
  beforeEach(() => { send.mockReset(); send.mockResolvedValue({ data: { id: "test-only" }, error: null }); });
  it.each([
    ["realestate", "bukken", "四葉不動産", "物件を探してほしい（希望条件）"],
    ["legal", "visa", "四葉行政書士事務所", "ビザ・在留資格"],
    ["legal", "kyoninka", "四葉行政書士事務所", "会社設立・各種許認可"],
    ["labor", "labor", "四葉社会保険労務士事務所", "社会保険・労務"],
  ])("preserves recipients and data for %s", async (business, category, label, categoryLabel) => {
    const response = await POST(request({ ...sample, business, category }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(send).toHaveBeenCalledTimes(2);
    const [notification] = send.mock.calls[0];
    const [reply] = send.mock.calls[1];
    expect(notification).toMatchObject({ to: "uramatsujoji@luck428.com", from: `${label} <noreply@samurai.co.jp>`, replyTo: sample.email });
    expect(notification.html).toContain(categoryLabel);
    expect(notification.html).toContain("ChatGPT・Claude などのAIに聞いて");
    expect(notification.html).toContain(sample.message);
    expect(reply.to).toBe(sample.email);
    expect(reply.subject).toContain(label);
  });
  // 2026-09-24：大家募集ページの専用フォーム（category=gh-owner）は「メールまたは電話のどちらか必須」。
  it("gh-owner: 電話のみでも受け付け、自動返信は送らず通知メールだけを送る", async () => {
    const response = await POST(request({ ...sample, email: "", phone: "03-0000-0000", category: "gh-owner", business: "realestate", message: "【グループホーム向け物件のご相談】\n所在地：文京区小日向" }));
    expect(response.status).toBe(200);
    expect(send).toHaveBeenCalledTimes(1);
    const [notification] = send.mock.calls[0];
    expect(notification).toMatchObject({ to: "uramatsujoji@luck428.com", from: "四葉不動産 <noreply@samurai.co.jp>" });
    expect(notification).not.toHaveProperty("replyTo");
    expect(notification.html).toContain("グループホーム向けに物件を貸したい（大家・オーナー）");
    expect(notification.html).toContain("所在地：文京区小日向");
    expect(notification.html).toContain("未入力（電話でご連絡ください）");
    expect(notification.html).not.toContain("mailto:");
  });
  it("gh-owner: メールと電話の両方が空なら 400（送信しない）", async () => {
    const response = await POST(request({ ...sample, email: "", phone: "", category: "gh-owner", business: "realestate" }));
    expect(response.status).toBe(400);
    expect((await response.json()).errors.email).toEqual(["メールアドレスまたは電話番号を入力してください"]);
    expect(send).not.toHaveBeenCalled();
  });
  it("gh-owner 以外は従来どおりメール必須（電話があっても 400）", async () => {
    const response = await POST(request({ ...sample, email: "", phone: "03-0000-0000", category: "akiya", business: "realestate" }));
    expect(response.status).toBe(400);
    expect((await response.json()).errors.email).toEqual(["有効なメールアドレスを入力してください"]);
    expect(send).not.toHaveBeenCalled();
  });
  it("形式が不正なメールは category を問わず 400", async () => {
    const response = await POST(request({ ...sample, email: "not-an-email", category: "gh-owner", business: "realestate" }));
    expect(response.status).toBe(400);
    expect((await response.json()).errors.email).toEqual(["有効なメールアドレスを入力してください"]);
    expect(send).not.toHaveBeenCalled();
  });
  it("rejects an empty category without contacting the email provider", async () => {
    const response = await POST(request({ ...sample, category: "", business: "labor" }));
    expect(response.status).toBe(400);
    expect((await response.json()).errors.category).toBeTruthy();
    expect(send).not.toHaveBeenCalled();
  });
  it("returns a failure when the provider throws", async () => {
    send.mockRejectedValueOnce(new Error("mock unavailable"));
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const response = await POST(request({ ...sample, business: "labor" }));
      expect(response.status).toBe(500);
      expect(await response.json()).toHaveProperty("error");
      expect(send).toHaveBeenCalledTimes(1);
    } finally { log.mockRestore(); }
  });
});
