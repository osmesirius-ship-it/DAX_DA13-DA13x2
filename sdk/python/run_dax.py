"""Minimal Python SDK for DA-13/DA-X recursion.

- Zero external dependencies; uses urllib.
- Supports layer prompt overrides and optional audit reasons per layer.
- Accepts custom transport to plug in retries, proxies, or offline fakes.
"""

from __future__ import annotations

import json
import urllib.request
from typing import Callable, Dict, Iterable, List, Optional

import pathlib

_DEFAULT_LAYERS_PATH = pathlib.Path(__file__).resolve().parents[2] / "config" / "layers.json"
with _DEFAULT_LAYERS_PATH.open("r", encoding="utf-8") as f:
    DEFAULT_LAYERS = json.load(f)

Transport = Callable[[Dict], str]


def _default_transport(api_key: str, model: str, messages: Iterable[Dict]) -> str:
    payload = json.dumps({"model": model, "messages": list(messages), "temperature": 0.2}).encode("utf-8")
    req = urllib.request.Request(
        "https://api.x.ai/v1/chat/completions",
        data=payload,
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {api_key}"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            body = resp.read().decode("utf-8")
            if resp.status < 200 or resp.status >= 300:
                raise RuntimeError(f"HTTP {resp.status}: {body}")
            parsed = json.loads(body)
            return parsed["choices"][0]["message"]["content"].strip()
    except Exception as err:  # noqa: BLE001
        raise RuntimeError(f"transport failure: {err}") from err


def merge_layers(layer_overrides: Optional[Dict]) -> List[Dict]:
    overrides = layer_overrides or {}
    merged = []
    for layer in DEFAULT_LAYERS:
        override = overrides.get(layer["id"])
        merged.append({**layer, **(override or {})})
    return merged


def run_dax(
    input_text: str,
    *,
    api_key: str,
    model: str = "grok-4",
    layer_overrides: Optional[Dict] = None,
    include_reasons: bool = False,
    transport: Optional[Transport] = None,
):
    """Run DA-13 -> DA-X recursion.

    Returns a dict with `output` and `trace`. When include_reasons=True, each trace entry
    includes a `reason` side-channel provided by the model.
    """

    if not api_key:
        raise ValueError("api_key is required")
    layers = merge_layers(layer_overrides)
    transport_fn = transport or (lambda messages: _default_transport(api_key, model, messages))

    current = input_text
    trace: List[Dict] = []

    for layer in layers:
        if include_reasons:
            protocol = (
                f"{layer['prompt']}\n"
                "Respond strictly as JSON with keys output (stabilized text) and reason (brief audit note)."
            )
        else:
            protocol = f"{layer['prompt']}\nRespond with only the stabilized text. No meta-commentary."

        messages = [
            {
                "role": "user",
                "content": (
                    f"You are {layer['name']} acting as {layer['agent']}.\n"
                    f"Duty: {layer['desc']}.\n"
                    f"Protocol: {protocol}\n"
                    f"Prior output:\n{current}"
                ),
            }
        ]

        reply = transport_fn(messages)

        if include_reasons:
            try:
                parsed = json.loads(reply)
                current = (parsed.get("output") or "").strip()
                trace.append({"layer": layer["name"], "output": current, "reason": parsed.get("reason", "")})
            except Exception as err:  # noqa: BLE001
                raise RuntimeError(f"{layer['name']} returned non-JSON while include_reasons=True: {reply}") from err
        else:
            current = reply
            trace.append({"layer": layer["name"], "output": current})

    return {"output": current, "trace": trace}


__all__ = ["run_dax", "merge_layers", "DEFAULT_LAYERS"]
