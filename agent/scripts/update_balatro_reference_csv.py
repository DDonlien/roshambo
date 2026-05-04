import csv
import json
from pathlib import Path

csv_path = Path("/Users/taobe/Documents/GitHub/Roshambo/game-design/reference/Balatro_Items_Reference_Roshambo.csv")
base = Path("/Users/taobe/Documents/GitHub/Roshambo/ts/public/definition")

implemented_sleeves = {
    item["name"]
    for item in json.loads((base / "sleevedefinition.json").read_text(encoding="utf-8"))["sleeves"]
}
implemented_gifts = {
    item["name"]
    for item in json.loads((base / "giftcarddefinition.json").read_text(encoding="utf-8"))["giftcards"]
}
implemented_playmats = {
    item["name"]
    for item in json.loads((base / "playmatdefinition.json").read_text(encoding="utf-8"))["playmats"]
}
implemented_sheet2 = implemented_gifts | implemented_playmats


def status_for_row(sheet: str, name_en: str) -> str:
    if sheet == "Sleeves-Jokers":
        return "已开发未测试" if name_en in implemented_sleeves else "未开发"
    if sheet == "GiftCards-Tarots":
        return "已开发未测试" if name_en in implemented_sheet2 else "未开发"
    if sheet == "Vouchers-Balatro":
        return "未开发"
    return ""


with csv_path.open(encoding="utf-8", newline="") as f:
    rows = list(csv.DictReader(f))

fieldnames = list(rows[0].keys()) if rows else []
if "dev_status" not in fieldnames:
    fieldnames.append("dev_status")

for row in rows:
    sheet = (row.get("sheet") or "").strip()
    if sheet not in {"Sleeves-Jokers", "GiftCards-Tarots", "Vouchers-Balatro"}:
        continue
    name_en = (row.get("name_en") or "").strip()
    if not name_en:
        continue
    row["dev_status"] = status_for_row(sheet, name_en)

with csv_path.open("w", encoding="utf-8", newline="") as f:
    w = csv.DictWriter(f, fieldnames=fieldnames)
    w.writeheader()
    w.writerows(rows)

print(f"updated {csv_path}")
