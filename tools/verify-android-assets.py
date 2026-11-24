#!/usr/bin/env python3
"""Verify the packaged offline runtime against current source, not build timestamps."""
import argparse
import base64
import json
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parents[1]
ROOT_FILES = {'index.html', 'puzzle-lab.html', 'privacy.html', 'account-deletion.html', 'backend-config.json'}
ASSET_TYPES = {'.svg', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.mp3', '.wav', '.ogg', '.woff', '.woff2', '.ttf'}

def runtime_paths(root=ROOT):
    paths = {name for name in ROOT_FILES if (root / name).is_file()}
    for folder in ('src', 'styles', 'assets', 'vendor'):
        for file in (root / folder).rglob('*'):
            if not file.is_file():
                continue
            relative = file.relative_to(root).as_posix()
            if relative.startswith(('assets/screenshots/', 'assets/preview/', 'src/runtime-')) or '/fixtures/' in relative or '.test.' in file.name:
                continue
            if (folder == 'src' and file.suffix == '.js' or folder == 'styles' and file.suffix == '.css'
                    or folder == 'assets' and file.suffix in ASSET_TYPES or folder == 'vendor' and (file.suffix == '.js' or relative == 'vendor/LICENSE')):
                paths.add(relative)
    return paths

def verify(artifact, root=ROOT):
    config_file = root / 'backend-config.json'
    if config_file.exists():
        config = json.loads(config_file.read_text())
        key = config.get('publishableKey', '')
        if key and not key.startswith('sb_publishable_'):
            try:
                part = key.split('.')[1]
                payload = json.loads(base64.urlsafe_b64decode(part + '=' * (-len(part) % 4)))
                if payload.get('role') != 'anon':
                    raise ValueError('Not a public anonymous key')
            except Exception:
                raise ValueError('Backend configuration must contain only a public publishable or anonymous key') from None
        if any(name not in {'supabaseUrl', 'publishableKey'} for name in config):
            raise ValueError('Unexpected backend configuration fields; do not bundle private server credentials')
    expected = runtime_paths(root)
    prefix = 'base/assets/game/' if artifact.suffix == '.aab' else 'assets/game/'
    with zipfile.ZipFile(artifact) as archive:
        found = {name[len(prefix):] for name in archive.namelist() if name.startswith(prefix) and not name.endswith('/')}
        missing, extra = sorted(expected - found), sorted(found - expected)
        mismatched = sorted(name for name in expected & found if archive.read(prefix + name) != (root / name).read_bytes())
        private = [name for name in archive.namelist() if any(term in name.lower() for term in ('.keystore', '.jks', 'signing.properties', 'local.properties', '/.codex', '/.agents', '/.env'))]
        if missing or extra or mismatched or private:
            raise ValueError(json.dumps({'missing': missing, 'extra': extra, 'mismatched': mismatched, 'privatePathsFound': bool(private)}))
    return {'artifact': artifact.name, 'runtimeFiles': len(expected), 'exactSourceMatch': True}

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('artifacts', nargs='+', type=Path)
    args = parser.parse_args()
    for artifact in args.artifacts:
        print(json.dumps(verify(artifact)))
