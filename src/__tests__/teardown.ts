/**
 * Jest global teardown to handle cleanup
 */

export default async function teardown() {
  // Clear all timers
  if (global.gc) {
    global.gc();
  }
  
  // Force exit to prevent hanging
  await new Promise(resolve => setTimeout(resolve, 50));
}