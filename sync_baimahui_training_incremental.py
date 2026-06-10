from __future__ import annotations

import csv
import html
import re
import shutil
import zipfile
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent
VAULT = ROOT / "跨境电商知识库"
NOTES_DIR = VAULT / "10_亚马逊知识库同步" / "佰马汇培训资料" / "2026-05"
ATTACH_DIR = VAULT / "Attachments" / "外部培训资料" / "佰马汇" / "2026-05"
MANIFEST = VAULT / "10_亚马逊知识库同步_清单.csv"

SYNC_DATE = "2026-06-05"
TEXT_LIMIT = 180_000

BLACKHAT_PATTERNS = [
    "黑帽",
    "恶搞",
    "赶跟卖",
    "删差评",
    "差评移除",
    "种子评论",
    "僵尸评论",
    "僵尸链接",
    "翻新",
    "黑科技",
    "多开节点",
    "突破限制",
    "测评实操",
    "卡视频",
    "无限秒杀投诉",
]

FILES = [
    {
        "source": Path(r"E:\佰马汇培训视频\培训资料\AI-独立6团.pdf"),
        "topic": "AI智能体",
        "entry": "09_AI智能体/_目录.md",
    },
    {
        "source": Path(r"E:\佰马汇培训视频\培训资料\大卖 2026-05(3).pdf"),
        "topic": "运营升级",
        "entry": "08_项目管理/_目录.md",
    },
    {
        "source": Path(r"E:\佰马汇培训视频\培训资料\大卖班升级2026-5(3).pdf"),
        "topic": "运营升级",
        "entry": "08_项目管理/_目录.md",
    },
    {
        "source": Path(r"E:\佰马汇培训视频\培训资料\广告搭建实操.xmind"),
        "topic": "广告体系",
        "entry": "02_广告体系/_目录.md",
    },
]


