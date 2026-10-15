import { useEffect, useRef } from 'react';
import type { WebMcpToolDefinition } from '../types/webmcp';
import { registerWebMcpTool } from '../utils/webmcp';

/**
 * React hook to register a WebMCP tool and bind its lifecycle to the component.
 * Automatically handles unregistration on unmount using an AbortController.
 */
export function useWebMcpTool(tool: WebMcpToolDefinition, deps: any[] = []): void {
  const toolRef = useRef(tool);
  toolRef.current = tool;

  useEffect(() => {
    const controller = new AbortController();

    const activeTool: WebMcpToolDefinition = {
      ...toolRef.current,
      execute: (input, context) => {
        return toolRef.current.execute(input, context);
      },
    };

    registerWebMcpTool(activeTool, { signal: controller.signal }).catch((err) => {
      console.warn(`[WebMCP] Failed to register tool "${activeTool.name}":`, err);
    });

    return () => {
      // Chrome 153+ unregisters the tool via AbortSignal without interrupting in-flight executions
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
