# AI Recruitment Workspace

A recruiter dashboard that compares a candidate's CV against a job description and returns a full screening report in seconds.

Paste a CV and a JD, hit **Run analysis**, and it generates:

- Match score (0–100) with a stamped verdict
- Skills and qualifications the candidate clearly meets
- Missing or weak requirements, tagged by severity
- A short experience summary relevant to the role
- Recruiter notes on potential concerns
- Five suggested interview questions, each labeled with what it probes
- A final recommendation: **ADVANCE**, **SCREEN FURTHER**, or **PASS**

## How it's built

Single React component (`recruiter-ai-workspace.jsx`), no external UI libraries. The analysis is powered by Claude (Anthropic's `claude-sonnet-4-6` model), which returns structured JSON that the dashboard renders into the report.

Built as a [Claude](https://claude.ai) artifact.

## Important: running this outside Claude

This component was built to run inside Claude.ai, where API authentication is handled automatically. **If you run this code standalone, the "Run analysis" button will not work** — the API call has no key attached.

To turn it into a standalone app you would need to:

1. Get your own [Anthropic API key](https://console.anthropic.com)
2. Set up a small backend (or serverless function) that holds the key and proxies requests to `https://api.anthropic.com/v1/messages`
3. Point the component's fetch call at your backend instead of the Anthropic API directly

Never put an API key directly in frontend code — anyone viewing the page source could steal it.

## Demo

Use the **Load sample** button to try it instantly with a sample candidate and job description.
