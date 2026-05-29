import { Router } from "express";
import { db, jobsTable } from "@workspace/db";
import { eq, desc, count, and } from "drizzle-orm";
import {
  CreateJobBody,
  UpdateJobProgressBody,
  GetJobParams,
  DeleteJobParams,
  UpdateJobProgressParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/jobs", async (req, res) => {
  const jobs = await db
    .select()
    .from(jobsTable)
    .orderBy(desc(jobsTable.createdAt));
  res.json(jobs.map(formatJob));
});

router.get("/jobs/stats", async (req, res) => {
  const rows = await db
    .select({ status: jobsTable.status, cnt: count() })
    .from(jobsTable)
    .groupBy(jobsTable.status);

  const stats = { total: 0, completed: 0, processing: 0, failed: 0, pending: 0 };
  for (const row of rows) {
    const n = Number(row.cnt);
    stats.total += n;
    if (row.status === "completed") stats.completed += n;
    else if (row.status === "processing") stats.processing += n;
    else if (row.status === "failed") stats.failed += n;
    else if (row.status === "pending") stats.pending += n;
  }
  res.json(stats);
});

router.get("/jobs/:id", async (req, res) => {
  const parsed = GetJobParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const [job] = await db
    .select()
    .from(jobsTable)
    .where(eq(jobsTable.id, parsed.data.id));

  if (!job) { res.status(404).json({ error: "Job not found" }); return; }
  res.json(formatJob(job));
});

router.post("/jobs", async (req, res) => {
  const parsed = CreateJobBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [job] = await db
    .insert(jobsTable)
    .values({
      movieTitle: parsed.data.movieTitle,
      language: parsed.data.language,
      videoFilename: parsed.data.videoFilename ?? null,
      status: "pending",
      progress: 0,
      stage: "Waiting to start",
    })
    .returning();

  res.status(201).json(formatJob(job));
});

router.delete("/jobs/:id", async (req, res) => {
  const parsed = DeleteJobParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  await db.delete(jobsTable).where(eq(jobsTable.id, parsed.data.id));
  res.status(204).send();
});

router.patch("/jobs/:id/progress", async (req, res) => {
  const paramParsed = UpdateJobProgressParams.safeParse({ id: Number(req.params.id) });
  if (!paramParsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const bodyParsed = UpdateJobProgressBody.safeParse(req.body);
  if (!bodyParsed.success) { res.status(400).json({ error: "Invalid body" }); return; }

  const updates: Record<string, unknown> = {};
  const b = bodyParsed.data;
  if (b.status !== undefined) updates.status = b.status;
  if (b.progress !== undefined) updates.progress = b.progress;
  if (b.stage !== undefined) updates.stage = b.stage;
  if (b.outputUrl !== undefined) updates.outputUrl = b.outputUrl;
  if (b.thumbnailUrl !== undefined) updates.thumbnailUrl = b.thumbnailUrl;
  if (b.durationSeconds !== undefined) updates.durationSeconds = b.durationSeconds;
  if (b.recommendedDuration !== undefined) updates.recommendedDuration = b.recommendedDuration;
  if (b.error !== undefined) updates.error = b.error;
  if (b.status === "completed" || b.status === "failed") {
    updates.completedAt = new Date();
  }

  const [job] = await db
    .update(jobsTable)
    .set(updates)
    .where(eq(jobsTable.id, paramParsed.data.id))
    .returning();

  if (!job) { res.status(404).json({ error: "Job not found" }); return; }
  res.json(formatJob(job));
});

function formatJob(job: typeof jobsTable.$inferSelect) {
  return {
    id: job.id,
    movieTitle: job.movieTitle,
    language: job.language,
    status: job.status,
    progress: job.progress,
    stage: job.stage,
    outputUrl: job.outputUrl ?? null,
    thumbnailUrl: job.thumbnailUrl ?? null,
    durationSeconds: job.durationSeconds ?? null,
    recommendedDuration: job.recommendedDuration ?? null,
    error: job.error ?? null,
    createdAt: job.createdAt.toISOString(),
    completedAt: job.completedAt?.toISOString() ?? null,
  };
}

export default router;
