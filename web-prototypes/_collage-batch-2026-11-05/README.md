# Collage batch 2026-11-05

Tools to rebuild 20 term collage trials from `selection-plan.json`.

```bash
python3 tools/build_boards.py
# free port then:
fuser -k 8791/tcp; python3 tools/shoot_previews.py
```

Does not modify Coquette or liminal trial.
