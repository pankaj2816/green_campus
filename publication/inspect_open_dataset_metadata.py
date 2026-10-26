"""Inspect public metadata and CSV headers; do not download full meter datasets."""

import csv
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen


def fetch(url):
    request = Request(url, headers={"User-Agent": "MGCD-dataset-metadata-review"})
    with urlopen(request, timeout=45) as response:
        return response.read(5_000_001)


def metadata(url):
    content = fetch(url)
    if len(content) > 5_000_000:
        raise ValueError("Metadata response exceeded review limit")
    return json.loads(content)


def header(url):
    request = Request(url, headers={"User-Agent": "MGCD-dataset-metadata-review"})
    with urlopen(request, timeout=45) as response:
        line = response.readline(200_000).decode("utf-8-sig")
    if not line.endswith("\n"):
        raise ValueError("CSV header exceeded bounded read")
    columns = next(csv.reader([line]))
    if columns[0].lower() != "timestamp":
        raise ValueError("Unexpected meter header")
    return columns[1:]


def main():
    kaggle_url = "https://www.kaggle.com/api/v1/datasets/view/cdaclab/unicon"
    zenodo_url = "https://zenodo.org/api/records/3887306"
    dryad_url = "https://datadryad.org/api/v2/datasets/doi%3A10.5061%2Fdryad.k3j9kd5h6"
    dublin_url = "https://data.smartdublin.ie/api/3/action/package_show?id=waste-data-aes-bord-na-mona"
    kitakyushu_url = "https://api.figshare.com/v2/articles/24978645"
    ref = metadata("https://api.github.com/repos/buds-lab/building-data-genome-project-2/commits/master")["sha"]
    license_url = f"https://raw.githubusercontent.com/buds-lab/building-data-genome-project-2/{ref}/LICENSE"
    license_text = fetch(license_url)
    resources = {}
    sources = {}
    for resource in ("electricity", "water", "solar"):
        url = f"https://media.githubusercontent.com/media/buds-lab/building-data-genome-project-2/{ref}/data/meters/raw/{resource}.csv"
        resources[resource] = set(header(url))
        sources[resource] = url
    result = {
        "checked_at_utc": datetime.now(timezone.utc).isoformat(),
        "scope": "Publisher metadata, repository license and bounded raw CSV header inspection only; not row-level completeness or import testing.",
        "bdg2": {
            "source_commit": ref,
            "header_urls": sources,
            "meter_columns": {key: len(value) for key, value in resources.items()},
            "electricity_water_common_count": len(resources["electricity"] & resources["water"]),
            "electricity_water_solar_common_identifiers": sorted(set.intersection(*resources.values())),
            "repository_license_url": license_url,
            "repository_license_first_line": license_text.decode().splitlines()[0],
            "repository_license_sha256": hashlib.sha256(license_text).hexdigest(),
        },
    }
    for name, url in (("unicon", kaggle_url), ("bdg2_archive", zenodo_url), ("hkust", dryad_url), ("dublin_waste", dublin_url), ("kitakyushu", kitakyushu_url)):
        try:
            data = metadata(url)
            if name == "unicon":
                details = {key: data.get(key) for key in ("title", "licenseName", "currentVersionNumber", "totalBytes")}
            elif name == "bdg2_archive":
                details = {"title": data["metadata"].get("title"), "license": data["metadata"].get("license"),
                           "files": [{"name": file.get("key"), "bytes": file.get("size")} for file in data.get("files", [])]}
            elif name == "hkust":
                details = {key: data.get(key) for key in ("title", "license", "versionNumber")}
            elif name == "kitakyushu":
                details = {key: data.get(key) for key in ("title", "doi", "version", "license")}
                details["files"] = [{"name": file.get("name"), "bytes": file.get("size")} for file in data.get("files", [])]
            else:
                data = data["result"]
                details = {key: data.get(key) for key in ("title", "license_id", "license_title", "license_url")}
            result[name] = {"metadata_url": url, **details}
        except Exception as error:
            result[name] = {"metadata_url": url, "error": str(error)}
    output = Path(__file__).with_name("dataset_metadata_review.json")
    output.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
