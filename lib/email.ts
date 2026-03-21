import { Resend } from "resend"

const FROM = process.env.EMAIL_FROM ?? "AgentMatch <info@unagent.ai>"
const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL ?? "https://unagent.ai").trim()

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY environment variable is not set")
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const verifyUrl = `${BASE_URL}/api/auth/verify-email?token=${token}`

  await resend.emails.send({
    from: FROM,
    to,
    subject: "Verify your AgentMatch email address",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                  max-width: 560px; margin: 0 auto; padding: 40px 24px; color: #111;">
        <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 8px;">
          Verify your email address
        </h1>
        <p style="color: #555; line-height: 1.6; margin: 0 0 28px;">
          Thanks for signing up to AgentMatch — the search engine for AI agents.
          Click the button below to confirm your email address.
          This link expires in <strong>24 hours</strong>.
        </p>
        <a href="${verifyUrl}"
           style="display: inline-block; padding: 12px 28px;
                  background: #f59e0b; color: #000;
                  font-weight: 700; text-decoration: none;
                  border-radius: 8px; font-size: 15px;">
          Verify email address
        </a>
        <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 13px; color: #999; line-height: 1.6; margin: 0;">
          If you didn't create an account on AgentMatch, you can safely ignore this email.<br/>
          Or paste this link into your browser:<br/>
          <a href="${verifyUrl}" style="color: #f59e0b; word-break: break-all;">${verifyUrl}</a>
        </p>
      </div>
    `,
  })
}
