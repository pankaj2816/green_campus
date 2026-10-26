"""Check paper references, key evidence values and PDF geometry; not peer review."""

import argparse
import json
from pathlib import Path
import re

import pdfplumber
from pypdf import PdfReader


ROOT = Path(__file__).resolve().parent


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", type=Path, default=ROOT / "main.pdf")
    args = parser.parse_args()
    tex = (ROOT / "main.tex").read_text(encoding="utf-8")
    before = json.loads((ROOT / "external_bdg2_results.json").read_text())
    after = json.loads((ROOT / "external_bdg2_postfix_results.json").read_text())
    assert after["api_verification"]["status"] == "passed"
    assert len(after["api_verification"]["checks"]) == 18
    assert after["api_verification"]["baseline_summary"]["record_count"] == 4662
    assert after["evaluation_common_days"] == 518
    assert after["api_verification"]["baseline_summary"]["green_index"] == 0
    assert after["api_verification"]["data_quality"]["forecast_readiness"] == 73.2
    assert before["api_verification"]["data_quality"]["forecast_readiness"] == 100
    for key, result in after["backtest"]["results"].items():
        old = before["backtest"]["results"][key]
        for number in (old["models"]["mgcd_current"]["wape_percent"],
                       result["models"]["mgcd_current"]["wape_percent"],
                       result["models"]["seasonal_naive_7day"]["wape_percent"]):
            assert f"{number:.3f}" in tex, (key, number)
    assert "post-correction regression" in tex
    assert "untouched" in tex
    citations = {key for group in re.findall(r"\\cite\{([^}]+)\}", tex) for key in group.split(",")}
    references = set(re.findall(r"\\bibitem\{([^}]+)\}", tex))
    assert citations <= references, f"Undefined citations: {citations - references}"
    labels = set(re.findall(r"\\label\{([^}]+)\}", tex))
    assert set(re.findall(r"\\ref\{([^}]+)\}", tex)) <= labels

    reader = PdfReader(args.pdf)
    unembedded = set()
    fonts = set()
    for page in reader.pages:
        for reference in page["/Resources"].get("/Font", {}).values():
            font = reference.get_object()
            fonts.add(str(font.get("/BaseFont")))
            for descendant in font.get("/DescendantFonts", [font]):
                descriptor = descendant.get_object().get("/FontDescriptor")
                assert descriptor is not None, "Font embedding cannot be verified"
                if not any(key in descriptor.get_object() for key in ("/FontFile", "/FontFile2", "/FontFile3")):
                    unembedded.add(str(font.get("/BaseFont")))
    assert not unembedded, f"Unembedded fonts: {unembedded}"
    pages = []
    with pdfplumber.open(args.pdf) as pdf:
        text = "\n".join(page.extract_text() or "" for page in pdf.pages)
        assert "6.763" in text and "73.2" in text and "55 backend" in text
        assert "??" not in text, "Unresolved PDF reference"
        for index, page in enumerate(pdf.pages, 1):
            words = page.extract_words()
            escaped = [word["text"] for word in words if word["x0"] < 25 or word["x1"] > page.width - 25
                       or word["top"] < 20 or word["bottom"] > page.height - 20]
            assert not escaped, (index, escaped)
            pages.append({"page": index, "words": len(words), "edge_overflow": escaped})
    print(json.dumps({"status": "passed", "pages": pages, "fonts": sorted(fonts),
                      "citations": len(citations), "note": "Visual review, author approval and venue checks remain separate."}, indent=2))


if __name__ == "__main__":
    main()
