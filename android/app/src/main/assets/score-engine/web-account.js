(function(){
 const request=__ACCOUNT_REQUEST__, state=window.__musicScoreAccount||(window.__musicScoreAccount={});
 if(state.result)return state.result;
 if(state.started)return {pending:true};
 state.started=true;
 const fail=error=>{state.result={error:String(error?.message||error)}};
 const sameOrigin=url=>{const parsed=new URL(url,location.href);if(parsed.origin!=='https://musescore.com')throw Error('Некорректный адрес аккаунта');return parsed.href};
 const checkBrowser=response=>{if(response.headers.get('cf-mitigated')==='challenge')throw Error('MuseScore запрашивает проверку браузера');};
 (async()=>{
  const response=await fetch('/api/user/me',{credentials:'same-origin',redirect:'error',headers:{'X-Requested-With':'XMLHttpRequest','Accept':'application/json'}});
  checkBrowser(response);
  if(response.status===401)throw Error('Войдите в аккаунт на сайте внутри приложения.');
  if(!response.ok)throw Error('Не удалось проверить вход на сайте (HTTP '+response.status+').');
  const envelope=await response.json();
  const user=['ok','success'].includes(envelope.result)?envelope.info:envelope.ok?envelope:null;
  if(!Number(user?.id)||Number(user.id)!==Number(request.userId))throw Error('Веб-сессия истекла или изменился аккаунт. Войдите повторно.');
  if(request.operation==='favorite'){
   const expected=request.score;
   const current=window.UGAPP?.store?.page?.data?.score;
   const normal=value=>String(value||'').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
   if(!current?.id){
    let target=null;
    const seen=new WeakSet();
    const find=(value,depth=0)=>{
     if(target||!value||typeof value!=='object'||depth>10||seen.has(value))return;seen.add(value);
     if(normal(value.title)===normal(expected.title)&&Number(value.user?.id||value.user_id)===Number(expected.authorId)&&typeof value.url==='string'&&/\/scores\/\d+/.test(value.url)){target=value.url;return}
     Object.values(value).forEach(child=>find(child,depth+1));
    };
    find(window.UGAPP?.store);
    if(!target)for(const a of document.querySelectorAll('a[href*="/scores/"]')){
     if(normal(a.textContent)!==normal(expected.title))continue;
     if(new URL(a.href).pathname.startsWith('/user/'+expected.authorId+'/')){target=a.href;break}
     let element=a;for(let i=0;element&&i<6;i++,element=element.parentElement)if(expected.authorName&&normal(element.textContent).includes(normal(expected.authorName))){target=a.href;break}
     if(target)break;
    }
    if(!target)throw Error('Не удалось определить партитуру на сайте.');
    location.replace(sameOrigin(target));return;
   }
   if(normal(current.title)!==normal(expected.title)||Number(current.user?.id||current.user_id)!==Number(expected.authorId))throw Error('Сайт вернул другую партитуру.');
   const csrf=document.querySelector('meta[name="csrf-token"]')?.content;
   if(!csrf)throw Error('Сайт не предоставил защитный токен формы.');
   const body=new URLSearchParams({id:String(current.id),_csrf:csrf});
   const action=request.enabled?'add':'remove';
   const result=await fetch('/score/collections/favorite/'+action,{method:'POST',credentials:'same-origin',redirect:'error',headers:{'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8','X-Requested-With':'XMLHttpRequest'},body:String(body)});
   checkBrowser(result);
   if(!result.ok)throw Error('Избранное: ошибка сайта HTTP '+result.status);
   const json=await result.json();
   if(!['ok','success'].includes(json.result)&&!json.ok)throw Error(json.info?.message||json.message||'Сайт отклонил изменение избранного.');
   state.result={ok:true};return;
  }
  if(!/\/favorites\/?$/.test(location.pathname)){
   const link=Array.from(document.querySelectorAll('a[href]')).find(a=>/\/favorites\/?$/.test(new URL(a.href).pathname)&&(new URL(a.href).pathname.includes('/'+user.id+'/')||a.getAttribute('data-testid')==='myFavoritesLink'));
   if(!link){
    const profile=Array.from(document.querySelectorAll('a[href]')).find(a=>a.getAttribute('data-testid')==='myProfileLink'||new URL(a.href).pathname==='/user/'+user.id);
    const target=profile?.href||(typeof user.profileUrl==='string'?user.profileUrl:null);
    if(target&&sameOrigin(target)!==location.href){location.replace(sameOrigin(target));return}
    throw Error('Не найдена ссылка на избранное аккаунта на сайте.');
   }
   location.replace(sameOrigin(link.href));return;
  }
  const data=window.UGAPP?.store?.page?.data;
  let items=null;
  const seen=new WeakSet();
  const walk=(value,depth=0)=>{
   if(!value||typeof value!=='object'||depth>6||seen.has(value)||items)return;seen.add(value);
   if(Array.isArray(value)&&value.length&&value.some(item=>(item?.score||item)?.title&&(item?.score||item)?.user?.id)){
    items=value.map(item=>item.score||item).filter(item=>item.id&&item.title&&item.user?.id);return;
   }
   // Restrict discovery to the profile's list, excluding suggestions and recommendations.
   for(const [key,child] of Object.entries(value))if(!/recommend|suggest|related/i.test(key))walk(child,depth+1);
  };
  walk(data);
  if(!items){
   const candidate=data?.scores||data?.items||data?.favorites;
   if(Array.isArray(candidate)&&candidate.length===0)items=[];
   else throw Error('Не удалось прочитать список избранного из ответа сайта.');
  }
  const next=document.querySelector('a[rel="next"], li.next:not(.disabled) a[href]');
  state.result={items,nextUrl:next?sameOrigin(next.href):null};
 })().catch(fail);
 return {pending:true};
})()
