import type { WebMcpToolDefinition, WebMcpRegisteredTool, ModelContext } from '../types/webmcp';

// Fallback registry for dev/testing/simulation environments without the Chrome flag
const inMemoryTools = new Map<string, WebMcpToolDefinition>();

/**
 * Checks if the browser natively supports the WebMCP standard.
 */
export function isWebMcpSupported(): boolean {
  return typeof document !== 'undefined' && 'modelContext' in document && !!document.modelContext;
}

/**
 * Initialize simulated/fallback ModelContext if native one is absent.
 * This guarantees Playwright tests and demo simulations can discover and execute tools reliably.
 */
export function ensureModelContextShim(): ModelContext {
  if (typeof document === 'undefined') {
    throw new Error('WebMCP requires a browser document environment');
  }

  if (document.modelContext) {
    return document.modelContext;
  }

  const eventTarget = new EventTarget();

  const shim: ModelContext = {
    addEventListener: eventTarget.addEventListener.bind(eventTarget),
    removeEventListener: eventTarget.removeEventListener.bind(eventTarget),
    dispatchEvent: eventTarget.dispatchEvent.bind(eventTarget),

    async registerTool(tool: WebMcpToolDefinition, options?: { signal?: AbortSignal }): Promise<void> {
      inMemoryTools.set(tool.name, tool);

      if (options?.signal) {
        options.signal.addEventListener('abort', () => {
          inMemoryTools.delete(tool.name);
        });
      }
    },

    async getTools(): Promise<WebMcpRegisteredTool[]> {
      return Array.from(inMemoryTools.values()).map(({ execute, ...meta }) => ({
        ...meta,
        origin: typeof window !== 'undefined' ? window.location.origin : '',
      }));
    },

    async executeTool(toolInput: string | WebMcpRegisteredTool, input: Record<string, any> = {}): Promise<any> {
      const toolName = typeof toolInput === 'string' ? toolInput : toolInput.name;
      const registered = inMemoryTools.get(toolName);

      if (!registered) {
        throw new Error(`WebMCP Tool not found: ${toolName}`);
      }

      // Dispatch 'toolactivated' event for UI visual feedback
      const activatedEvent = new CustomEvent('toolactivated', { detail: { toolName } });
      document.dispatchEvent(activatedEvent);
      shim.dispatchEvent(activatedEvent);

      try {
        const result = await registered.execute(input);
        return typeof result === 'string' ? result : JSON.stringify(result);
      } catch (err) {
        const cancelEvent = new CustomEvent('toolcancel', { detail: { toolName } });
        document.dispatchEvent(cancelEvent);
        shim.dispatchEvent(cancelEvent);
        throw err;
      }
    },
  };

  // Attach shim to document for demo / test resilience
  document.modelContext = shim;
  return shim;
}

/**
 * Register a tool with WebMCP (using native API or fallback shim).
 */
export async function registerWebMcpTool(
  tool: WebMcpToolDefinition,
  options?: { signal?: AbortSignal }
): Promise<void> {
  const context = isWebMcpSupported() ? document.modelContext! : ensureModelContextShim();
  await context.registerTool(tool, options);
}
