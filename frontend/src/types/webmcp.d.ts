/**
 * WebMCP (Web Model Context Protocol) Type Definitions
 * Specification: https://developer.chrome.com/docs/ai/webmcp
 */

import React from 'react';

export interface WebMcpToolAnnotations {
  /**
   * Indicates that the tool only reads information and does not modify application state.
   */
  readOnlyHint?: boolean;
  /**
   * Indicates that executing the tool results in significant, real-world, or irreversible actions (e.g. purchasing, deleting).
   * Signals agents to request user confirmation.
   */
  consequentialHint?: boolean;
  /**
   * Indicates that tool output contains untrusted data requiring heightened security handling/sanitization.
   */
  untrustedContentHint?: boolean;
  /**
   * Indicates that the tool is intended specifically for inspection/developer tooling rather than end users.
   */
  debugging?: boolean;
}

export interface WebMcpToolDefinition<T = any, R = any> {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties?: Record<string, any>;
    required?: string[];
    [key: string]: any;
  };
  annotations?: WebMcpToolAnnotations;
  execute: (input: T, context?: { signal?: AbortSignal }) => Promise<R> | R;
}

export interface WebMcpRegisteredTool extends Omit<WebMcpToolDefinition, 'execute'> {
  origin?: string;
  title?: string;
  window?: Window;
}

export interface WebMcpEventDetail {
  toolName: string;
}

export interface ModelContext {
  registerTool(tool: WebMcpToolDefinition, options?: { signal?: AbortSignal }): Promise<void>;
  getTools(options?: { fromOrigins?: string[] }): Promise<WebMcpRegisteredTool[]>;
  executeTool(tool: string | WebMcpRegisteredTool, input?: Record<string, any>): Promise<any>;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
  dispatchEvent(event: Event): boolean;
}

declare global {
  interface Document {
    modelContext?: ModelContext;
  }

  interface Navigator {
    modelContext?: ModelContext;
  }

  interface SubmitEvent {
    /**
     * True if the form submission was triggered by an AI agent through WebMCP.
     */
    readonly agentInvoked?: boolean;
    /**
     * Resolves the agent's tool execution with a specific Promise output.
     */
    respondWith?: (promise: Promise<any>) => void;
  }

  namespace React {
    interface FormHTMLAttributes<T> extends HTMLAttributes<T> {
      toolname?: string;
      tooldescription?: string;
      toolautosubmit?: boolean | string;
    }
    interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
      toolparamdescription?: string;
    }
    interface SelectHTMLAttributes<T> extends HTMLAttributes<T> {
      toolparamdescription?: string;
    }
  }
}
