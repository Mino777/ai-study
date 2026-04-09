const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const GITHUB_REPO = process.env.GITHUB_REPO || "Mino777/ai-study";

const API_BASE = `https://api.github.com/repos/${GITHUB_REPO}/contents`;

function headers() {
  return {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
  };
}

export async function getFileFromGitHub(
  path: string
): Promise<{ content: string; sha: string }> {
  const res = await fetch(`${API_BASE}/${path}`, { headers: headers() });
  if (!res.ok) {
    if (res.status === 404) throw new Error("File not found");
    throw new Error(`GitHub API error: ${res.status}`);
  }
  const data = await res.json();
  const content = Buffer.from(data.content, "base64").toString("utf-8");
  return { content, sha: data.sha };
}

export async function createFile(
  path: string,
  content: string,
  message: string
): Promise<{ sha: string }> {
  const res = await fetch(`${API_BASE}/${path}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({
      message,
      content: Buffer.from(content).toString("base64"),
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`GitHub create failed: ${err.message}`);
  }
  const data = await res.json();
  return { sha: data.content.sha };
}

export async function updateFile(
  path: string,
  content: string,
  sha: string,
  message: string
): Promise<{ sha: string }> {
  const res = await fetch(`${API_BASE}/${path}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({
      message,
      content: Buffer.from(content).toString("base64"),
      sha,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`GitHub update failed: ${err.message}`);
  }
  const data = await res.json();
  return { sha: data.content.sha };
}

export async function deleteFile(
  path: string,
  sha: string,
  message: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/${path}`, {
    method: "DELETE",
    headers: headers(),
    body: JSON.stringify({ message, sha }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`GitHub delete failed: ${err.message}`);
  }
}
