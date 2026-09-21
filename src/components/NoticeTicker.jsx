import {useLayoutEffect,useRef,useState} from 'react';
import './GameChrome.css';

// One readable copy, measured at the actual font/viewport size. Countdown
// updates do not remount the text or restart its animation every second.
export default function NoticeTicker({children}) {
 const viewport=useRef(null),copy=useRef(null),[distance,setDistance]=useState(0);
 useLayoutEffect(()=>{
  const measure=()=>setDistance(Math.max(0,copy.current.scrollWidth-viewport.current.clientWidth));
  const observer=new ResizeObserver(measure);observer.observe(viewport.current);observer.observe(copy.current);measure();
  return ()=>observer.disconnect();
 },[]);
 useLayoutEffect(()=>{setDistance(Math.max(0,copy.current.scrollWidth-viewport.current.clientWidth));},[children]);
 return <span ref={viewport} className={`notice-window ${distance>1?'is-scrolling':''}`} style={{'--notice-travel':`${-distance}px`,'--notice-duration':`${Math.max(8,distance/22+4)}s`}}>
  <span ref={copy} className="notice-copy">{children}</span>
 </span>;
}