def yaml_quote(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def vault_rel(path: Path) -> str:
    return path.relative_to(VAULT).as_posix()


def is_quarantined(path: Path) -> bool:
    text = str(path)
    return any(pattern in text for pattern in BLACKHAT_PATTERNS)


def truncate(text: str) -> str:
    text = text.replace("\x00", "")
    if len(text) <= TEXT_LIMIT:
        return text
    return text[:TEXT_LIMIT] + "\n\n> [!note] 正文过长，已截断；请打开原件查看完整内容。\n"


def extract_pdf(path: Path) -> tuple[str, str]:
    try:
        from pypdf import PdfReader

        reader = PdfReader(str(path))
        parts: list[str] = []
        max_pages = min(len(reader.pages), 80)
        for index in range(max_pages):
            try:
                text = reader.pages[index].extract_text() or ""
            except Exception as exc:  # noqa: BLE001
                text = f"[第 {index + 1} 页文字抽取失败：{exc}]"
            text = text.strip()
            if text:
                parts.append(f"## 第 {index + 1} 页\n\n{text}")
            if sum(len(part) for part in parts) > TEXT_LIMIT:
                break
        if len(reader.pages) > max_pages:
            parts.append(f"> [!note] PDF 共 {len(reader.pages)} 页，仅抽取前 {max_pages} 页。")
        return truncate("\n\n".join(parts)), "ok"
    except Exception as exc:  # noqa: BLE001
        return "", f"extract_failed: {exc}"


def extract_xmind(path: Path) -> tuple[str, str]:
    try:
        chunks: list[str] = []
        with zipfile.ZipFile(path) as archive:
            for name in archive.namelist():
                if not name.endswith((".xml", ".json")):
                    continue
                raw = archive.read(name).decode("utf-8", errors="ignore")
                if name.endswith(".json"):
                    texts = re.findall(r'"title"\s*:\s*"([^"]+)"', raw)
                    chunks.extend(html.unescape(item).strip() for item in texts if item.strip())
                    continue
                texts = re.findall(r"<title[^>]*>(.*?)</title>|<topic[^>]*title=\"(.*?)\"", raw, flags=re.S)
                for group in texts:
                    value = next((item for item in group if item), "")
                    value = re.sub(r"<[^>]+>", "", value)
                    value = html.unescape(value).strip()
                    if value:
                        chunks.append(value)
        deduped = list(dict.fromkeys(chunks))
        if not deduped:
            return "", "metadata_only"
        body = "\n".join(f"- {item}" for item in deduped)
        return truncate("## XMind 主题摘录\n\n" + body), "ok"
    except Exception as exc:  # noqa: BLE001
        return "", f"extract_failed: {exc}"


def extract_content(path: Path) -> tuple[str, str]:
    ext = path.suffix.lower()
    if ext == ".pdf":
        return extract_pdf(path)
    if ext == ".xmind":
        return extract_xmind(path)
    return "", "metadata_only"


def sync_time() -> str:
    return f"{SYNC_DATE}T{datetime.now().strftime('%H:%M:%S')}"


def note_for(item: dict[str, object], attachment: Path) -> tuple[Path, str]:
    source = item["source"]
    assert isinstance(source, Path)
    title = source.stem
    note = NOTES_DIR / f"{title}.md"
    extracted, status = extract_content(source)
    source_link = vault_rel(attachment)
    topic = str(item["topic"])
    content = [
        "---",
        f"title: {yaml_quote(title)}",
        f"source_path: {yaml_quote(str(source))}",
        f"source_type: {source.suffix.lower()}",
        "source_provider: 佰马汇培训资料",
        f"sync_time: {sync_time()}",
        f"effective_date: {SYNC_DATE}",
        "knowledge_priority: highest",
        "priority_scope: 同类知识最高",
        f"topic: {topic}",
        f"extract_status: {yaml_quote(status)}",
        "tags:",
        "  - amazon-knowledge",
        "  - synced",
        "  - external-training",
        "  - priority-highest",
        "---",
        "",
        f"# {title}",
        "",
        "- 优先等级：最高",
        f"- 最新时间：{SYNC_DATE}",
        "- 来源：佰马汇培训资料",
        f"- 原始路径：`{source}`",
        f"- 原件：[{source.name}]({source_link})",
        f"- 同类入口：{topic}",
        "",
    ]
    if extracted:
        content.extend(["## 抽取正文", "", extracted, ""])
    else:
        content.extend(["> [!note] 未抽取到可用正文，请打开原件查看完整内容。", ""])
    return note, "\n".join(content)


def upsert_section(path: Path, heading: str, lines: list[str]) -> None:
    marker_start = f"<!-- {heading}:start -->"
    marker_end = f"<!-- {heading}:end -->"
    block = "\n".join(["", f"## {heading}", "", marker_start, *lines, marker_end, ""])
    if path.exists():
        text = path.read_text(encoding="utf-8-sig")
    else:
        text = f"# {path.parent.name}\n"
    pattern = re.compile(rf"\n## {re.escape(heading)}\n\n{re.escape(marker_start)}.*?{re.escape(marker_end)}\n?", re.S)
    if pattern.search(text):
        text = pattern.sub(block, text)
    else:
        text = text.rstrip() + "\n" + block
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8-sig")


def write_batch_index(note_links: list[str]) -> None:
    lines = [
        "# 佰马汇培训资料 2026-05",
        "",
        "- 优先等级：最高",
        f"- 最新时间：{SYNC_DATE}",
        "- 来源：佰马汇培训资料",
        "- 归档策略：主归档 + 业务入口索引",
        "",
        "## 最高优先级资料",
        "",
        *note_links,
        "",
    ]
    (NOTES_DIR / "_目录.md").write_text("\n".join(lines), encoding="utf-8-sig")


def update_manifest(rows: list[dict[str, str]]) -> None:
    existing: list[dict[str, str]] = []
    fieldnames = ["relative_path", "note", "note_obsidian", "attachment", "quarantined", "extract_status", "size"]
    if MANIFEST.exists():
        with MANIFEST.open("r", encoding="utf-8-sig", newline="") as fh:
            reader = csv.DictReader(fh)
            if reader.fieldnames:
                fieldnames = reader.fieldnames
            existing = [row for row in reader if not row.get("relative_path", "").startswith("外部培训资料/佰马汇/2026-05/")]
    for row in rows:
        existing.append({key: row.get(key, "") for key in fieldnames})
    with MANIFEST.open("w", encoding="utf-8-sig", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(existing)


def main() -> None:
    NOTES_DIR.mkdir(parents=True, exist_ok=True)
    ATTACH_DIR.mkdir(parents=True, exist_ok=True)

    synced: list[dict[str, str]] = []
    note_links: list[str] = []
    business: dict[str, list[str]] = {
        "02_广告体系/_目录.md": [],
        "09_AI智能体/_目录.md": [],
        "08_项目管理/_目录.md": [],
    }

    for item in FILES:
        source = item["source"]
        assert isinstance(source, Path)
        if not source.exists():
            raise FileNotFoundError(source)
        if is_quarantined(source):
            raise RuntimeError(f"源文件命中隔离关键词，停止同步：{source}")

        attachment = ATTACH_DIR / source.name
        shutil.copy2(source, attachment)
        note, content = note_for(item, attachment)
        note.write_text(content, encoding="utf-8-sig")
        status_match = re.search(r"extract_status: '([^']+)'|extract_status: ([^\n]+)", content)
        status = (status_match.group(1) or status_match.group(2)).strip() if status_match else "unknown"

        obsidian_note = vault_rel(note).removesuffix(".md")
        note_link = f"- [[{obsidian_note}|{source.stem}]]（最高优先级 / 最新：{SYNC_DATE}）"
        note_links.append(note_link)
        business[str(item["entry"])].append(note_link)
        synced.append(
            {
                "relative_path": f"外部培训资料/佰马汇/2026-05/{source.name}",
                "note": vault_rel(note),
                "note_obsidian": obsidian_note,
                "attachment": vault_rel(attachment),
                "quarantined": "no",
                "extract_status": status,
                "size": str(source.stat().st_size),
            }
        )

    write_batch_index(note_links)
    for entry, lines in business.items():
        if lines:
            upsert_section(VAULT / entry, "佰马汇培训资料（最高优先级）", lines)
    update_manifest(synced)

    print("Synced files:")
    for row in synced:
        print(f"- {row['relative_path']} -> {row['note']} [{row['extract_status']}]")


if __name__ == "__main__":
    main()
