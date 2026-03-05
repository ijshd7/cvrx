import * as cheerio from "cheerio";

const MIN_CONTENT_LENGTH = 200;

const AUTH_PAGE_PATTERNS = [
  /\bsign\s*in\b/i,
  /\blog\s*in\b/i,
  /\bpassword\s*reset\b/i,
  /\breset\s*(your\s*)?password\b/i,
  /\bforgot\s*(your\s*)?password\b/i,
  /\bcreate\s*(an?\s*)?account\b/i,
  /\benter\s*your\s*(email|password)\b/i,
  /\bauthenticat(e|ion)\b/i,
];

function looksLikeAuthPage(text: string): boolean {
  const lower = text.toLowerCase();
  const matches = AUTH_PAGE_PATTERNS.filter((p) => p.test(lower));
  // If multiple auth patterns match and the text is short, it's likely a login page
  return matches.length >= 2 && text.length < 2000;
}

function looksLikeJobDescription(text: string): boolean {
  const lower = text.toLowerCase();
  const jobIndicators = [
    /\b(responsibilities|qualifications|requirements)\b/,
    /\b(experience|skills|education)\b/,
    /\b(salary|compensation|benefits)\b/,
    /\b(full[\s-]?time|part[\s-]?time|contract|remote)\b/,
    /\b(apply|application|candidate)\b/,
    /\b(role|position|job|opportunity)\b/,
  ];
  const matchCount = jobIndicators.filter((p) => p.test(lower)).length;
  return matchCount >= 2;
}

export async function scrapeJobListing(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove non-content elements
  $(
    "script, style, nav, header, footer, iframe, noscript, aside, .sidebar, .nav, .menu, .cookie-banner, form"
  ).remove();

  // Try common job description selectors first
  const selectors = [
    '[class*="job-description"]',
    '[class*="jobDescription"]',
    '[class*="job_description"]',
    '[id*="job-description"]',
    '[id*="jobDescription"]',
    '[class*="posting-description"]',
    '[class*="description"]',
    "article",
    "main",
    '[role="main"]',
  ];

  for (const selector of selectors) {
    const el = $(selector);
    if (el.length) {
      const text = el.text().replace(/\s+/g, " ").trim();
      if (text.length >= MIN_CONTENT_LENGTH && !looksLikeAuthPage(text)) {
        return text;
      }
    }
  }

  // Fallback: get body text
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();

  if (bodyText.length < MIN_CONTENT_LENGTH) {
    throw new Error(
      "Could not extract meaningful content from the URL. The page may require login. Please paste the job description manually."
    );
  }

  if (looksLikeAuthPage(bodyText)) {
    throw new Error(
      "The URL appears to be a login or authentication page. Please paste the job description manually."
    );
  }

  if (!looksLikeJobDescription(bodyText)) {
    throw new Error(
      "The URL does not appear to contain a job description. The page may require login or use JavaScript to load content. Please paste the job description manually."
    );
  }

  return bodyText;
}
