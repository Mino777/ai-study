// 말하기 채점 — 음성 인식 결과가 목표 문장을 얼마나 담고 있는지 (순수 함수)

const CONTRACTIONS: Record<string, string> = {
  "i'm": "i am",
  "you're": "you are",
  "we're": "we are",
  "they're": "they are",
  "it's": "it is",
  "that's": "that is",
  "don't": "do not",
  "doesn't": "does not",
  "didn't": "did not",
  "can't": "cannot",
  "won't": "will not",
  "isn't": "is not",
  "i've": "i have",
  "i'll": "i will",
  "i'd": "i would",
};

export function normalizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .split(/\s+/)
    .flatMap((w) => {
      const bare = w.replace(/[^a-z0-9']/g, "");
      return (CONTRACTIONS[bare] ?? bare).split(" ");
    })
    .map((w) => w.replace(/'/g, ""))
    .filter(Boolean);
}

/** 목표 단어 중 순서대로 들린 비율 (0~1). 앞뒤에 다른 말을 붙여도 감점 없음 */
export function speechMatchScore(target: string, heard: string): number {
  const t = normalizeWords(target);
  const h = normalizeWords(heard);
  if (!t.length) return 0;
  // 최장 공통 부분수열 — 순서를 지킨 일치만 인정
  const dp = Array.from({ length: t.length + 1 }, () => new Array<number>(h.length + 1).fill(0));
  for (let i = 1; i <= t.length; i++) {
    for (let j = 1; j <= h.length; j++) {
      dp[i][j] = t[i - 1] === h[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[t.length][h.length] / t.length;
}

export const PASS_SCORE = 0.8;
