const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResultData {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
  mode: string;
  modeValue: number;
  language: string;
}

interface RequestBody {
  result: ResultData;
  xpGain?: {
    base: number;
    accuracyBonus: number;
    lengthBonus: number;
    streakBonus: number;
    dailyChallengeBonus: number;
    total: number;
  } | null;
  weakKeys?: { key: string; errors: number; totalAttempts: number; errorRate: number }[];
  topPercent: number;
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  const base64 = token.split('.')[1];
  const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
  return JSON.parse(json);
}

function buildEmailHtml(
  result: ResultData,
  topPercent: number,
  xpGain?: RequestBody['xpGain'],
  weakKeys?: RequestBody['weakKeys'],
): string {
  const modeLabel = result.mode === 'time'
    ? `${result.mode} ${result.modeValue}s`
    : `${result.mode} ${result.modeValue}`;

  const xpSection = xpGain ? `
    <tr><td colspan="2" style="padding:20px 0 8px;font-size:13px;font-weight:600;color:#ffb347;">XP Earned</td></tr>
    <tr>
      <td style="padding:4px 0;font-size:13px;color:#9a95b8;">Base XP</td>
      <td style="padding:4px 0;font-size:13px;color:#e8e2d6;text-align:right;">+${xpGain.base}</td>
    </tr>
    ${xpGain.accuracyBonus > 0 ? `<tr><td style="padding:4px 0;font-size:13px;color:#9a95b8;">Accuracy Bonus</td><td style="padding:4px 0;font-size:13px;color:#e8e2d6;text-align:right;">+${xpGain.accuracyBonus}</td></tr>` : ''}
    ${xpGain.lengthBonus > 0 ? `<tr><td style="padding:4px 0;font-size:13px;color:#9a95b8;">Length Bonus</td><td style="padding:4px 0;font-size:13px;color:#e8e2d6;text-align:right;">+${xpGain.lengthBonus}</td></tr>` : ''}
    ${xpGain.streakBonus > 0 ? `<tr><td style="padding:4px 0;font-size:13px;color:#9a95b8;">Streak Bonus</td><td style="padding:4px 0;font-size:13px;color:#e8e2d6;text-align:right;">+${xpGain.streakBonus}</td></tr>` : ''}
    ${xpGain.dailyChallengeBonus > 0 ? `<tr><td style="padding:4px 0;font-size:13px;color:#9a95b8;">Daily Challenge Bonus</td><td style="padding:4px 0;font-size:13px;color:#e8e2d6;text-align:right;">+${xpGain.dailyChallengeBonus}</td></tr>` : ''}
    <tr>
      <td style="padding:8px 0 0;font-size:14px;font-weight:700;color:#ffb347;">Total XP</td>
      <td style="padding:8px 0 0;font-size:14px;font-weight:700;color:#ffb347;text-align:right;">+${xpGain.total}</td>
    </tr>
  ` : '';

  const weakKeysSection = weakKeys && weakKeys.length > 0 ? `
    <tr><td colspan="2" style="padding:20px 0 8px;font-size:13px;font-weight:600;color:#ff6b6b;">Weak Keys</td></tr>
    <tr><td colspan="2" style="padding:4px 0;">
      ${weakKeys.map(k => `<span style="display:inline-block;margin:2px 4px 2px 0;padding:4px 10px;border-radius:6px;background:#1a1b2e;border:1px solid #ff6b6b;font-size:13px;font-family:monospace;"><span style="font-weight:700;color:#ff6b6b;text-transform:uppercase;">${k.key}</span> <span style="font-size:11px;color:#9a95b8;">${k.errors}/${k.totalAttempts}</span></span>`).join('')}
    </td></tr>
  ` : '';

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0e0f1a;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:32px 24px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:24px;font-weight:700;color:#ffb347;letter-spacing:1px;">DuckType</div>
      <div style="font-size:13px;color:#6b6893;margin-top:4px;">Your Typing Report</div>
    </div>

    <!-- Percentile Badge -->
    <div style="text-align:center;margin-bottom:24px;">
      <span style="display:inline-block;padding:6px 18px;border-radius:999px;font-size:13px;font-weight:600;background:${topPercent <= 10 ? '#ffb347' : '#141525'};color:${topPercent <= 10 ? '#0e0f1a' : '#6b6893'};">
        Top ${topPercent}%
      </span>
    </div>

    <!-- Main Stats -->
    <div style="background:#141525;border-radius:12px;padding:28px;margin-bottom:16px;text-align:center;">
      <div style="font-size:48px;font-weight:700;color:#ffb347;line-height:1;">${result.wpm}</div>
      <div style="font-size:12px;color:#6b6893;margin-top:4px;text-transform:uppercase;letter-spacing:1px;">words per minute</div>
    </div>

    <div style="display:flex;gap:12px;margin-bottom:24px;">
      <!--[if mso]><table role="presentation" width="100%"><tr><td width="33%" valign="top"><![endif]-->
      <div style="flex:1;background:#141525;border-radius:10px;padding:16px;text-align:center;">
        <div style="font-size:22px;font-weight:700;color:#e8e2d6;">${result.accuracy}%</div>
        <div style="font-size:11px;color:#6b6893;margin-top:2px;">accuracy</div>
      </div>
      <!--[if mso]></td><td width="33%" valign="top"><![endif]-->
      <div style="flex:1;background:#141525;border-radius:10px;padding:16px;text-align:center;">
        <div style="font-size:22px;font-weight:700;color:#e8e2d6;">${result.consistency}%</div>
        <div style="font-size:11px;color:#6b6893;margin-top:2px;">consistency</div>
      </div>
      <!--[if mso]></td><td width="33%" valign="top"><![endif]-->
      <div style="flex:1;background:#141525;border-radius:10px;padding:16px;text-align:center;">
        <div style="font-size:22px;font-weight:700;color:#e8e2d6;">${result.rawWpm}</div>
        <div style="font-size:11px;color:#6b6893;margin-top:2px;">raw wpm</div>
      </div>
      <!--[if mso]></td></tr></table><![endif]-->
    </div>

    <!-- Details Table -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#141525;border-radius:10px;padding:16px 20px;">
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#6b6893;">Test Mode</td>
        <td style="padding:6px 0;font-size:13px;color:#e8e2d6;text-align:right;">${modeLabel}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#6b6893;">Language</td>
        <td style="padding:6px 0;font-size:13px;color:#e8e2d6;text-align:right;">${result.language}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#6b6893;">Characters</td>
        <td style="padding:6px 0;font-size:13px;text-align:right;">
          <span style="color:#ffb347;">${result.correctChars}</span><span style="color:#6b6893;"> / </span><span style="color:#ff6b6b;">${result.incorrectChars}</span><span style="color:#6b6893;"> / </span><span style="color:#b8860b;">${result.extraChars}</span><span style="color:#6b6893;"> / </span><span style="color:#6b6893;">${result.missedChars}</span>
        </td>
      </tr>
      ${xpSection}
      ${weakKeysSection}
    </table>

    <!-- Footer -->
    <div style="text-align:center;margin-top:32px;padding-top:20px;border-top:1px solid #1e1f33;">
      <a href="https://ducktype.xyz" style="display:inline-block;padding:10px 24px;background:#ffb347;color:#0e0f1a;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">Practice more at ducktype.xyz</a>
      <div style="font-size:11px;color:#4a4670;margin-top:16px;">You received this email because you requested a typing report from DuckType.</div>
    </div>
  </div>
</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // Extract and verify user email from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const token = authHeader.replace('Bearer ', '');
    let userEmail: string;
    try {
      const payload = decodeJwtPayload(token);
      userEmail = payload.email as string;
      if (!userEmail) {
        throw new Error('No email in token');
      }
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid token or no email found' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { result, xpGain, weakKeys, topPercent } = await req.json() as RequestBody;

    const emailHtml = buildEmailHtml(result, topPercent, xpGain, weakKeys);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'DuckType <noreply@ducktype.xyz>',
        to: [userEmail],
        subject: `Your Typing Report — ${result.wpm} WPM`,
        html: emailHtml,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: data }),
        { status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
