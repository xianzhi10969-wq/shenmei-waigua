#!/usr/bin/env python3
"""Serve the complete static website on a local port."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class PreviewHandler(SimpleHTTPRequestHandler):
    """A local review must reflect the current files, including nested modules."""
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8840)
    parser.add_argument('--host', default='127.0.0.1')
    args = parser.parse_args()
    public = Path(__file__).resolve().parent / 'public'
    handler = partial(PreviewHandler, directory=str(public))
    print(f'Website is ready at http://{args.host}:{args.port}/', flush=True)
    ThreadingHTTPServer((args.host, args.port), handler).serve_forever()


if __name__ == '__main__':
    main()
