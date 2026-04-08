import fs from "fs";
import path from "path";
import readline from "readline";

const CATEGORIES = [
  "prompt-engineering",
  "rag",
  "agents",
  "fine-tuning",
  "evaluation",
  "infrastructure",
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  console.log("\n📝 새 위키 엔트리 생성\n");

  // Category
  console.log("카테고리:");
  CATEGORIES.forEach((c, i) => console.log(`  ${i + 1}. ${c}`));
  const catIndex = parseInt(await ask("\n번호 선택: ")) - 1;
  const category = CATEGORIES[catIndex];
  if (!category) {
    console.error("❌ 잘못된 카테고리");
    process.exit(1);
  }

  // Title
  const title = await ask("제목: ");
  if (!title.trim()) {
    console.error("❌ 제목을 입력하세요");
    process.exit(1);
  }

  // Description
  const description = await ask("한줄 설명: ");

  // Type
  const typeAnswer = await ask("타입 (entry/til) [entry]: ");
  const type = typeAnswer.trim() === "til" ? "til" : "entry";

  // Slug
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  const today = new Date().toISOString().split("T")[0];

  const contentDir = type === "til"
    ? path.join(process.cwd(), "content", "til")
    : path.join(process.cwd(), "content", category);

  fs.mkdirSync(contentDir, { recursive: true });

  const filePath = path.join(contentDir, `${slug}.mdx`);

  if (fs.existsSync(filePath)) {
    console.error(`❌ 파일이 이미 존재합니다: ${filePath}`);
    process.exit(1);
  }

  const frontmatter = [
    "---",
    `title: "${title}"`,
    `category: ${category}`,
    `date: "${today}"`,
    `tags: []`,
    `confidence: 1`,
    `connections: []`,
    `status: draft`,
    `description: "${description || title}"`,
    `type: ${type}`,
    "---",
  ].join("\n");

  const template =
    type === "til"
      ? `${frontmatter}\n\n## TIL\n\n오늘 배운 것을 여기에 적으세요.\n`
      : `${frontmatter}\n\n## 핵심 개념\n\n여기에 핵심 개념을 정리하세요.\n\n## 왜 중요한가\n\n이 개념이 왜 중요한지 설명하세요.\n\n## 실전 적용\n\n실제로 어떻게 사용하는지 예시를 들어보세요.\n\n## 한계 / 주의점\n\n알려진 한계나 주의할 점을 기록하세요.\n`;

  fs.writeFileSync(filePath, template);
  console.log(`\n✅ 생성됨: ${path.relative(process.cwd(), filePath)}`);
  console.log(`   편집: code ${path.relative(process.cwd(), filePath)}\n`);

  rl.close();
}

main().catch(console.error);
