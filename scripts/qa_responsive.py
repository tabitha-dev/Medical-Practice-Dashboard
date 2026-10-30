#!/usr/bin/env python3
import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright

URL="http://127.0.0.1:8000/"
OUT=Path("qa-output");OUT.mkdir(exist_ok=True)
async def main():
  results=[]
  async with async_playwright() as p:
    browser=await p.chromium.launch(headless=True,args=["--no-sandbox"])
    for width,height,label in [(320,740,"small-phone"),(390,844,"phone"),(768,900,"tablet"),(1024,768,"laptop"),(1440,900,"desktop")]:
      context=await browser.new_context(viewport={"width":width,"height":height},reduced_motion="reduce")
      page=await context.new_page()
      errors=[];failed=[]
      page.on("pageerror",lambda e:errors.append(str(e)))
      page.on("requestfailed",lambda r:failed.append(r.url))
      consoleErrors=[]
      page.on("console",lambda m:consoleErrors.append(m.text) if m.type=="error" else None)
      await page.goto(URL,wait_until="domcontentloaded",timeout=50000)
      try:await page.locator("#mp-hero-title").wait_for(state="visible",timeout=12000)
      except Exception:
        snapshot=await page.evaluate("""()=>({ready:document.readyState,hasNav:!!window.navigation,navType:typeof window.navigation?.showPage,main:document.querySelector('#main-content')?.outerHTML.slice(0,700),enhanced:[...document.scripts].some(x=>x.src.includes('practice-enhancements'))})""")
        print(json.dumps({"viewport":label,"pageErrors":errors,"consoleErrors":consoleErrors[-10:],"failedRequests":failed[-10:],"snapshot":snapshot},indent=2),flush=True)
        await page.screenshot(path=str(OUT/("render-blocked-"+label+".png")))
        raise
      assert await page.locator(".mp-demo-banner").count()==1,(label,"demo notice")
      assert await page.locator('#mp-sidebar [data-icon] svg.mp-polish-icon').count()>=6,(label,"sidebar icons not unified")
      if width<768:
        assert await page.locator('#mp-mobile-nav .mp-polish-icon').count()==5,(label,"mobile icons not unified")
      assert await page.locator('link[rel="canonical"]').get_attribute('href')=="https://tabitha-dev.github.io/Medical-Practice-Dashboard/",(label,"canonical SEO")
      assert await page.locator('meta[property="og:image"]').count()==1,(label,"missing social preview")
      assert await page.locator('script[type="application/ld+json"]').count()>=1,(label,"AEO structured data missing")
      metrics=await page.evaluate("""() => ({viewport:innerWidth,root:document.documentElement.scrollWidth,body:document.body.scrollWidth,hero:document.querySelector('.mp-hero').getBoundingClientRect().width,css:!![...document.styleSheets].find(s=>s.href?.includes('practice-theme.css'))})""")
      assert metrics["root"]<=width+2,(label,"horizontal overflow",metrics)
      assert metrics["hero"]>230,(label,"hero too small",metrics)
      assert metrics["css"],(label,"new stylesheet failed",metrics)
      if width<768:
        menu=page.locator("#mp-mobile-nav")
        assert await menu.is_visible(),(label,"mobile nav missing")
        await page.locator('#mp-mobile-nav button[data-page="patients"]').click()
      else:
        await page.locator("#mp-sidebar [onclick*=\"'patients'\"]").first.click()
      await page.locator("#main-content").get_by_text("Patients",exact=False).first.wait_for()
      assert await page.locator("#patientSearchInput").is_visible(),(label,"patient search missing")
      assert await page.locator(".mp-page-heading h1").inner_text()=="Patient directory",(label,"missing semantic heading")
      assert await page.locator(".mp-page-heading[data-art='patients']").count()==1,(label,"patient artwork missing")
      if label=="desktop":
        art_url=await page.locator(".mp-page-heading").evaluate("el=>el.style.getPropertyValue('--mp-page-art')")
        assert "cdn.openart.ai" in art_url,(label,"OpenArt patient artwork not linked")
      assert page.url.endswith("#patients"),(label,"patient route not shareable",page.url)
      await page.locator("#patientSearchInput").fill("zzzz-no-such-patient")
      await page.locator("#patientSearchInput").press("Tab")
      assert await page.locator("#main-content .mp-empty-row").count()==1,(label,"illustrated patient empty state not available")
      if width<768:
        await page.locator('#mp-mobile-nav button[data-page="appointments"]').click()
      else:
        await page.locator("#mp-sidebar [onclick*=\"'appointments'\"]").first.click()
      assert await page.locator("#appointments-dynamic-content").count()==1,(label,"appointments view")
      assert page.url.endswith("#appointments"),(label,"appointments hash",page.url)
      await page.go_back()
      await page.wait_for_function("window.navigation.currentPage==='patients'")
      assert await page.locator("#patientSearchInput").is_visible(),(label,"back navigation")
      await page.go_forward()
      await page.wait_for_function("window.navigation.currentPage==='appointments'")
      assert await page.locator(".mp-page-heading h1").inner_text()=="Appointments",(label,"appointments heading")
      assert await page.locator(".mp-page-heading[data-art='appointments']").count()==1,(label,"appointment artwork missing")
      await page.evaluate("() => {window.__testAppointments=window.navigation.mockData.appointments;window.navigation.mockData.appointments=[];window.navigation.renderAppointmentsView('daily')}")
      await page.locator('#appointments-dynamic-content button[onclick^="editAppointment"]').first.click()
      assert await page.locator("#mp-accessible-notice").is_visible(),(label,"fallback appointment action failed")
      await page.locator("#mp-accessible-notice button").click()
      await page.evaluate("() => {window.navigation.mockData.appointments=window.__testAppointments}")
      if width<768:
        await page.locator('#mp-mobile-nav button[data-page="billing"]').click()
      else:
        await page.locator("#mp-sidebar [onclick*=\"'billing'\"]").first.click()
      assert "Billing" in await page.locator("#main-content").inner_text(),(label,"billing view")
      assert await page.locator(".mp-page-heading h1").inner_text()=="Billing & collections",(label,"billing heading")
      assert await page.locator(".mp-page-heading[data-art='billing']").count()==1,(label,"billing artwork missing")
      assert await page.locator(".mp-billing-result-count").is_visible(),(label,"billing filters not active")
      invoice_search=page.locator('input[placeholder="Search invoices..."]')
      await invoice_search.fill("zzzz-no-such-invoice")
      assert (await page.locator(".mp-billing-result-count").inner_text()).startswith("0 of "),(label,"billing search filter failed")
      assert await page.locator("#mp-billing-empty").is_visible(),(label,"billing empty state not visible")
      await invoice_search.fill("")
      assert (await page.locator(".mp-billing-result-count").inner_text()).startswith("300 of "),(label,"billing reset failed")
      assert await page.locator("#mp-billing-empty").is_hidden(),(label,"billing empty state remained after filter reset")
      if width<768:
        await page.locator("#mp-more-btn").click()
        assert await page.locator("#mp-mobile-more").is_visible(),(label,"mobile More hidden")
        await page.locator('#mp-mobile-more button[data-page="booking"]').click()
      else:
        await page.locator("#mp-sidebar [onclick*=\"'booking'\"]").first.click()
      assert "Book" in await page.locator("#main-content").inner_text(),(label,"booking")
      assert await page.locator(".mp-page-heading h1").inner_text()=="Booking preview",(label,"booking heading")
      assert await page.locator(".mp-page-heading[data-art='booking']").count()==1,(label,"booking artwork missing")
      radios=page.locator('#main-content input[type="radio"]')
      assert await radios.count()>=3,(label,"visit choice circles not found")
      geom=await radios.first.evaluate("""el => ({w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height,ratio:getComputedStyle(el).aspectRatio,shrink:getComputedStyle(el).flexShrink,radius:getComputedStyle(el).borderRadius})""")
      assert abs(geom["w"]-geom["h"])<0.2 and geom["w"]>=20,(label,"radio oval geometry regression",geom)
      assert geom["shrink"]=="0",(label,"radio flex collapse",geom)
      await radios.first.check()
      assert await radios.first.is_checked(),(label,"radio selection broken")
      if width<768:
        await page.locator('#mp-mobile-nav button[data-page="dashboard"]').click()
      else:
        await page.locator("#mp-sidebar [onclick*=\"'dashboard'\"]").first.click()
      await page.locator("#mp-hero-title").wait_for()
      scroll_layout=await page.evaluate("""() => {
        const outer=document.querySelector('body>div.relative.flex.size-full');
        const last=document.querySelector('.mp-visits-card');
        const workspace=document.querySelector('#mp-workspace');
        const outerRect=outer.getBoundingClientRect(),lastRect=last.getBoundingClientRect(),workspaceRect=workspace.getBoundingClientRect();
        return {overflowY:getComputedStyle(outer).overflowY,workspaceBottom:workspaceRect.bottom,lastBottom:lastRect.bottom,outerBottom:outerRect.bottom};
      }""")
      assert scroll_layout["overflowY"]=="visible",(label,"dashboard nested scroll still clipping",scroll_layout)
      assert scroll_layout["workspaceBottom"]>=scroll_layout["lastBottom"]-3,(label,"lower dashboard clipped",scroll_layout)
      assert await page.locator(".mp-visits-card").count()==1,(label,"upcoming visits panel missing")
      assert await page.locator("#dashboard-page .mp-line-svg").is_visible(),(label,"appointment line chart missing")
      assert await page.locator("#dashboard-page .mp-report-banner img").count()==1,(label,"OpenArt analytics illustration missing")
      if label=="desktop":
        links=await page.evaluate("""() => {
          const art=document.querySelector('#dashboard-page .mp-report-banner img');
          const empty=getComputedStyle(document.documentElement).getPropertyValue('--mp-empty-art');
          return {analytics:art?.src,empty};
        }""")
        assert "cdn.openart.ai" in links["analytics"] and "cdn.openart.ai" in links["empty"],(label,"OpenArt assets unlinked",links)
        image_validation=await page.evaluate("""async () => {
          const urls=[
            document.querySelector('#dashboard-page .mp-report-banner img')?.src,
            'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/HOjo8ynMh9nVC5lV2qAW/file_1793325784638_ce2804eb'
          ].filter(Boolean);
          return await Promise.all(urls.map(src=>new Promise(resolve=>{
            const i=new Image();
            i.onload=()=>resolve({src,width:i.naturalWidth,height:i.naturalHeight,loaded:true});
            i.onerror=()=>resolve({src,loaded:false});
            i.src=src;
          })));
        }""")
        print(json.dumps({"illustrationsLoaded":image_validation}),flush=True)
        assert image_validation[0]["loaded"],(label,"analytics OpenArt asset failed to load",image_validation)
      assert await page.locator("#dashboard-page .mp-donut-svg").is_visible(),(label,"patient status donut missing")
      assert await page.locator("#dashboard-page .mp-metric").count()==4,(label,"KPI grid missing")
      assert await page.locator("#main-content h3",has_text="Recent Activity").count()==0,(label,"duplicate legacy dashboard card")
      chart_colors=await page.evaluate("""() => [...document.querySelectorAll('.mp-status-list li small')].map(x=>Number(x.textContent.replace(/[^0-9.]/g,'')))""")
      assert abs(sum(chart_colors)-100)<=0.11,(label,"patient status percentages inconsistent",chart_colors)
      if width<768:
        mobile_order=await page.evaluate("""() => [...document.querySelector('#main-content').children].slice(0,3).map(x=>x.className)""")
        assert mobile_order==["mp-mobile-heading","mp-demo-banner","mp-hero"],(label,"mobile page hierarchy wrong",mobile_order)
      chart_stats=await page.evaluate("""() => {
        const d=window.navigation.mockData;
        const b=document.querySelector('#dashboard-page');
        return {appointments:d.appointments.length,patients:d.patients.length,renderedAppointments:Number(b.dataset.sampleAppointments),renderedPatients:Number(b.dataset.samplePatients),svgDescription:document.querySelector('#mp-trend-svg-desc')?.textContent||''};
      }""")
      assert chart_stats["appointments"]==chart_stats["renderedAppointments"],(label,"appointments KPI mismatch",chart_stats)
      assert chart_stats["patients"]==chart_stats["renderedPatients"],(label,"patient KPI mismatch",chart_stats)
      assert "synthetic" in chart_stats["svgDescription"].lower(),(label,"chart disclosure missing")
      assert await page.locator("#dashboard-page .bg-gradient-to-br").count()==0,(label,"old gradient dashboard still present")
      # Data must remain labeled synthetic, not claim real records.
      assert "Synthetic" in await page.locator(".mp-demo-banner").inner_text()
      if label in ("desktop","phone","small-phone"):
        await page.evaluate("window.scrollTo(0,0)")
        await page.screenshot(path=str(OUT/(label+"-dashboard.png")),full_page=False)
        await page.screenshot(path=str(OUT/(label+"-dashboard-full.png")),full_page=True)
      if label=="phone":
        await page.locator('#mp-mobile-nav button[data-page="patients"]').click()
        await page.screenshot(path=str(OUT/"phone-patients.png"),full_page=False)
      assert not errors,(label,"pageerrors",errors)
      results.append({"viewport":label,"width":width,"responsive":"pass","navigation":"pass","demoLabel":"pass","pageErrors":errors,"requestsFailed":failed[:5]})
      await context.close()
    await browser.close()
  (OUT/"responsive-results.json").write_text(json.dumps(results,indent=2))
  print(json.dumps(results,indent=2))
if __name__=="__main__":asyncio.run(main())
