import { QuizData, SocialProfile, BoundaryScripts } from "../types";

export async function generateSocialProfile(quizData: QuizData): Promise<SocialProfile> {
  const response = await fetch("/api/generate-profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quizData }),
  });
  if (!response.ok) throw new Error("Failed to generate profile");
  return response.json();
}

export async function generateBoundaryScripts(situation: string, email?: string): Promise<BoundaryScripts> {
  const response = await fetch("/api/generate-boundaries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ situation, email }),
  });
  if (!response.ok) throw new Error("Failed to generate boundaries");
  return response.json();
}

export async function generateBlogPost(): Promise<string> {
  const response = await fetch("/api/blog-post");
  if (!response.ok) throw new Error("Failed to generate blog post");
  const data = await response.json();
  return data.text;
}
