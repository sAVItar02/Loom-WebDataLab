import requests
from bs4 import BeautifulSoup
from datetime import datetime
from typing import List, Optional

def detect_value(value: str): 
    value = value.strip()

    try: 
        return "number", int(value), None
    except: 
        pass
    try: 
        return "number", float(value), None
    except: 
        pass
    try: 
        return "date", None, datetime.fromisoformat(value)
    except: 
        pass
    return "text", None, None

def scrape_static(url: str, selector: str) -> List[Dict]: 
    response = requests.get(url)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")
    elements = soup.select(selector)

    result = []

    for el in elements:
        detected_type, numeric_value, date_value = detect_value(el.get_text())
        result.append({
            "tag_name": el.name,
            "text_content": el.get_text(),
            "detected_type": detected_type,
            "numeric_value": numeric_value,
            "date_value": date_value
        })
    
    return result