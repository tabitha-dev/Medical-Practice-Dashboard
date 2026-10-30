/* MedOps polish: uniform accessible icons, original editorial artwork and meaningful empty states. */
(() => {
  'use strict';
  const arts={
    "patients": "https://cdn.openart.ai/openart-ai/production/2026-10/create-image/HOjo8ynMh9nVC5lV2qAW/image_1793325475265_5f104b50_1793325475290_ca50e9a8.svg",
    "appointments": "https://cdn.openart.ai/openart-ai/production/2026-10/create-image/HOjo8ynMh9nVC5lV2qAW/image_1793325479293_cb4174b4_1793325479311_453ea173.svg",
    "booking": "https://cdn.openart.ai/openart-ai/production/2026-10/create-image/HOjo8ynMh9nVC5lV2qAW/image_1793325479293_cb4174b4_1793325479311_453ea173.svg",
    "billing": "https://cdn.openart.ai/openart-ai/production/2026-10/create-image/HOjo8ynMh9nVC5lV2qAW/image_1793325480269_74fce965_1793325480284_2d391167.svg",
    "analytics": "https://cdn.openart.ai/openart-ai/production/2026-10/create-image/HOjo8ynMh9nVC5lV2qAW/image_1793325483198_3ed6892b_1793325483418_abb6f9d5.svg",
    "empty": "https://cdn.openart.ai/openart-ai/production/2026-10/create-image/HOjo8ynMh9nVC5lV2qAW/image_1793325488108_68149ab8_1793325488121_10c4d19d.svg"
};
  const paths={
    House:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"/><path d="M9 21v-8h6v8"/>',
    Users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    Calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/><path d="M8 15h3v3H8z"/>',
    CalendarPlus:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18M12 14v5M9.5 16.5h5"/>',
    CurrencyDollar:'<circle cx="12" cy="12" r="9"/><path d="M12 5v14M15 8.5c-.6-.8-1.7-1.2-3-1.2-1.8 0-3 1-3 2.4 0 1.5 1.2 2.1 3 2.3 1.8.2 3 .8 3 2.3 0 1.4-1.2 2.4-3 2.4-1.3 0-2.5-.4-3.2-1.2"/>',
    Gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1-1.9 1.9-.1-.1a1.7 1.7 0 0 0-1.8-.3l-.2.1a1.7 1.7 0 0 0-1 1.5V21h-2.7v-.2a1.7 1.7 0 0 0-1-1.5l-.2-.1a1.7 1.7 0 0 0-1.8.3l-.1.1-1.9-1.9.1-.1a1.7 1.7 0 0 0 .3-1.8l-.1-.2a1.7 1.7 0 0 0-1.5-1H4v-2.7h.2a1.7 1.7 0 0 0 1.5-1l.1-.2a1.7 1.7 0 0 0-.3-1.8l-.1-.1 1.9-1.9.1.1a1.7 1.7 0 0 0 1.8.3l.2-.1a1.7 1.7 0 0 0 1-1.5V4h2.7v.2a1.7 1.7 0 0 0 1 1.5l.2.1a1.7 1.7 0 0 0 1.8-.3l.1-.1 1.9 1.9-.1.1a1.7 1.7 0 0 0-.3 1.8l.1.2a1.7 1.7 0 0 0 1.5 1H21v2.7h-.2a1.7 1.7 0 0 0-1.5 1Z"/>',
    Question:'<circle cx="12" cy="12" r="9"/><path d="M9.4 9a2.7 2.7 0 1 1 4.8 1.7c-.9 1-2.2 1.5-2.2 3"/><circle cx="12" cy="17" r=".7" fill="currentColor" stroke="none"/>',
    CaretLeft:'<path d="m15 18-6-6 6-6"/>',
    CaretRight:'<path d="m9 18 6-6-6-6"/>',
    More:'<circle cx="5" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.2" fill="currentColor" stroke="none"/>',
    HeartPulse:'<path d="M20.8 7.3a5 5 0 0 0-8.8-2.8 5 5 0 0 0-8.8 2.8c-1 5.4 5.3 9.7 8.8 12.7 3.5-3 9.8-7.3 8.8-12.7Z"/><path d="M3.2 12h5l2-3.5 3 6 2-2.5h5"/>'
  };
  function icon(name){
    return '<svg class="mp-polish-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[name]||paths.House)+'</svg>';
  }
  function setArt(node,url){
    if(!node||!url)return;
    node.style.setProperty('--mp-page-art','url("'+url+'")');
  }
  function refreshIcons(){
    document.querySelectorAll('#mp-sidebar [data-icon]').forEach(container=>{
      const name=container.getAttribute('data-icon');
      if(!paths[name]||container.dataset.mpPolished)return;
      container.innerHTML=icon(name);container.dataset.mpPolished='true';container.setAttribute('aria-hidden','true');
    });
    document.querySelectorAll('.mp-brand-mark,.mp-mobile-heading-mark').forEach(node=>{
      node.innerHTML=icon('HeartPulse');
      node.setAttribute('aria-hidden','true');
    });
    const mobile=['House','Users','Calendar','CurrencyDollar','More'];
    document.querySelectorAll('#mp-mobile-nav button').forEach((button,i)=>{
      const holder=button.querySelector('[aria-hidden="true"]');
      if(holder&&mobile[i])holder.innerHTML=icon(mobile[i]);
    });
    const more={booking:['CalendarPlus','Book demo appointment'],settings:['Gear','Settings demo'],'help-docs':['Question','Help and docs']};
    document.querySelectorAll('#mp-mobile-more button[data-page]').forEach(button=>{
      const entry=more[button.dataset.page];
      if(!entry||button.dataset.mpPolished)return;
      button.innerHTML='<span aria-hidden="true">'+icon(entry[0])+'</span><span>'+entry[1]+'</span>';
      button.dataset.mpPolished='true';
    });
  }
  function patientEmpty(){
    document.querySelectorAll('#main-content table tbody tr').forEach(row=>{
      if(/No patients found matching your criteria/i.test(row.textContent||''))row.classList.add('mp-empty-row');
    });
  }
  function billingEmpty(){
    const result=document.querySelector('#main-content .mp-billing-result-count');
    if(!result)return;
    let panel=document.querySelector('#mp-billing-empty');
    if(!panel){
      panel=document.createElement('div');
      panel.id='mp-billing-empty';panel.className='mp-polish-empty';
      panel.innerHTML='<strong>No matching sample invoices</strong><p>Adjust the search or filters to see more synthetic billing examples.</p>';
      panel.hidden=true;
      const holder=document.querySelector('#main-content table')?.closest('.bg-white');
      holder?.after(panel);
    }
    const sync=()=>{panel.hidden=!/^0 of /.test(result.textContent||'');};
    if(!result.dataset.mpObserved){
      new MutationObserver(sync).observe(result,{childList:true,characterData:true,subtree:true});
      result.dataset.mpObserved='true';
    }
    sync();
  }
  function reportArt(){
    const board=document.querySelector('#dashboard-page');
    if(!board||!arts.analytics||board.querySelector('.mp-report-banner'))return;
    const banner=document.createElement('section');
    banner.className='mp-report-banner';
    banner.setAttribute('aria-labelledby','mp-report-art-heading');
    banner.innerHTML='<div><span class="mp-eyebrow">PRACTICE INSIGHTS</span><h3 id="mp-report-art-heading">Analytics built for clarity.</h3><p>Explore synthetic practice signals, with exact chart values and accessible descriptions alongside each visualization.</p></div><img src="'+arts.analytics+'" width="440" height="248" alt="" loading="lazy" decoding="async">';
    const chartGrid=board.querySelector('.mp-viz-grid');
    chartGrid?.after(banner);
  }
  function enhancePage(page){
    refreshIcons();
    const heading=document.querySelector('#main-content .mp-page-heading');
    if(heading&&arts[page]){
      heading.dataset.art=page;
      setArt(heading,arts[page]);
    }
    if(page==='booking'){
      document.querySelectorAll('#main-content [data-icon="CaretLeft"],#main-content [data-icon="CaretRight"]').forEach(node=>{
        const button=node.closest('button');
        if(!button||button.dataset.mpPolished)return;
        const forward=node.dataset.icon==='CaretRight';
        button.setAttribute('aria-label',forward?'Next month preview':'Previous month preview');
        button.setAttribute('title',forward?'Next month preview':'Previous month preview');
        button.addEventListener('click',()=>window.showCustomAlert?.('Calendar navigation in this portfolio demo does not create or modify an appointment.'));
        button.dataset.mpPolished='true';
      });
    }
    if(page==='dashboard')reportArt();
    if(page==='patients')patientEmpty();
    if(page==='billing')billingEmpty();
  }
  let attempts=0;
  function boot(){
    const nav=window.navigation;
    if(typeof nav?.showPage!=='function'){
      if(attempts++<40)setTimeout(boot,100);
      return;
    }
    if(nav.__mpPolishInstalled)return;
    nav.__mpPolishInstalled=true;
    const old=nav.showPage.bind(nav);
    nav.showPage=function(page,...args){
      const result=old(page,...args);
      enhancePage(page);
      return result;
    };
    const patientOld=nav.renderPatientsTable?.bind(nav);
    if(patientOld)nav.renderPatientsTable=function(...args){
      const result=patientOld(...args);patientEmpty();return result;
    };
    refreshIcons();
    enhancePage(nav.currentPage||'dashboard');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();