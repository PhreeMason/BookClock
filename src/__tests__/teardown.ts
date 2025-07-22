/**
 * Jest global teardown to handle cleanup
 */

export default async function teardown() {
  // Force garbage collection
  if (global.gc) {
    global.gc();
  }
  
  // Clear any remaining Node.js handles
  const activeHandles = (process as any)._getActiveHandles?.() || [];
  const activeRequests = (process as any)._getActiveRequests?.() || [];
  
  // Unref all active handles to prevent them from keeping the process alive
  activeHandles.forEach((handle: any) => {
    if (handle && typeof handle.unref === 'function') {
      handle.unref();
    }
  });
  
  // Abort all active requests
  activeRequests.forEach((request: any) => {
    if (request && typeof request.abort === 'function') {
      request.abort();
    }
  });
  
  // Final cleanup without setTimeout - just flush promise chains
  await Promise.resolve();
  await Promise.resolve(); // Double flush for nested promises
}