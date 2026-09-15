import {useLayoutEffect,useRef,useState} from 'react';
import {styles} from '../styles';

// Long menus advance by screen-sized pages while the top bar and nav stay put.
export default function ScreenPanel({children,screen}) {
 const viewport=useRef(null),content=useRef(null);
 const [page,setPage]=useState(0),[pages,setPages]=useState(1);
 useLayoutEffect(()=>{
  const box=viewport.current,body=content.current;
  const measure=()=>{
   const fullHeight=box.parentElement.clientHeight;
   const count=body.scrollHeight<=fullHeight+1?1:Math.max(2,Math.ceil(Math.max(0,body.scrollHeight-40)/Math.max(1,box.clientHeight-40)));
   setPages(count);setPage(value=>Math.min(value,count-1));
  };
  const observer=new ResizeObserver(measure);observer.observe(box);observer.observe(body);
  measure();return ()=>observer.disconnect();
 },[screen]);
 useLayoutEffect(()=>{setPage(0)},[screen]);
 useLayoutEffect(()=>{viewport.current.scrollTop=page*Math.max(1,viewport.current.clientHeight-40)},[page,pages]);
 return <div style={{flex:1,minHeight:0,display:'flex',flexDirection:'column'}}>
  <div ref={viewport} data-screen={screen} style={{...styles.tabContent,minHeight:0,overflow:'hidden',containerType:'size'}}>
   <div ref={content}>{children}</div>
  </div>
  {pages>1&&<nav aria-label="Sayfa geçişi" style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'4px 12px',flexShrink:0}}>
   <button style={styles.tinyBtn} disabled={page===0} onClick={()=>setPage(page-1)}>Önceki</button>
   <span aria-live="polite" style={{fontSize:11}}>{page+1} / {pages}</span>
   <button style={styles.tinyBtn} disabled={page>=pages-1} onClick={()=>setPage(page+1)}>Sonraki</button>
  </nav>}
 </div>;
}
