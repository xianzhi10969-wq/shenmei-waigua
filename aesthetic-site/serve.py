#!/usr/bin/env python3
"""Serve the complete static website on a local port."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8840)
    parser.add_argument('--host', default='127.0.0.1')
    args = parser.parse_args()
    public = Path(__file__).resolve().parent / 'public'
    handler = partial(SimpleHTTPRequestHandler, directory=str(public))
    print(f'Website is ready at http://{args.host}:{args.port}/', flush=True)
    ThreadingHTTPServer((args.host, args.port), handler).serve_forever()


if __name__ == '__main__':
    main()
