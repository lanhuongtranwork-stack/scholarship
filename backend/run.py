"""
Startup script for Python 3.14 on Windows.
Patches asyncio.run to use SelectorEventLoop (required by psycopg async).
"""
import asyncio
import selectors
import sys

if sys.platform == "win32":
    _orig_run = asyncio.run

    def _run_with_selector(coro, *, debug=None, loop_factory=None):
        if loop_factory is None:
            loop_factory = lambda: asyncio.SelectorEventLoop(selectors.SelectSelector())
        return _orig_run(coro, debug=debug, loop_factory=loop_factory)

    asyncio.run = _run_with_selector

import os
import uvicorn

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    is_dev = os.getenv("ENVIRONMENT", "development") == "development"
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=is_dev)
