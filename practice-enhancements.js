'use strict';
/* Progressive UX layer. Legacy synthetic analytics calculations remain untouched. */
(() => {
  const el=id=>document.getElementById(id);
  const pages={dashboard:'Practice overview',patients:'Patient directory',appointments:'Appointments',booking:'Booking preview',billing:'Billing & collections',settings:'Practice settings', 'help-docs':'Help & documentation'};
  const morePages=new Set(['booking','settings','help-docs']);
  let restoreFocus=null;
  let initAttempts=0;
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
      hero.innerHTML=`<div class="mp-hero-copy"><span class="mp-hero-eyebrow">A CLEARER VIEW OF PRACTICE OPERATIONS</span><h1 id="mp-hero-title">Everything that matters, <em>in one view.</em></h1><p>Explore a thoughtfully designed operations dashboard for patient flow, scheduling and billing—with realistic interaction patterns and synthetic examples.</p><div class="mp-hero-pills"><span>✚ Patient operations</span><span>▦ Scheduling</span><span>◴ Analytics</span></div></div><div class="mp-hero-art" aria-hidden="true"><span class="mp-hero-glow"></span><span class="mp-hero-panel"></span><span class="mp-hero-circle one">✚</span><span class="mp-hero-circle two">▥</span><span class="mp-hero-tag">↗ Practice insights</span></div>`;
      banner.after(hero);
      const title=main.querySelector('#dashboard-page .text-\\[32px\\]');
      // Preserve the legacy dashboard KPI header and actions below the hero.
    } else {
      const bar=document.createElement('div');bar.className='mp-page-heading';
      const label=document.createElement('strong');label.textContent='PRACTICE / '+pages[page].toUpperCase();
      const note=document.createElement('span');note.className='mp-page-label';note.textContent='Illustrative workflow';bar.append(label,note);banner.after(bar);
    }
    document.title=(page==='dashboard'?'Medical Practice Dashboard':pages[page]+' | Medical Practice Dashboard')+' — Interactive Demo';
    setNav(page);closeMore();
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
    navigation.showPage=function(page,...args){original(page,...args);if(navigation.pages[page])renderExtras(page);};
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
    navigation.showPage('dashboard');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance);else enhance();
})();