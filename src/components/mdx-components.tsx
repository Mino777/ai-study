"use client";

import { CodeBlock } from "./code-block";

function CustomPre({ children, ...props }: React.ComponentProps<"pre">) {
  return <CodeBlock {...props}>{children}</CodeBlock>;
}

export const mdxComponents = {
  pre: CustomPre,
};
