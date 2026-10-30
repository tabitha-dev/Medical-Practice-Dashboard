/* MedOps: truthful, keyboard-accessible synthetic data visualizations. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const dateKey = date => [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
  const formatDate = key => new Date(key+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'});
  const dollars = value => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(value);
  const invoiceValue = item => Number(String(item.amount || 0).replace(/[^0-9.-]/g,'')) || 0;

  function weeklyCounts(appointments){
    const now=new Date();
    const monday=new Date(now.getFullYear(),now.getMonth(),now.getDate()-((now.getDay()+6)%7)-77);
    return Array.from({length:12},(_,i)=>{
      const start=new Date(monday); start.setDate(monday.getDate()+i*7);
      const end=new Date(start); end.setDate(start.getDate()+7);
      const first=dateKey(start),last=dateKey(end);
      return {label:formatDate(first),value:appointments.filter(a=>a.date>=first && a.date<last).length};
    });
  }
  function trendChart(series){
    const w=700, top=24, baseline=218, left=50, right=663;
    const maximum=Math.max(1,...series.map(d=>d.value));
    const interval=Math.max(1,Math.ceil(maximum/4));
    const ceiling=interval*4;
    const x=i=>left+(right-left)*i/Math.max(series.length-1,1);
    const y=n=>baseline-(n/ceiling)*(baseline-top);
    const marks=series.map((d,i)=>({x:x(i),y:y(d.value),...d}));
    const grids=Array.from({length:5},(_,i)=>{
      const val=i*interval,yy=y(val);
      return '<line x1="'+left+'" y1="'+yy+'" x2="'+right+'" y2="'+yy+'" stroke="#e1e8ec" stroke-width="1"/>'+
        '<text x="'+(left-11)+'" y="'+(yy+4)+'" text-anchor="end" font-size="12" fill="#52677a">'+val+'</text>';
    }).join('');
    const ticks=marks.map((d,i)=>i%2===0||i===marks.length-1?
      '<text x="'+d.x+'" y="244" text-anchor="middle" font-size="12" fill="#52677a">'+esc(d.label)+'</text>':'').join('');
    const path=marks.map((d,i)=>(i?'L':'M')+d.x.toFixed(1)+' '+d.y.toFixed(1)).join(' ');
    const circles=marks.map(d=>'<circle cx="'+d.x+'" cy="'+d.y+'" r="5" fill="#ffffff" stroke="#147a75" stroke-width="2.5"/>').join('');
    const rows=series.map(d=>'<tr><th scope="row">'+esc(d.label)+'</th><td>'+d.value+'</td></tr>').join('');
    const total=series.reduce((a,d)=>a+d.value,0);
    return '<div class="mp-chart-scroll" tabindex="0" role="region" aria-label="Scroll to inspect weekly appointment trend">'+
      '<svg class="mp-line-svg" viewBox="0 0 700 260" role="img" aria-labelledby="mp-trend-svg-title mp-trend-svg-desc">'+
        '<title id="mp-trend-svg-title">Weekly appointment counts across the previous twelve weeks</title>'+
        '<desc id="mp-trend-svg-desc">Counts calculated from the current synthetic appointment records. '+total+' visits are dated within this window. A complete weekly table follows the chart.</desc>'+
        grids+'<path d="'+path+'" fill="none" stroke="#147a75" stroke-width="3.25" stroke-linecap="round" stroke-linejoin="round"/>'+circles+ticks+
      '</svg></div>'+
      '<div class="mp-chart-foot"><span>Past 12 weeks · Sample appointments</span><strong>'+total+' visits in range</strong></div>'+
      '<details class="mp-chart-data"><summary>View weekly counts as a table</summary><div class="mp-chart-table-scroll"><table><caption>Appointment counts by week</caption><thead><tr><th scope="col">Week of</th><th scope="col">Appointments</th></tr></thead><tbody>'+rows+'</tbody></table></div></details>';
  }
  function mixChart(patients){
    const kinds=[{key:'Active',label:'Active',color:'#147a75'},{key:'Inactive',label:'Inactive',color:'#52677a'},{key:'New Patient',label:'New patient',color:'#c28b5a'}];
    const total=patients.length, radius=61,circumference=2*Math.PI*radius;
    let consumed=0;
    const rings=kinds.map(kind=>{
      const count=patients.filter(p=>p.status===kind.key).length;
      const len=total?count/total*circumference:0;
      const item='<circle cx="100" cy="100" r="'+radius+'" fill="none" stroke="'+kind.color+'" stroke-width="20" stroke-dasharray="'+len.toFixed(2)+' '+(circumference-len).toFixed(2)+'" stroke-dashoffset="'+(-consumed).toFixed(2)+'" transform="rotate(-90 100 100)"/>';
      consumed+=len;return item;
    }).join('');
    const labels=kinds.map(kind=>{
      const count=patients.filter(p=>p.status===kind.key).length,pct=total?Math.round(count/total*100):0;
      return '<li><span class="mp-dot" style="background:'+kind.color+'"></span><span>'+kind.label+'</span><strong>'+count+' <small>('+pct+'%)</small></strong></li>';
    }).join('');
    return '<div class="mp-mix-layout"><svg class="mp-donut-svg" viewBox="0 0 200 200" role="img" aria-labelledby="mp-mix-svg-title mp-mix-svg-desc">'+
      '<title id="mp-mix-svg-title">Synthetic patient status composition</title>'+
      '<desc id="mp-mix-svg-desc">A proportional ring chart, with exact counts and percentages listed beside it.</desc>'+
      '<circle cx="100" cy="100" r="'+radius+'" fill="none" stroke="#edf1f3" stroke-width="20"/>'+rings+
      '<text x="100" y="100" text-anchor="middle" font-size="32" fill="#1a3444" font-weight="800">'+total+'</text>'+
      '<text x="100" y="119" text-anchor="middle" font-size="11" fill="#52677a">patients</text></svg>'+
      '<ul class="mp-status-list">'+labels+'</ul></div><p class="mp-card-note">Distribution uses patient records, not appointment totals.</p>';
  }
  function visitList(appointments){
    const today=dateKey(new Date());
    const upcoming=appointments.filter(a=>a.date>=today && a.status==='Scheduled').sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time)).slice(0,4);
    if(!upcoming.length)return '<p class="mp-empty">No upcoming scheduled example visits in this dataset.</p>';
    return '<ol class="mp-visit-list">'+upcoming.map(apt=>
      '<li><span class="mp-visit-date">'+esc(formatDate(apt.date))+'</span><span class="mp-visit-description"><strong>'+esc(apt.patient)+'</strong><small>'+esc(apt.type)+' · '+esc(apt.doctor)+'</small></span><span class="mp-visit-time">'+esc(apt.time)+'</span></li>').join('')+'</ol>';
  }
  function metric(label,value,note){
    return '<div class="mp-metric" role="listitem"><p>'+esc(label)+'</p><strong>'+esc(value)+'</strong><small>'+esc(note)+'</small></div>';
  }
  function render(){
    const board=document.querySelector('#dashboard-page');
    const data=window.navigation?.mockData;
    if(!board||!data)return;
    const patients=data.patients||[],appointments=data.appointments||[],invoices=data.billing||[];
    const today=dateKey(new Date());
    const scheduled=appointments.filter(a=>a.date>=today&&a.status==='Scheduled').length;
    const outstanding=invoices.filter(i=>['Pending','Processing','Overdue'].includes(i.status)).reduce((total,i)=>total+invoiceValue(i),0);
    const totalBilled=invoices.reduce((sum,i)=>sum+invoiceValue(i),0);
    const countActive=patients.filter(p=>p.status==='Active').length;
    const trend=weeklyCounts(appointments);
    board.innerHTML=
      '<div class="mp-dashboard-top"><div><span class="mp-eyebrow">OPERATIONS SNAPSHOT</span><h2>Sample practice activity</h2><p>Every figure below is derived from this visit’s randomly generated records.</p></div>'+
      '<div class="mp-dashboard-actions"><button type="button" class="mp-secondary-action" onclick="location.reload()">Regenerate sample</button><button type="button" class="mp-primary-action" onclick="showPage(\'appointments\')">View appointments</button><button type="button" class="mp-secondary-action" onclick="window.uiManager?.showAdvancedAnalytics?.()">Analytics preview</button></div></div>'+
      '<div class="mp-metric-grid" role="list" aria-label="Sample practice key performance indicators">'+
      metric('Appointments in dataset',appointments.length,'All statuses · synthetic visits')+
      metric('Upcoming scheduled',scheduled,'Scheduled dates from today onward')+
      metric('Patient directory',patients.length,countActive+' active sample patients')+
      metric('Outstanding invoices',dollars(outstanding),'Of '+dollars(totalBilled)+' billed in sample')+
      '</div>'+
      '<div class="mp-viz-grid"><section class="mp-viz-card mp-wide-card" aria-labelledby="mp-appointments-title">'+
      '<div class="mp-card-head"><div><span class="mp-eyebrow">ACTIVITY</span><h3 id="mp-appointments-title">Appointment volume</h3></div><span class="mp-section-tag">Past 12 weeks</span></div>'+
      '<p class="mp-card-description">Weekly counts from generated appointment dates. Horizontal axis: week starting Monday. Vertical axis: visits.</p>'+
      trendChart(trend)+'</section>'+
      '<section class="mp-viz-card" aria-labelledby="mp-mix-title">'+
      '<div class="mp-card-head"><div><span class="mp-eyebrow">PATIENTS</span><h3 id="mp-mix-title">Patient status mix</h3></div></div>'+
      '<p class="mp-card-description">Share of the '+patients.length+' fictional patients in this session.</p>'+
      mixChart(patients)+'</section></div>'+
      '<section class="mp-viz-card mp-visits-card" aria-labelledby="mp-visits-title"><div class="mp-card-head"><div><span class="mp-eyebrow">SCHEDULING</span><h3 id="mp-visits-title">Upcoming sample visits</h3></div><button class="mp-text-action" type="button" onclick="showPage(\'appointments\')">See schedule</button></div>'+
      '<p class="mp-card-description">Scheduled examples only, sorted by visit date. No real appointments or patient data.</p>'+visitList(appointments)+'</section>';
    board.dataset.sampleAppointments=String(appointments.length);
    board.dataset.samplePatients=String(patients.length);
  }
  function renderBilling(){
    const main=document.querySelector('#main-content'),data=window.navigation?.mockData;
    if(!main||!data?.billing)return;
    const bills=data.billing;
    const val=i=>Number(String(i.amount||0).replace(/[^0-9.-]/g,''))||0;
    const subtotal=items=>items.reduce((sum,item)=>sum+val(item),0);
    const paid=bills.filter(i=>i.status==='Paid');
    const unpaid=bills.filter(i=>['Pending','Processing','Overdue'].includes(i.status));
    const processing=bills.filter(i=>i.status==='Processing');
    const overdue=bills.filter(i=>i.status==='Overdue');
    const cards=[
      ['Total Revenue','Paid invoice total',dollars(subtotal(paid)),paid.length+' paid sample invoices'],
      ['Outstanding','Outstanding',dollars(subtotal(unpaid)),unpaid.length+' unpaid or processing invoices'],
      ['Insurance Claims','Processing invoices',String(processing.length),'Sample invoices in processing'],
      ['Overdue','Overdue',dollars(subtotal(overdue)),overdue.length+' overdue sample invoices']
    ];
    main.querySelectorAll('.bg-gradient-to-br h3').forEach(h=>{
      const item=cards.find(a=>a[0]===h.textContent.trim());
      if(!item)return;
      const card=h.closest('.bg-gradient-to-br');
      const metric=card?.querySelector('.text-3xl');
      const note=metric?.nextElementSibling;
      h.textContent=item[1];
      if(metric)metric.textContent=item[2];
      if(note)note.textContent=item[3];
    });
    const search=main.querySelector('input[placeholder="Search invoices..."]');
    const controls=search?.parentElement;
    const status=controls?.querySelector('select');
    const date=controls?.querySelector('input[type=date]');
    const rows=[...main.querySelectorAll('table tbody tr')];
    if(!search||!status||!date||!rows.length)return;
    search.setAttribute('aria-label','Search synthetic invoices by patient, service or invoice ID');
    status.setAttribute('aria-label','Filter synthetic invoices by status');
    date.setAttribute('aria-label','Filter synthetic invoices by date');
    const result=document.createElement('p');
    result.className='mp-billing-result-count';
    result.setAttribute('role','status');
    controls.after(result);
    const filter=()=>{
      const query=search.value.trim().toLowerCase();
      const state=status.value;
      const targetDate=date.value;
      let shown=0;
      rows.forEach((row,i)=>{
        const bill=bills[i];
        if(!bill)return;
        const id='inv-'+String(bill.id).padStart(4,'0');
        const haystack=[id,bill.patient,bill.service,bill.insurance].join(' ').toLowerCase();
        const visible=(!query||haystack.includes(query))&&(state==='All Status'||bill.status===state)&&(!targetDate||bill.date===targetDate);
        row.hidden=!visible;
        if(visible)shown++;
      });
      result.textContent=shown+' of '+bills.length+' synthetic invoices shown';
    };
    for(const field of [search,status,date])field.addEventListener(field===search?'input':'change',filter);
    filter();
  }

  function boot(){
    const nav=window.navigation;
    if(typeof nav?.showPage!=='function'){setTimeout(boot,100);return;}
    if(nav.__mpVisualsInstalled)return;
    nav.__mpVisualsInstalled=true;
    const oldShowPage=nav.showPage.bind(nav);
    nav.showPage=function(page,...args){const result=oldShowPage(page,...args);if(page==='dashboard')render();if(page==='billing')renderBilling();return result;};
    if(nav.currentPage==='dashboard')render();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();