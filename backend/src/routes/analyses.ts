import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { eq } from "drizzle-orm";
import { gateway } from "@specific-dev/framework";
import { generateText, generateObject } from "ai";
import { z } from "zod";
import * as schema from "../db/schema.js";
import type { App } from "../index.js";

// Zod schemas for structured output
const HiddenRiskSchema = z.object({
  title: z.string(),
  description: z.string(),
  severity: z.enum(["low", "medium", "high"]),
});

const MoneyTrapSchema = z.object({
  title: z.string(),
  description: z.string(),
  amount: z.string().optional(),
});

const AutoRenewTrapSchema = z.object({
  title: z.string(),
  description: z.string(),
  cancellationDifficulty: z.string(),
});

const DangerousClauseSchema = z.object({
  title: z.string(),
  description: z.string(),
  legalImpact: z.string(),
});

const AnalysisResultSchema = z.object({
  hiddenRisks: z.array(HiddenRiskSchema),
  moneyTraps: z.array(MoneyTrapSchema),
  autoRenewTraps: z.array(AutoRenewTrapSchema),
  dangerousClauses: z.array(DangerousClauseSchema),
});

type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

// Helper function to determine MIME type from filename
function getMimeType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    default:
      return 'image/jpeg'; // Default to JPEG
  }
}

