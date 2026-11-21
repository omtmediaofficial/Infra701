(() => {
  const cfg = window.INFRA701_SUPABASE;
  const client = window.supabase?.createClient(cfg?.url || "", cfg?.anonKey || "");
  const $ = (s) => document.querySelector(s);
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
  let leads = [], content = [], selected = null;
  const statuses = ["new","contacted","qualified","converted","closed","spam"];
  const niceDate = (v) => new Date(v).toLocaleString([], {dateStyle:"medium",timeStyle:"short"});
  const msg = (el, text, error=false) => { el.textContent=text; el.classList.toggle("error",error); };
  if (!client) { msg($("#login-error"),"Supabase client configuration is missing.",true); return; }

  async function boot() {
    const {data:{session}} = await client.auth.getSession();
    if (session) await showApp(session);
    client.auth.onAuthStateChange(async (_event, session) => {
      if (session) await showApp(session);
      else { $("#app").hidden=true; $("#login").hidden=false; $("#session").textContent="Secure workspace"; }
    });
  }
  async function showApp(session) {
    const {data:user} = await client.auth.getUser();
    const {data:admin,error} = await client.from("site_admins").select("user_id").eq("user_id",user.user.id).maybeSingle();
    if (error || !admin) { await client.auth.signOut(); msg($("#login-error"),"This account is not enabled as a site administrator. Add its user ID to public.site_admins in Supabase.",true); return; }
    $("#login").hidden=true; $("#app").hidden=false; $("#session").textContent=user.user.email || "Administrator";
    await Promise.all([loadLeads(),loadContent()]);
  }
  $("#login-form").addEventListener("submit",async e=>{
    e.preventDefault(); const fd=new FormData(e.currentTarget);
    const {error}=await client.auth.signInWithPassword({email:fd.get("email"),password:fd.get("password")});
    if(error) msg($("#login-error"),error.message,true);
  });
  $("#logout").addEventListener("click",()=>client.auth.signOut());

  async function loadLeads() {
    const {data,error}=await client.from("lead_submissions").select("*").order("created_at",{ascending:false}).limit(1000);
    if(error){msg($("#lead-feedback"),error.message,true);return;}
    leads=data||[]; $("#lead-count").textContent=leads.length; fillServiceFilter(); renderLeads();
  }
  function fillServiceFilter(){
    const el=$("#service-filter"), prior=el.value, services=[...new Set(leads.map(x=>x.service).filter(Boolean))].sort();
    el.innerHTML='<option value="">All services</option>'+services.map(x=>'<option>'+esc(x)+'</option>').join(""); el.value=prior;
  }
  function renderLeads(){
    const q=$("#search").value.trim().toLowerCase(), st=$("#status-filter").value, sv=$("#service-filter").value, date=$("#date-filter").value;
    const cutoff=date==="today"?new Date(new Date().setHours(0,0,0,0)):date==="all"?null:new Date(Date.now()-Number(date)*86400000);
    const rows=leads.filter(l=>(!q||[l.full_name,l.email,l.phone].some(x=>String(x||"").toLowerCase().includes(q)))&&(!st||l.status===st)&&(!sv||l.service===sv)&&(!cutoff||new Date(l.created_at)>=cutoff));
    $("#lead-rows").innerHTML=rows.length?rows.map(l=>'<tr><td><div class="contact-name">'+esc(l.full_name)+'</div><div class="contact-meta">'+esc(l.email)+'</div><div class="contact-meta">'+esc(l.phone||"No phone")+'</div></td><td>'+esc(l.service)+'</td><td>'+esc(niceDate(l.created_at))+'</td><td><select class="status" data-status="'+l.id+'">'+statuses.map(s=>'<option value="'+s+'" '+(s===l.status?'selected':'')+'>'+s[0].toUpperCase()+s.slice(1)+'</option>').join("")+'</select></td><td><button class="detail-btn" data-detail="'+l.id+'">Open details ↗</button></td></tr>').join(""):'<tr><td colspan="5">No leads match these filters.</td></tr>';
    $("#lead-rows").querySelectorAll("[data-status]").forEach(el=>el.addEventListener("change",()=>updateLead(el.dataset.status,{status:el.value})));
    $("#lead-rows").querySelectorAll("[data-detail]").forEach(el=>el.addEventListener("click",()=>openLead(el.dataset.detail)));
  }
  async function updateLead(id,patch){
    const {error}=await client.from("lead_submissions").update(patch).eq("id",id);
    if(error){msg($("#lead-feedback"),error.message,true);return;}
    const lead=leads.find(x=>x.id===id); if(lead)Object.assign(lead,patch); msg($("#lead-feedback"),"Lead updated."); renderLeads();
  }
  function openLead(id){
    selected=leads.find(x=>x.id===id); if(!selected)return;
    $("#lead-detail").innerHTML='<div class="detail-field"><strong>'+esc(selected.full_name)+'</strong><p>'+esc(selected.email)+' · '+esc(selected.phone||"No phone")+'</p></div><div class="detail-field"><strong>Service / received</strong><p>'+esc(selected.service)+' · '+esc(niceDate(selected.created_at))+'</p></div><div class="detail-field"><strong>Message</strong><p>'+esc(selected.message)+'</p></div><div class="detail-field"><label for="lead-notes">Internal notes</label><textarea id="lead-notes" rows="4">'+esc(selected.admin_notes||"")+'</textarea></div><button id="save-notes" class="primary">Save notes</button> <a href="mailto:'+encodeURIComponent(selected.email)+'" class="quiet">Email lead ↗</a><p id="detail-feedback" class="feedback"></p>';
    $("#lead-dialog").showModal();
    $("#save-notes").addEventListener("click",async()=>{const {error}=await client.from("lead_submissions").update({admin_notes:$("#lead-notes").value}).eq("id",id);msg($("#detail-feedback"),error?error.message:"Notes saved.",!!error);if(!error)selected.admin_notes=$("#lead-notes").value;});
  }
  $("#lead-dialog").addEventListener("click",e=>{if(e.target===$("#lead-dialog"))$("#lead-dialog").close();});
  ["search","status-filter","service-filter","date-filter"].forEach(id=>$("#"+id).addEventListener(id==="search"?"input":"change",renderLeads));
  $("#export").addEventListener("click",()=>{
    const q=$("#search").value.trim().toLowerCase(),st=$("#status-filter").value,sv=$("#service-filter").value,date=$("#date-filter").value;
    const cutoff=date==="today"?new Date(new Date().setHours(0,0,0,0)):date==="all"?null:new Date(Date.now()-Number(date)*86400000);
    const rows=leads.filter(l=>(!q||[l.full_name,l.email,l.phone].some(x=>String(x||"").toLowerCase().includes(q)))&&(!st||l.status===st)&&(!sv||l.service===sv)&&(!cutoff||new Date(l.created_at)>=cutoff));
    const cols=["created_at","full_name","email","phone","service","preferred_contact","status","message","admin_notes"];
    const csv=[cols.join(","),...rows.map(r=>cols.map(k=>'"'+String(r[k]??"").replace(/"/g,'""')+'"').join(","))].join("\r\n");
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="infra701-leads.csv";a.click();URL.revokeObjectURL(a.href);
  });

  async function loadContent(){
    const {data,error}=await client.from("site_content").select("*").order("updated_at",{ascending:false});
    if(error){msg($("#content-feedback"),error.message,true);return;}
    content=data||[];renderContent();
  }
  function renderContent(){
    $("#content-list").innerHTML=content.map(c=>'<div class="content-item"><div><strong>'+esc(c.label)+'</strong><small>'+esc(c.content_key)+' · Updated '+esc(niceDate(c.updated_at))+'</small></div><button class="quiet" data-edit="'+c.id+'">Edit</button></div>').join("")||'<p>No content entries yet. Add your first entry above.</p>';
    $("#content-list").querySelectorAll("[data-edit]").forEach(b=>b.addEventListener("click",()=>{const c=content.find(x=>x.id===b.dataset.edit);if(!c)return;const f=$("#content-form");f.elements.id.value=c.id;f.elements.content_key.value=c.content_key;f.elements.label.value=c.label;f.elements.body.value=c.body;f.scrollIntoView({behavior:"smooth",block:"center"});}));
  }
  $("#content-form").addEventListener("submit",async e=>{
    e.preventDefault();const f=e.currentTarget,fd=new FormData(f),id=fd.get("id");
    const payload={content_key:fd.get("content_key").trim(),label:fd.get("label").trim(),body:fd.get("body"),updated_at:new Date().toISOString(),updated_by:(await client.auth.getUser()).data.user.id};
    const result=id?await client.from("site_content").update(payload).eq("id",id):await client.from("site_content").insert(payload);
    if(result.error){msg($("#content-feedback"),result.error.message,true);return;}
    f.reset();await loadContent();msg($("#content-feedback"),"Content saved.");
  });
  document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>{
    document.querySelectorAll("[data-tab]").forEach(x=>x.classList.toggle("active",x===b));
    $("#leads").hidden=b.dataset.tab!=="leads";$("#content").hidden=b.dataset.tab!=="content";
  }));
  boot();
})();