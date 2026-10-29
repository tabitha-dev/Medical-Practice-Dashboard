#!/usr/bin/env python3
import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
async def main():
  results=[];issues=[]
  async with async_playwright() as p:
    browser=await p.chromium.launch(headless=True,args=["--no-sandbox"])
    for width,height in [(390,844),(1440,900)]:
      context=await browser.new_context(viewport={"width":width,"height":height},reduced_motion="reduce")
      page=await context.new_page()
      await page.goto("http://127.0.0.1:8000/",wait_until="domcontentloaded")
      await page.locator("#mp-hero-title").wait_for(timeout=25000)
      await page.add_script_tag(path="node_modules/axe-core/axe.min.js")
      for route in ["dashboard","patients","appointments","billing","settings"]:
        await page.evaluate("(route)=>window.navigation.showPage(route)",route)
        await page.wait_for_timeout(160)
        report=await page.evaluate("""async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.slice(0,4).map(n=>({target:n.target,html:n.html.slice(0,180)}))}));}""")
        results.append({"width":width,"page":route,"violations":report})
        issues.extend([{"width":width,"page":route,**item} for item in report if item["impact"] in ("serious","critical")])
      await context.close()
    await browser.close()
  Path("qa-output/axe-results.json").write_text(json.dumps(results,indent=2))
  print(json.dumps({"seriousOrCritical":issues,"results":results},indent=2))
  if issues:raise SystemExit("Serious or critical automated accessibility findings")
if __name__=="__main__":asyncio.run(main())