export function register(app: App, fastify: FastifyInstance) {
  // POST /api/analyze-contract - Analyze contract from image
  fastify.post(
    "/api/analyze-contract",
    {
      schema: {
        description: "Analyze contract from screenshot",
        tags: ["analyses"],
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              imageUrl: { type: "string" },
              extractedText: { type: "string" },
              hiddenRisks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    severity: { type: "string", enum: ["low", "medium", "high"] },
                  },
                },
              },
              moneyTraps: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    amount: { type: "string" },
                  },
                },
              },
              autoRenewTraps: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    cancellationDifficulty: { type: "string" },
                  },
                },
              },
              dangerousClauses: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    legalImpact: { type: "string" },
                  },
                },
              },
              createdAt: { type: "string" },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      app.logger.info({ path: "/api/analyze-contract" }, "Analyzing contract");

      try {
        // Get the uploaded image file
        const data = await request.file({ limits: { fileSize: 25 * 1024 * 1024 } }); // 25MB limit
        if (!data) {
          app.logger.warn("No file provided in analyze-contract request");
          return reply.status(400).send({ error: "No image file provided" });
        }

        let buffer: Buffer;
        try {
          buffer = await data.toBuffer();
        } catch (err) {
          app.logger.error({ err }, "File too large");
          return reply.status(413).send({ error: "File size limit exceeded" });
        }

        // Determine MIME type from filename
        const mimeType = getMimeType(data.filename);
        app.logger.info({ mimeType, filename: data.filename }, "MIME type determined");

        // Step 1: Extract text from image using Gemini vision with file buffer
        app.logger.info({ filename: data.filename, mimeType }, "Extracting text from contract image");
        const extractionResult = await generateText({
          model: gateway("google/gemini-3-flash"),
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "file",
                  mediaType: mimeType,
                  data: buffer,
                },
                {
                  type: "text",
                  text: "Extract all text from this contract/agreement image. Return the full text as accurately as possible.",
                },
              ],
            },
          ],
        });

        // Upload image to storage after extraction
        const key = `contract-analyses/${Date.now()}-${data.filename}`;
        const uploadedKey = await app.storage.upload(key, buffer);
        const { url: imageUrl } = await app.storage.getSignedUrl(uploadedKey);

        app.logger.info({ imageKey: uploadedKey, imageUrl }, "Image uploaded successfully");

        const extractedText = extractionResult.text;
        app.logger.info({ textLength: extractedText.length }, "Text extracted");

        // Step 2: Analyze extracted text for contract risks
        app.logger.info("Analyzing contract for risks");
        const analysisResult = await generateObject({
          model: gateway("google/gemini-3-flash"),
          schema: AnalysisResultSchema,
          schemaName: "ContractAnalysis",
          schemaDescription: "Analysis of contract risks and dangerous clauses",
          prompt: `Analyze this contract text for consumer protection issues. Identify and categorize problems into the following categories:

CONTRACT TEXT:
${extractedText}

Please identify:
1. Hidden Risks: Unexpected terms, liability limitations, or fine print issues. Rate severity as low, medium, or high.
2. Money Traps: Hidden fees, charges, or pricing terms. Include estimated amounts if possible.
3. Auto-Renew Traps: Automatic renewal clauses, subscription traps, or difficult cancellation processes.
4. Dangerous Clauses: Unfair liability waivers, mandatory arbitration, non-compete clauses, or other predatory legal terms.

Focus on identifying predatory terms that harm consumers, automatic renewals, unfair liability limitations, and hidden fees.`,
        });

        app.logger.info(
          {
            hiddenRisksCount: analysisResult.object.hiddenRisks.length,
            moneyTrapsCount: analysisResult.object.moneyTraps.length,
            autoRenewTrapsCount: analysisResult.object.autoRenewTraps.length,
            dangerousClausesCount: analysisResult.object.dangerousClauses.length,
          },
          "Contract analysis complete"
        );

        // Save analysis to database
        const result = await app.db
          .insert(schema.analyses)
          .values({
            imageUrl,
            extractedText,
            hiddenRisks: analysisResult.object.hiddenRisks,
            moneyTraps: analysisResult.object.moneyTraps,
            autoRenewTraps: analysisResult.object.autoRenewTraps,
            dangerousClauses: analysisResult.object.dangerousClauses,
          })
          .returning();

        const analysis = result[0];
        app.logger.info({ analysisId: analysis.id }, "Analysis saved to database");

        return {
          id: analysis.id,
          imageUrl: analysis.imageUrl,
          extractedText: analysis.extractedText,
          hiddenRisks: analysis.hiddenRisks,
          moneyTraps: analysis.moneyTraps,
          autoRenewTraps: analysis.autoRenewTraps,
          dangerousClauses: analysis.dangerousClauses,
          createdAt: analysis.createdAt.toISOString(),
        };
      } catch (error) {
        app.logger.error({ err: error }, "Failed to analyze contract");
        return reply.status(500).send({ error: "Failed to analyze contract" });
      }
    }
  );

  // GET /api/analyses/:id - Get a specific analysis by ID
  fastify.get(
    "/api/analyses/:id",
    {
      schema: {
        description: "Get a specific contract analysis by ID",
        tags: ["analyses"],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
          },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              imageUrl: { type: "string" },
              extractedText: { type: "string" },
              hiddenRisks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    severity: { type: "string", enum: ["low", "medium", "high"] },
                  },
                },
              },
              moneyTraps: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    amount: { type: "string" },
                  },
                },
              },
              autoRenewTraps: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    cancellationDifficulty: { type: "string" },
                  },
                },
              },
              dangerousClauses: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    legalImpact: { type: "string" },
                  },
                },
              },
              createdAt: { type: "string" },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      app.logger.info({ analysisId: id }, "Fetching analysis");

      try {
        const analysis = await app.db.query.analyses.findFirst({
          where: eq(schema.analyses.id, id),
        });

        if (!analysis) {
          app.logger.warn({ analysisId: id }, "Analysis not found");
          return reply.status(404).send({ error: "Analysis not found" });
        }

        app.logger.info({ analysisId: id }, "Analysis retrieved successfully");

        return {
          id: analysis.id,
          imageUrl: analysis.imageUrl,
          extractedText: analysis.extractedText,
          hiddenRisks: analysis.hiddenRisks,
          moneyTraps: analysis.moneyTraps,
          autoRenewTraps: analysis.autoRenewTraps,
          dangerousClauses: analysis.dangerousClauses,
          createdAt: analysis.createdAt.toISOString(),
        };
      } catch (error) {
        app.logger.error({ err: error, analysisId: id }, "Failed to fetch analysis");
        return reply.status(500).send({ error: "Failed to fetch analysis" });
      }
    }
  );
}
