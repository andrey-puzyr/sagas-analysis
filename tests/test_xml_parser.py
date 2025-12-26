import tempfile
from pathlib import Path

import pytest

from src.xml_parser import parse_saga, Saga, Chapter


class TestParseSaga:
    """Тесты парсинга XML файлов."""

    def test_parses_single_chapter(self) -> None:
        # Setup
        xml_content = """<?xml version="1.0" encoding="utf-8"?>
        <document>
            <metadata>
                <basename>test_saga.en</basename>
                <language_iso>en</language_iso>
            </metadata>
            <content>
                <chapter number="1" title="Chapter One">
                    <paragraph>First paragraph text.</paragraph>
                    <paragraph>Second paragraph text.</paragraph>
                </chapter>
            </content>
        </document>"""
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.xml', delete=False) as f:
            f.write(xml_content)
            filepath = f.name
        
        # Act
        saga = parse_saga(filepath)
        
        # Assert
        assert saga.basename == "test_saga.en"
        assert saga.language_iso == "en"
        assert len(saga.chapters) == 1
        assert saga.chapters[0].number == 1
        assert saga.chapters[0].title == "Chapter One"
        assert saga.chapters[0].paragraphs == ["First paragraph text.", "Second paragraph text."]
        
        Path(filepath).unlink()

    def test_parses_multiple_chapters(self) -> None:
        # Setup
        xml_content = """<?xml version="1.0" encoding="utf-8"?>
        <document>
            <metadata>
                <basename>multi_saga.on</basename>
                <language_iso>on</language_iso>
            </metadata>
            <content>
                <chapter number="1" title="First">
                    <paragraph>Text one.</paragraph>
                </chapter>
                <chapter number="2" title="Second">
                    <paragraph>Text two.</paragraph>
                </chapter>
                <chapter number="3" title="Third">
                    <paragraph>Text three.</paragraph>
                </chapter>
            </content>
        </document>"""
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.xml', delete=False) as f:
            f.write(xml_content)
            filepath = f.name
        
        # Act
        saga = parse_saga(filepath)
        
        # Assert
        assert len(saga.chapters) == 3
        assert [c.number for c in saga.chapters] == [1, 2, 3]
        assert [c.title for c in saga.chapters] == ["First", "Second", "Third"]
        
        Path(filepath).unlink()

    @pytest.mark.parametrize("lang_iso,basename", [
        ("en", "saga.en"),
        ("on", "saga.on"),
        ("is", "saga.is"),
    ])
    def test_parses_language_iso(self, lang_iso: str, basename: str) -> None:
        # Setup
        xml_content = f"""<?xml version="1.0" encoding="utf-8"?>
        <document>
            <metadata>
                <basename>{basename}</basename>
                <language_iso>{lang_iso}</language_iso>
            </metadata>
            <content>
                <chapter number="1" title="Test">
                    <paragraph>Test.</paragraph>
                </chapter>
            </content>
        </document>"""
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.xml', delete=False) as f:
            f.write(xml_content)
            filepath = f.name
        
        # Act
        saga = parse_saga(filepath)
        
        # Assert
        assert saga.language_iso == lang_iso
        assert saga.basename == basename
        
        Path(filepath).unlink()

