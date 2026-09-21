export default function RankBadge({rank}){
 return <span className={`rank-medal rank-medal-${Math.min(rank,4)}`} aria-label={`#${rank}`}><span aria-hidden="true">{rank<=3?'♛':'◆'}</span><b>{rank}</b></span>;
}
