'use strict';
/* Progressive UX layer. Legacy synthetic analytics calculations remain untouched. */
(() => {
  const el=id=>document.getElementById(id);
  const pages={dashboard:'Practice overview',patients:'Patient directory',appointments:'Appointments',booking:'Booking preview',billing:'Billing & collections',settings:'Practice settings', 'help-docs':'Help & documentation'};
  const morePages=new Set(['booking','settings','help-docs']);
  let restoreFocus=null;
  let initAttempts=0;
  let navigationFromHistory=false;
  function pageFromHash(){
    const fragment=decodeURIComponent(window.location.hash.slice(1));
    return Object.prototype.hasOwnProperty.call(pages,fragment)?fragment:null;
  }
  function closeMore(restore=false){
    const panel=el('mp-mobile-more'),trigger=el('mp-more-btn');if(!panel||!trigger)return;
    const wasOpen=!panel.hidden;panel.hidden=true;trigger.setAttribute('aria-expanded','false');
    if(restore&&wasOpen)trigger.focus();
  }
  function announce(text){const node=el('mp-live');if(node)node.textContent=text;}
  function setNav(page){
    document.querySelectorAll('#mp-sidebar [onclick*="showPage"]').forEach(node=>{
      const match=node.getAttribute('onclick')?.includes("'"+page+"'");
      node.classList.toggle('active-page',!!match);
      if(match)node.setAttribute('aria-current','page');else node.removeAttribute('aria-current');
    });
    document.querySelectorAll('#mp-mobile-nav [data-page]').forEach(node=>{
      const match=node.dataset.page===page;node.classList.toggle('is-active',match);
      if(match)node.setAttribute('aria-current','page');else node.removeAttribute('aria-current');
    });
    const more=el('mp-more-btn');
    if(more){more.classList.toggle('is-active',morePages.has(page));if(morePages.has(page))more.setAttribute('aria-current','page');else more.removeAttribute('aria-current');}
  }
  function repairFormNames(){
    const names={patientSearchInput:'Search synthetic patients',patientStatusFilter:'Filter by patient status',patientInsuranceFilter:'Filter by insurance provider'};
    document.querySelectorAll('#main-content input,#main-content select,#main-content textarea').forEach(input=>{
      if(input.getAttribute('aria-label')||input.getAttribute('aria-labelledby')||input.labels?.length)return;
      const parent=input.parentElement;
      const nearby=parent?.querySelector('label')||input.previousElementSibling?.closest('label')||parent?.previousElementSibling;
      let label=(nearby?.tagName==='LABEL'?nearby.textContent:'')?.trim();
      if(!label)label=names[input.id]||input.placeholder||input.getAttribute('name');
      if(!label&&input.type==='date')label='Choose appointment date';
      if(!label&&input.type==='tel')label='Practice telephone number (demo)';
      if(!label&&input.type==='email')label='Practice contact email (demo)';
      if(!label)label=input.tagName==='SELECT'?'Select demo option':'Demo field';
      input.setAttribute('aria-label',label.replace(/\s+/g,' ').slice(0,120));
    });
    document.querySelectorAll('#settings-tabs a[onclick],#appointment-views-tabs a[onclick]').forEach(tab=>{
      tab.setAttribute('role','button');tab.tabIndex=0;
      const selected=tab.closest('#settings-tabs')?window.navigation?.currentSettingsTab:window.navigation?.currentAppointmentView;
      tab.setAttribute('aria-pressed',String(tab.getAttribute('onclick')?.includes("'"+selected+"'")===true));
      if(tab.dataset.keyboardBound)return;
      tab.dataset.keyboardBound='true';
      tab.addEventListener('keydown',event=>{
        if(event.key==='Enter'||event.key===' '){event.preventDefault();tab.click();}
      });
    });
  }
  function renderExtras(page){
    const main=el('main-content');if(!main)return;
    main.querySelectorAll(':scope > .mp-mobile-heading,:scope > .mp-demo-banner,:scope > .mp-hero,:scope > .mp-page-heading').forEach(x=>x.remove());
    const mobileHeader=document.createElement('div');mobileHeader.className='mp-mobile-heading';mobileHeader.innerHTML='<span class="mp-mobile-heading-mark" aria-hidden="true">✚</span><span><strong>MedOps <em>Practice Studio</em></strong><small>Illustrative healthcare operations</small></span>';
    main.prepend(mobileHeader);
    const banner=document.createElement('div');banner.className='mp-demo-banner';
    const strong=document.createElement('strong');strong.textContent='SAMPLE DATA';
    const msg=document.createElement('p');msg.textContent='Portfolio demonstration · Synthetic patients, schedules and finances. No real EHR, booking or payment connection.';
    const link=document.createElement('a');link.href='#mp-explainer';link.textContent='About this demo';
    banner.append(strong,msg,link);main.prepend(banner);
    if(page==='dashboard'){
      const hero=document.createElement('section');hero.className='mp-hero';hero.setAttribute('aria-labelledby','mp-hero-title');
      hero.innerHTML=`<div class="mp-hero-copy"><span class="mp-hero-eyebrow">INTERACTIVE PRACTICE OPERATIONS DEMO</span><h1 id="mp-hero-title">A clearer view of your practice.</h1><p>Explore patient operations, scheduling and billing through a professional workflow built with generated sample records. Nothing on this site connects to real clinical systems.</p></div>`
      banner.after(hero);
    } else {
      const bar=document.createElement('div');bar.className='mp-page-heading';
      const heading=document.createElement('div');heading.className='mp-page-heading-text';
      const kicker=document.createElement('span');kicker.className='mp-page-kicker';kicker.textContent='PRACTICE / '+pages[page].toUpperCase();
      const title=document.createElement('h1');title.className='mp-page-title';title.textContent=pages[page];
      heading.append(kicker,title);
      const note=document.createElement('span');note.className='mp-page-label';note.textContent='Illustrative workflow';bar.append(heading,note);banner.after(bar);
    }
    document.title=(page==='dashboard'?'Medical Practice Dashboard':pages[page]+' | Medical Practice Dashboard')+' — Interactive Demo';
    setNav(page);closeMore();repairFormNames();
    announce(pages[page]+' opened. All records on this site are synthetic.');
  }
  function selectPage(page){
    if(!window.navigation?.pages?.[page])return;
    window.navigation.showPage(page);
    el('main-content')?.focus({preventScroll:true});
    window.scrollTo({top:0,behavior:'instant'});
  }
  function showAccessibleNotice(message){
    restoreFocus=document.activeElement;
    const prior=el('mp-accessible-notice');if(prior)prior.remove();
    const overlay=document.createElement('div');overlay.id='mp-accessible-notice';overlay.className='mp-demo-modal';
    const dialog=document.createElement('div');dialog.className='mp-demo-dialog';dialog.setAttribute('role','alertdialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-labelledby','mp-dialog-heading');dialog.setAttribute('aria-describedby','mp-dialog-detail');
    const title=document.createElement('h2');title.id='mp-dialog-heading';title.textContent='Demo interaction';
    const desc=document.createElement('p');desc.id='mp-dialog-detail';
    const msg=String(message??'');
    const falseSuccess=/(successfully|sent|exported|processing payment|connected|initiating|deleted|confirmed|saved|loading full)/i.test(msg);
    desc.textContent=falseSuccess?'This is a frontend demonstration. No real patient records, appointments, payments, account changes, messages or integrations were changed.':msg;
    const actions=document.createElement('div');actions.className='mp-dialog-actions';
    const close=document.createElement('button');close.type='button';close.textContent='Got it';
    function dismiss(){overlay.remove();document.removeEventListener('keydown',onKeys);restoreFocus?.focus?.();}
    function onKeys(event){if(event.key==='Escape'){event.preventDefault();dismiss();}else if(event.key==='Tab'){event.preventDefault();close.focus();}}
    close.addEventListener('click',dismiss);overlay.addEventListener('mousedown',event=>{if(event.target===overlay)dismiss();});
    document.addEventListener('keydown',onKeys);actions.append(close);dialog.append(title,desc,actions);overlay.append(dialog);document.body.append(overlay);close.focus();
  }
  function enhance(){
    el('mp-year').textContent=String(new Date().getFullYear());
    const navigation=window.navigation;
    // window.navigation may initially be the browser Navigation API, not the demo instance.
    if(typeof navigation?.showPage!=='function'){if(initAttempts++<20)setTimeout(enhance,100);return;}
    const original=navigation.showPage.bind(navigation);
    const settingsOriginal=navigation.switchSettingsTab?.bind(navigation);
    if(settingsOriginal)navigation.switchSettingsTab=function(tab,...args){settingsOriginal(tab,...args);repairFormNames();};
    const viewsOriginal=navigation.switchView?.bind(navigation);
    if(viewsOriginal)navigation.switchView=function(view,...args){viewsOriginal(view,...args);repairFormNames();};
    navigation.showPage=function(page,...args){
      if(!navigation.pages[page])return;
      const previous=navigation.currentPage;
      original(page,...args);
      renderExtras(page);
      if(!navigationFromHistory&&previous!==page&&window.location.hash!=='#'+page){
        window.history.pushState({medopsPage:page},'','#'+page);
      }
    };
    window.addEventListener('popstate',()=>{
      const route=pageFromHash()||'dashboard';
      if(route===navigation.currentPage)return;
      navigationFromHistory=true;
      try{navigation.showPage(route);}finally{navigationFromHistory=false;}
      el('main-content')?.focus({preventScroll:true});
    });
    document.querySelectorAll('#mp-sidebar [onclick*="showPage"]').forEach(link=>{
      link.setAttribute('role','link');link.tabIndex=0;
      link.addEventListener('keydown',event=>{
        if(event.key==='Enter'||event.key===' '){event.preventDefault();link.click();}
      });
    });
    document.querySelectorAll('#mp-mobile-nav [data-page],#mp-mobile-more [data-page]').forEach(button=>{
      button.addEventListener('click',()=>selectPage(button.dataset.page));
    });
    const more=el('mp-more-btn'),panel=el('mp-mobile-more');
    more?.addEventListener('click',()=>{
      panel.hidden=!panel.hidden;more.setAttribute('aria-expanded',String(!panel.hidden));
      if(!panel.hidden)panel.querySelector('button')?.focus();
    });
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&panel&&!panel.hidden)closeMore(true);});
    document.addEventListener('pointerdown',event=>{
      if(panel&&!panel.hidden&&!panel.contains(event.target)&&!more.contains(event.target))closeMore();
    });
    window.showCustomAlert=showAccessibleNotice;
    window.showCustomConfirm=function(message){
      if(window.confirm(String(message)))showAccessibleNotice('Demo only: no actual practice record, user account or integration was changed.');
    };
    navigationFromHistory=true;
    try{navigation.showPage(pageFromHash()||'dashboard');}finally{navigationFromHistory=false;}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance);else enhance();
})();