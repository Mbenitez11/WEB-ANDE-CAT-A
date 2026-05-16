import { z } from "zod";

export const quizMode = z.enum(["practica", "tema", "simulacro", "repaso"]);
export const difficulty = z.enum(["basica", "media", "dificil", "examen"]);

export const startQuizSchema = z.object({
  mode: quizMode,
  topicSlug: z.string().optional(),
  difficulty: difficulty.optional(),
  questionCount: z.number().int().min(1).max(100).default(10),
  includeUnverified: z.boolean().default(false),
});

export const answerQuizSchema = z.object({
  attemptId: z.string().min(1),
  questionId: z.string().min(1),
  selectedOptionId: z.string().nullable().optional(),
  timeSpentSeconds: z.number().int().min(0).max(36_000).default(0),
});

export const finishQuizSchema = z.object({
  attemptId: z.string().min(1),
  durationSeconds: z.number().int().min(0).max(36_000).default(0),
});

export const saveQuestionSchema = z.object({
  questionId: z.string().min(1),
  note: z.string().max(500).optional(),
});

export type StartQuizInput = z.infer<typeof startQuizSchema>;
export type AnswerQuizInput = z.infer<typeof answerQuizSchema>;
