export const SCRAPING_TEMPLATES = {
  "static": {
    "name": "Static",
    "description": "This is a python script that will scrape the website and return a pandas dataframe of the elements. Replace the user agent with your own. You can also replace the base_url with the url of the website you want to scrape.",
    "template": (url: string, tag_name: string) => {
        return `
        import requests
        import lxml.html
        from bs4 import BeautifulSoup
        import pandas as pd

        base_url = "${url}"
        headers = {
            'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36"
        }

        response = requests.get(base_url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')
        elements = soup.select("${tag_name}")
        df = pd.DataFrame(elements)
        return df
    `}
  }
}