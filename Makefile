.PHONY: setup run test clean

VENV := .venv
PYTHON := $(VENV)/bin/python
PIP := $(VENV)/bin/pip

setup:
	python3 -m venv $(VENV)
	$(PIP) install -r requirements.txt

run:
	$(PYTHON) -m src.main "./data/*.en.xml" "./data/*.on.xml"

test:
	$(VENV)/bin/pytest tests/ -v

clean:
	rm -rf $(VENV)
	find . -type d -name __pycache__ -exec rm -rf {} +

