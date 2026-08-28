// src/engine/agentTools.ts
// Tool definitions and JSON parsing for Pangly's on-device Agent Brain (Salesforce xLAM-2).
//
// NOTE: All descriptions and schemas use clear definitions for the agent,
// but user-facing feedback generated for the user always adheres to Pangly's
// non-technical language policy.

export interface AgentToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
    }>;
    required: string[];
  };
}

export const AGENT_TOOLS: AgentToolDefinition[] = [
  {
    name: 'create_reminder',
    description: 'Schedule a private reminder or alert for the user (e.g. bill due dates, document renewals, vehicle service, or general tasks).',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'The title/summary of what the user needs to be reminded of (e.g. "Pay Electric Bill ($145.20)").',
        },
        dueDate: {
          type: 'string',
          description: 'The due date for the reminder in YYYY-MM-DD format.',
        },
        dueTime: {
          type: 'string',
          description: 'Optional due time in HH:mm 24-hour format (defaults to "09:00").',
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Priority level of the reminder.',
        },
      },
      required: ['title', 'dueDate'],
    },
  },
  {
    name: 'save_document',
    description: 'Save or log a new document, ID card, bill, or receipt into the private vault.',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Document title (e.g. "Passport", "Driver License", "Electric Bill", "Car Insurance").',
        },
        category: {
          type: 'string',
          enum: ['Government ID', 'Insurance', 'Medical', 'Financial', 'Vehicle', 'Personal', 'Other'],
          description: 'The category the document belongs to.',
        },
        documentNumber: {
          type: 'string',
          description: 'The ID number, account number, or reference number if present.',
        },
        issueDate: {
          type: 'string',
          description: 'Issue date in YYYY-MM-DD format if applicable.',
        },
        expiryDate: {
          type: 'string',
          description: 'Expiry or due date in YYYY-MM-DD format if applicable.',
        },
        provider: {
          type: 'string',
          description: 'Issuer or provider name (e.g. "Meralco", "PhilHealth", "BDO", "LTO").',
        },
      },
      required: ['title', 'category'],
    },
  },
  {
    name: 'save_note',
    description: 'Save a quick private note, memo, or checklist into the vault.',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Note title.',
        },
        content: {
          type: 'string',
          description: 'The text content of the note.',
        },
        category: {
          type: 'string',
          description: 'Optional category/folder for organizing the note.',
        },
      },
      required: ['title', 'content'],
    },
  },
  {
    name: 'save_vehicle_maintenance',
    description: 'Log an auto maintenance service, repair, or expense for a vehicle.',
    parameters: {
      type: 'object',
      properties: {
        serviceType: {
          type: 'string',
          description: 'Type of service done (e.g. "Oil Change", "Brake Pad Replacement", "Tire Rotation", "Battery Change").',
        },
        cost: {
          type: 'number',
          description: 'The cost amount in currency.',
        },
        mileage: {
          type: 'number',
          description: 'Current vehicle odometer reading in kilometers or miles if mentioned.',
        },
        performedAt: {
          type: 'string',
          description: 'Date of maintenance in YYYY-MM-DD format.',
        },
        notes: {
          type: 'string',
          description: 'Additional service details, shop name, or part brands.',
        },
      },
      required: ['serviceType', 'performedAt'],
    },
  },
  {
    name: 'update_personal_profile',
    description: 'Update the user profile contact information (phone, email, blood type, emergency contact).',
    parameters: {
      type: 'object',
      properties: {
        phone: { type: 'string', description: 'Phone number' },
        email: { type: 'string', description: 'Email address' },
        bloodType: { type: 'string', description: 'Blood type' },
        emergencyContactName: { type: 'string', description: 'Name of emergency contact' },
        emergencyContactPhone: { type: 'string', description: 'Phone of emergency contact' },
        emergencyContactRelation: { type: 'string', description: 'Relationship (e.g. Spouse, Parent)' },
      },
      required: [],
    },
  },
];

export interface ParsedToolCall {
  name: string;
  arguments: Record<string, any>;
}

/**
 * Parses xLAM function calling output.
 * Handles both JSON object structures (`[{"name": "...", "arguments": {...}}]` or `{"name": "...", "arguments": {...}}`)
 * and XML/tag encapsulated tool invocations.
 */
export function parseAgentToolCalls(rawOutput: string): {
  toolCalls: ParsedToolCall[];
  conversationalText: string;
} {
  const toolCalls: ParsedToolCall[] = [];
  let conversationalText = rawOutput.trim();

  try {
    const jsonMatch = rawOutput.match(/\[\s*\{\s*"name"\s*:\s*".*?"\s*,\s*"arguments"\s*:\s*\{.*?\}\s*\}\s*\]/s)
      || rawOutput.match(/\{\s*"name"\s*:\s*".*?"\s*,\s*"arguments"\s*:\s*\{.*?\}\s*\}/s);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const list = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of list) {
        if (item.name && typeof item.arguments === 'object') {
          toolCalls.push({
            name: item.name,
            arguments: item.arguments,
          });
        }
      }
      conversationalText = conversationalText.replace(jsonMatch[0], '').trim();
    }
  } catch (e) {
    // Non-fatal parse fallback
  }

  const tagMatches = rawOutput.matchAll(/<(?:tool_call|call)>(.*?)<\/(?:tool_call|call)>/gs);
  for (const match of tagMatches) {
    try {
      const parsed = JSON.parse(match[1].trim());
      if (parsed.name && typeof parsed.arguments === 'object') {
        toolCalls.push({
          name: parsed.name,
          arguments: parsed.arguments,
        });
        conversationalText = conversationalText.replace(match[0], '').trim();
      }
    } catch {
      // Ignore malformed tag blocks
    }
  }

  return { toolCalls, conversationalText };
}
