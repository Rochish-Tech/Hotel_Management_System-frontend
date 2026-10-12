const API = (window.HOTEL_API_BASE || 'http://localhost:8081').replace(/\/$/, '');
const view = document.querySelector('#view');
const nav = document.querySelector('#main-nav');
const accountMenu = document.querySelector('#account-menu');
let token = sessionStorage.getItem('hotel_token') || '';
let user = JSON.parse(sessionStorage.getItem('hotel_user') || 'null');
const route = () => (location.hash.slice(1) || 'home').replace(/^\//, '');
const esc = (s = '') => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n => '₹' + Number(n || 0).toLocaleString('en-IN', {maximumFractionDigits:2,minimumFractionDigits:0});
const dateNow = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const plusDays = (iso, days) => { const [y,m,d] = iso.split('-').map(Number); return new Date(Date.UTC(y,m-1,d+days)).toISOString().slice(0,10); };
const image = r => /^https?:\/\//i.test(r.imageUrl || '') ? r.imageUrl : 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=900&auto=format&fit=crop';
const notify = (message, error = false) => {const el = document.createElement('div');el.className='toast'+(error?' error':'');el.textContent=message;document.querySelector('#toast').append(el);setTimeout(()=>el.remove(),4500);};
const err = (e) => `<div class="form-error">${esc(e.message || e)}</div>`;
async function api(path, options={}) {
  const headers = {'Accept':'application/json', ...(options.body ? {'Content-Type':'application/json'}:{}),...(token ? {Authorization:'Bearer '+token}: {})};
  let response;
  try {response=await fetch(API+'/api'+path,{...options,headers:{...headers,...options.headers}});}
  catch {throw new Error(`Cannot connect to the backend at ${API}. Start RUN_BACKEND.bat, then refresh.`);}
  const text=await response.text();
  let data={};try {if(text) data=JSON.parse(text);} catch {}
  if(!response.ok) {
    if(response.status===401 && !path.startsWith('/auth/login')){clearAuth();}
    throw new Error(data.error || (response.status===403?'Access denied for this account.':`Request failed (${response.status})`));
  }
  return data;
}
function clearAuth() {token='';user=null;sessionStorage.removeItem('hotel_token');sessionStorage.removeItem('hotel_user');renderNav();}
function setAuth(data){token=data.token;user=data.user;sessionStorage.setItem('hotel_token',token);sessionStorage.setItem('hotel_user',JSON.stringify(user));renderNav();}
function renderNav(){
  nav.innerHTML='<a href="#home">Home</a><a href="#rooms">Rooms</a>'+(user?.role==='ADMIN'?'<a href="#admin">Admin</a>':user?.role==='CUSTOMER'?'<a href="#my-bookings">My Bookings</a>':'');
  accountMenu.innerHTML=user?`<span class="muted" style="font-size:12px">${esc(user.fullName.split(' ')[0])}</span><button class="btn small ghost" data-action="logout">Log out</button>`:'<a href="#login">Log in</a><a class="btn small" href="#register">Sign up</a>';
}
function pageTop(eyebrow,title,subtitle=''){return `<section class="inner-hero"><div class="container"><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${subtitle}</p></div></section>`;}
function roomCard(r){return `<article class="room-card"><div class="room-picture" style="background-image:url('${esc(image(r))}')"></div><div class="room-body"><div class="room-heading"><div><div class="eyebrow">Room ${esc(r.roomNumber)}</div><h3>${esc(r.roomType)}</h3></div><div class="price">${money(r.pricePerNight)}<small>/night</small></div></div><p class="room-desc">${esc(r.description || 'A relaxing stay with everything you need to feel at home.')}</p><div class="room-footer"><span class="badge ${r.available?'':'red'}">${r.available?'Available':'Unavailable'}</span>${r.available?`<a class="btn small" href="#booking/${r.id}">Book room →</a>`:'<button class="btn small" disabled>Unavailable</button>'}</div></div></article>`;}
function homeView(rooms){return `<section class="hero"><div class="hero-content"><div class="eyebrow">WELCOME TO GRAND HORIZON</div><h1>Where every stay becomes a story.</h1><p>Unwind in extraordinary comfort. Discover thoughtfully curated rooms and a seamless booking experience.</p><div class="hero-cta"><a class="btn gold" href="#rooms">Explore rooms →</a><a class="btn outline" href="#rooms">Why stay with us</a></div></div></section>
<section class="section"><div class="container"><div class="section-head"><div><div class="eyebrow">YOUR NEXT ESCAPE</div><h2>Stay somewhere special</h2></div><p class="muted">Choose the perfect space for business travel, special occasions, or a restful weekend.</p></div>${rooms.length?`<div class="room-grid">${rooms.slice(0,3).map(roomCard).join('')}</div>`:'<div class="empty-state">No rooms listed yet. An administrator can add rooms.</div>'}<div style="margin-top:28px"><a href="#rooms" class="btn outline">View all rooms →</a></div></div></section>
<section class="section features" id="home-features"><div class="container"><div class="eyebrow">THE HORIZON EXPERIENCE</div><h2>A better way to stay</h2><div class="feature-grid"><article class="feature"><div class="feature-num">01</div><h3>Comfort, elevated</h3><p>Beautifully appointed rooms with attention to every detail.</p></article><article class="feature"><div class="feature-num">02</div><h3>Book with confidence</h3><p>Clear nightly prices, date-based reservations, and an instant confirmation.</p></article><article class="feature"><div class="feature-num">03</div><h3>Hospitality first</h3><p>Thoughtful experiences designed around your stay.</p></article></div></div></section>
<section class="banner"><div class="eyebrow">YOUR STAY AWAITS</div><h2>Make room for memorable moments.</h2><a href="#rooms" class="btn gold">Find your room →</a></section>`;}
function roomsView(rooms){return `${pageTop('ACCOMMODATION','Find your perfect room','Every journey deserves a comfortable place to land.')}<section class="section"><div class="container"><div class="toolbar"><p class="muted">${rooms.length} rooms to explore</p><div class="filter-row"><select id="room-filter" aria-label="Filter rooms"><option value="all">All room types</option>${[...new Set(rooms.map(r=>r.roomType))].map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join('')}</select><select id="room-availability" aria-label="Room availability"><option value="all">All availability</option><option value="available">Available only</option></select></div></div><div class="room-grid" id="filtered-rooms">${rooms.map(roomCard).join('')}</div></div></section>`;}
function loginView(register=false){return `<div class="container"><div class="form-wrap"><div class="eyebrow">YOUR GRAND HORIZON ACCOUNT</div><h2>${register?'Create your account':'Welcome back'}</h2><p class="muted">${register?'Create a customer account to reserve rooms.':'Log in to access your reservations or admin dashboard.'}</p><div class="form-card"><form id="${register?'register-form':'login-form'}">${register?'<div class="form-group"><label for="name">Full name</label><input id="name" name="fullName" required maxlength="120" autocomplete="name"></div>':''}<div class="form-group"><label for="email">Email address</label><input id="email" type="email" name="email" required autocomplete="email"></div><div class="form-group"><label for="password">Password</label><input id="password" type="password" name="password" required ${register?'minlength="8" autocomplete="new-password"':'autocomplete="current-password"'}></div><div id="form-feedback"></div><button class="btn" type="submit" style="width:100%">${register?'Create account':'Log in'} →</button></form><p class="form-note">${register?'Already have an account? <a href="#login"><b>Log in</b></a>':'New here? <a href="#register"><b>Create an account</b></a>'}</p></div></div></div>`;}
function bookingView(room){if(user?.role==='ADMIN')return `<div class="container form-wrap"><div class="form-card"><h2>Customer bookings only</h2><p>Admin accounts manage reservations but do not make customer reservations.</p><a class="btn" href="#admin-bookings">Manage bookings</a></div></div>`;
if(!user){sessionStorage.setItem('return_route',route());return loginView(false);}
if(!room.available) return `<div class="container form-wrap"><div class="form-card"><h2>This room is unavailable</h2><a class="btn" href="#rooms">Back to rooms</a></div></div>`;
const today=dateNow(),start=plusDays(today,1),end=plusDays(today,2);
return `${pageTop('ROOM RESERVATION','Plan your stay',`Room ${esc(room.roomNumber)} · ${esc(room.roomType)}`)}<div class="container"><div class="form-wrap wide"><div class="form-card"><div class="room-heading"><div><div class="eyebrow">YOUR SELECTION</div><h3>${esc(room.roomType)} · Room ${esc(room.roomNumber)}</h3></div><div class="price">${money(room.pricePerNight)}<small>/night</small></div></div><hr class="subtle-line"><form id="booking-form" data-roomid="${room.id}"><div class="form-grid"><div class="form-group"><label for="checkIn">Check-in</label><input type="date" id="checkIn" name="checkIn" min="${today}" value="${start}" required></div><div class="form-group"><label for="checkOut">Check-out</label><input type="date" id="checkOut" name="checkOut" min="${plusDays(today,1)}" value="${end}" required></div></div><div class="form-group"><label for="guests">Guests (1–4)</label><input type="number" id="guests" name="guests" min="1" max="4" value="2" required></div><div class="panel" style="background:#f5f7f4"><div class="room-heading"><span>Estimated total</span><strong id="estimated-total">${money(room.pricePerNight)}</strong></div><div class="muted" style="font-size:12px" id="night-count">1 night · Price confirmed on booking</div></div><div id="form-feedback"></div><button class="btn" type="submit" style="width:100%">Confirm booking →</button></form></div></div></div>`;}
function statusBadge(status){const css={CONFIRMED:'warn',CHECKED_IN:'',CHECKED_OUT:'blue',CANCELLED:'red'};return `<span class="badge ${css[status]||''}">${esc(status?.replace('_',' ')||'')}</span>`;}
function dashboardTabs(current){return `<nav class="dashboard-links"><a class="${current==='admin'?'active':''}" href="#admin">Overview</a><a class="${current==='admin-rooms'?'active':''}" href="#admin-rooms">Manage Rooms</a><a class="${current==='admin-bookings'?'active':''}" href="#admin-bookings">Bookings</a><a class="${current==='admin-reports'?'active':''}" href="#admin-reports">Reports</a></nav>`;}
function stats(cards){return `<div class="stats-grid">${cards.map(([name,v])=>`<div class="stat-card"><span>${esc(name)}</span><strong>${esc(v)}</strong></div>`).join('')}</div>`;}
function table(cols,rows){return `<div class="panel table-wrap"><table class="data-table"><thead><tr>${cols.map(c=>`<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows||`<tr><td colspan="${cols.length}">No records yet.</td></tr>`}</tbody></table></div>`;}
function customerBookingsView(bookings){return `${pageTop('YOUR RESERVATIONS','My Bookings','View and manage your hotel reservations.')}<div class="container dashboard">${stats([['Total bookings',bookings.length],['Confirmed',bookings.filter(b=>b.status==='CONFIRMED').length],['Checked in',bookings.filter(b=>b.status==='CHECKED_IN').length],['Completed',bookings.filter(b=>b.status==='CHECKED_OUT').length]])}${table(['Booking','Room','Dates','Guests','Total','Status','Action'],bookings.map(b=>`<tr><td><b>#${b.id}</b></td><td>${esc(b.roomNumber)} · ${esc(b.roomType)}</td><td>${esc(b.checkIn)} — ${esc(b.checkOut)}</td><td>${b.guests}</td><td>${money(b.totalPrice)}</td><td>${statusBadge(b.status)}</td><td>${b.status==='CONFIRMED'&&b.checkIn>dateNow()?`<button class="btn small danger" data-action="cancel" data-id="${b.id}">Cancel</button>`:'—'}</td></tr>`).join(''))}<p class="muted">Cancellation is allowed only before the check-in date.</p></div>`;}
function adminOverview(report){return `${pageTop('ADMINISTRATION','Hotel Dashboard','Manage your property, guests, and reservations.') }<div class="container dashboard">${dashboardTabs('admin')}${stats([['Total rooms',report.totalRooms],['Occupied rooms',report.occupiedRooms],['Vacant rooms',report.vacantRooms],['Total bookings',report.totalBookings]])}<div class="panel"><h3>Property management</h3><p class="muted">Use the tools below to manage room listings, check guests in and out, and view hotel statistics.</p><div class="action-row"><a href="#admin-rooms" class="btn">Manage rooms</a><a href="#admin-bookings" class="btn outline">View bookings</a><a href="#admin-reports" class="btn outline">View reports</a></div></div></div>`;}
function adminRoomsView(rooms){return `${pageTop('ADMINISTRATION','Room Management','Edit your hotel inventory and nightly rates.')}<div class="container dashboard">${dashboardTabs('admin-rooms')}<div class="toolbar"><h3>Rooms (${rooms.length})</h3><a href="#admin-room/new" class="btn">+ Add room</a></div>${table(['Room','Type','Price / Night','Availability','Actions'],rooms.map(r=>`<tr><td><b>${esc(r.roomNumber)}</b></td><td>${esc(r.roomType)}</td><td>${money(r.pricePerNight)}</td><td>${r.available?'<span class="badge">Available</span>':'<span class="badge red">Unavailable</span>'}</td><td><div class="action-row"><a class="btn small outline" href="#admin-room/${r.id}">Edit</a><button class="btn small danger" data-action="delete-room" data-id="${r.id}">Delete</button></div></td></tr>`).join(''))}<p class="muted">Rooms with booking history cannot be deleted. Mark them unavailable instead.</p></div>`;}
function adminRoomForm(r){const fresh=!r;return `${pageTop('ADMINISTRATION',fresh?'Add a Room':'Edit Room',fresh?'Create a new hotel room listing.':'Update this room and its booking availability.')}<div class="container"><div class="form-wrap wide"><div class="form-card"><form id="room-form" data-roomid="${r?.id??''}"><div class="form-grid"><div class="form-group"><label>Room number</label><input name="roomNumber" value="${esc(r?.roomNumber??'')}" required></div><div class="form-group"><label>Room type</label><input name="roomType" value="${esc(r?.roomType??'')}" required placeholder="Deluxe / Executive / Family"></div></div><div class="form-grid"><div class="form-group"><label>Price per night (₹)</label><input type="number" step="0.01" min="0.01" name="pricePerNight" value="${esc(r?.pricePerNight??'')}" required></div><div class="form-group"><label>Room availability</label><select name="available"><option value="true" ${r?.available!==false?'selected':''}>Available for reservations</option><option value="false" ${r?.available===false?'selected':''}>Unavailable / Out of service</option></select></div></div><div class="form-group"><label>Description</label><textarea name="description">${esc(r?.description??'')}</textarea></div><div class="form-group"><label>Image URL (HTTPS)</label><input type="url" name="imageUrl" value="${esc(r?.imageUrl??'')}" placeholder="https://..."></div><div id="form-feedback"></div><div class="action-row"><button class="btn" type="submit">${fresh?'Add room':'Save changes'}</button><a class="btn ghost" href="#admin-rooms">Cancel</a></div></form></div></div></div>`;}
function adminBookingsView(bookings){return `${pageTop('ADMINISTRATION','Booking Management','Check guests in and out and review reservations.')}<div class="container dashboard">${dashboardTabs('admin-bookings')}${stats([['Total bookings',bookings.length],['Confirmed',bookings.filter(b=>b.status==='CONFIRMED').length],['Checked in',bookings.filter(b=>b.status==='CHECKED_IN').length],['Cancelled',bookings.filter(b=>b.status==='CANCELLED').length]])}${table(['Booking','Guest','Room','Dates','Total','Status','Actions'],bookings.map(b=>`<tr><td><b>#${b.id}</b></td><td>${esc(b.customerName)}<div class="muted">${esc(b.customerEmail)}</div></td><td>${esc(b.roomNumber)}</td><td>${esc(b.checkIn)} — ${esc(b.checkOut)}</td><td>${money(b.totalPrice)}</td><td>${statusBadge(b.status)}</td><td>${b.status==='CONFIRMED'&&dateNow()>=b.checkIn&&dateNow()<b.checkOut?`<button class="btn small" data-action="checkin" data-id="${b.id}">Check in</button>`:b.status==='CHECKED_IN'?`<button class="btn small" data-action="checkout" data-id="${b.id}">Check out</button>`:'—'}</td></tr>`).join(''))}</div>`;}
function adminReportView(r){return `${pageTop('ADMINISTRATION','Hotel Reports','Live snapshot of occupancy and booking activity.')}<div class="container dashboard">${dashboardTabs('admin-reports')}<h3>Room Occupancy</h3>${stats([['Total rooms',r.totalRooms],['Occupied rooms',r.occupiedRooms],['Vacant rooms',r.vacantRooms],['Out of service',r.outOfServiceRooms]])}<h3 style="margin-top:30px">Booking Analytics</h3>${stats([['All bookings',r.totalBookings],['Confirmed',r.confirmedBookings],['Checked in',r.checkedInBookings],['Checked out',r.checkedOutBookings],['Cancelled',r.cancelledBookings],['Non-cancelled booking value',money(r.reservationValue)]])}<div class="panel"><h3>Report information</h3><p class="muted">Occupancy counts check-in status, not future booking availability. Booking value is not collected revenue; online payments are not implemented.</p></div></div>`;}
function requiresRole(role){if(!user){sessionStorage.setItem('return_route',route());location.hash='#login';return false;}if(user.role!==role){view.innerHTML=`<div class="container form-wrap"><div class="panel"><h2>Access denied</h2><p>You need a ${role.toLowerCase()} account for this page.</p><a class="btn" href="#home">Go home</a></div></div>`;return false;}return true;}
let currentRouteId=0, roomCache=[];
async function render(){
  const id=++currentRouteId;renderNav(); const r=route();view.innerHTML='<div class="loading-screen">Preparing your stay…</div>';
  try {
    let html='';
    if(r==='home'){const rooms=await api('/rooms');html=homeView(rooms);}
    else if(r==='rooms'){roomCache=await api('/rooms');html=roomsView(roomCache);}
    else if(r==='login'){html=loginView();}
    else if(r==='register'){html=loginView(true);}
    else if(r.startsWith('booking/')){const room=await api('/rooms/'+encodeURIComponent(r.split('/')[1]));html=bookingView(room);}
    else if(r==='my-bookings'){if(!requiresRole('CUSTOMER'))return;html=customerBookingsView(await api('/bookings/my'));}
    else if(r==='admin'){if(!requiresRole('ADMIN'))return;html=adminOverview(await api('/admin/reports'));}
    else if(r==='admin-rooms'){if(!requiresRole('ADMIN'))return;html=adminRoomsView(await api('/admin/rooms'));}
    else if(r==='admin-bookings'){if(!requiresRole('ADMIN'))return;html=adminBookingsView(await api('/admin/bookings'));}
    else if(r==='admin-reports'){if(!requiresRole('ADMIN'))return;html=adminReportView(await api('/admin/reports'));}
    else if(r.startsWith('admin-room/')){if(!requiresRole('ADMIN'))return;html=adminRoomForm(r.endsWith('/new')?null:await api('/rooms/'+encodeURIComponent(r.split('/')[1])));}
    else html='<div class="container form-wrap"><h2>Page not found</h2><a class="btn" href="#home">Return home</a></div>';
    if(id!==currentRouteId)return;view.innerHTML=html;window.scrollTo(0,0);setupView();
  }catch(e){if(id!==currentRouteId)return;view.innerHTML=`<div class="container"><div class="connection-error"><h2>Couldn't load this page</h2><p>${esc(e.message)}</p><button class="btn" data-action="retry">Try again</button> <a class="btn outline" href="#home">Home</a></div></div>`;}
}
function setupView(){
  for(const elem of ['checkIn','checkOut']) document.getElementById(elem)?.addEventListener('change',()=>{
    const ci=document.getElementById('checkIn').value,co=document.getElementById('checkOut').value;
    document.getElementById('checkOut').min=plusDays(ci||dateNow(),1);
    const days=ci&&co?(Date.parse(co+'T00:00:00Z')-Date.parse(ci+'T00:00:00Z'))/86400000:0;
    const rate=Number(document.getElementById('booking-form').dataset.rate)||0;
    document.getElementById('estimated-total').textContent=days>0?money(rate*days):'Choose valid dates';
    document.getElementById('night-count').textContent=days>0?days+` night${days===1?'':'s'}`:'Check-out must follow check-in';
  });
  if(document.getElementById('booking-form')){
    api('/rooms/'+document.getElementById('booking-form').dataset.roomid).then(room=>{
       const form=document.getElementById('booking-form');if(form)form.dataset.rate=room.pricePerNight;
    }).catch(()=>{});
  }
  ['room-filter','room-availability'].forEach(key=>document.getElementById(key)?.addEventListener('change',()=>{
    const type=document.getElementById('room-filter').value,avail=document.getElementById('room-availability').value;
    const filtered=roomCache.filter(x=>(type==='all'||x.roomType===type)&&(avail==='all'||x.available));
    document.getElementById('filtered-rooms').innerHTML=filtered.length?filtered.map(roomCard).join(''):'<div class="empty-state">No rooms match these filters.</div>';
  }));
}
async function handleSubmit(ev){
  const form=ev.target; if(!['register-form','login-form','booking-form','room-form'].includes(form.id))return;
  ev.preventDefault(); const feedback=form.querySelector('#form-feedback');const btn=form.querySelector('button[type=submit]');
  const data=Object.fromEntries(new FormData(form).entries());btn.disabled=true;if(feedback)feedback.innerHTML='';
  try{
    if(form.id==='register-form'||form.id==='login-form'){
      const auth=await api('/auth/'+(form.id==='register-form'?'register':'login'),{method:'POST',body:JSON.stringify(data)});
      setAuth(auth);notify('Welcome, '+auth.user.fullName+'!');
      let next=sessionStorage.getItem('return_route');sessionStorage.removeItem('return_route');
      if(next && (auth.user.role==='CUSTOMER'||!next.startsWith('booking/'))) location.hash='#'+next;
      else location.hash=auth.user.role==='ADMIN'?'#admin':'#my-bookings';
      if(route()===next && next==='login')render();
    }else if(form.id==='booking-form'){
      if(data.checkOut<=data.checkIn)throw new Error('Check-out date must be after check-in.');
      await api('/bookings',{method:'POST',body:JSON.stringify({roomId:Number(form.dataset.roomid),checkIn:data.checkIn,checkOut:data.checkOut,guests:Number(data.guests)})});
      notify('Booking confirmed successfully!');location.hash='#my-bookings';
    }else if(form.id==='room-form'){
      const id=form.dataset.roomid;
      await api('/admin/rooms'+(id?'/'+id:''),{method:id?'PUT':'POST',body:JSON.stringify({...data,pricePerNight:Number(data.pricePerNight),available:data.available==='true'})});
      notify('Room saved!');location.hash='#admin-rooms';
    }
  }catch(e){if(feedback)feedback.innerHTML=err(e);else notify(e.message,true);}
  finally{btn.disabled=false;}
}
async function handleClick(ev){
  const btn=ev.target.closest('[data-action]');if(!btn)return;const action=btn.dataset.action,id=btn.dataset.id;
  if(action==='logout'){clearAuth();notify('Logged out');location.hash='#home';render();return;}
  if(action==='retry'){render();return;}
  const prompt={cancel:'Cancel this booking?',checkin:'Check in this guest?',checkout:'Check out this guest?','delete-room':'Delete this room? Rooms with booking history cannot be deleted.'}[action];
  if(prompt && !confirm(prompt))return;
  btn.disabled=true;
  try{
    const path=action==='cancel'?`/bookings/${id}/cancel`:action==='delete-room'?`/admin/rooms/${id}`:`/admin/bookings/${id}/${action}`;
    await api(path,{method:action==='delete-room'?'DELETE':'POST'});
    notify(action==='cancel'?'Booking cancelled.':action==='delete-room'?'Room deleted.':'Booking status updated.');render();
  }catch(e){notify(e.message,true);btn.disabled=false;}
}
document.addEventListener('submit',handleSubmit);document.addEventListener('click',handleClick);
window.addEventListener('hashchange',render);
if(token){api('/auth/me').then(me=>{user=me;sessionStorage.setItem('hotel_user',JSON.stringify(user));render();}).catch(()=>{clearAuth();render();});}
else render();
