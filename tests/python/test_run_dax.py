import json
import unittest

from sdk.python.run_dax import DEFAULT_LAYERS, merge_layers, run_dax


class RunDaxTests(unittest.TestCase):
    def test_merge_layers_overrides(self):
        merged = merge_layers({10: {"prompt": "override"}})
        prompt = next(layer["prompt"] for layer in merged if layer["id"] == 10)
        self.assertEqual(prompt, "override")

    def test_run_without_reasons(self):
        calls = []

        def transport(messages):
            # Track prior output chaining through messages content.
            calls.append(messages[0]["content"])
            return f"reply-{len(calls)}"

        result = run_dax(
            "seed",
            api_key="dummy",
            transport=transport,
        )
        self.assertEqual(len(result["trace"]), len(DEFAULT_LAYERS))
        self.assertEqual(result["output"], f"reply-{len(DEFAULT_LAYERS)}")
        self.assertIn("reply-1", calls[1])

    def test_run_with_reasons(self):
        def transport(_messages):
            return json.dumps({"output": "clean", "reason": "ok"})

        result = run_dax(
            "seed",
            api_key="dummy",
            include_reasons=True,
            transport=transport,
        )
        self.assertEqual(result["output"], "clean")
        self.assertEqual(result["trace"][0]["reason"], "ok")


if __name__ == "__main__":
    unittest.main()
