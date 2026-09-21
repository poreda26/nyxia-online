import portrait from '../assets/npc/captain-stylized.webp';
export default function CaptainPortrait({size=56}) {
 return <img src={portrait} alt="" width={size} height={size} style={{objectFit:'cover',borderRadius:'22%',border:'1px solid #ba9559',boxShadow:'0 3px 14px #0007',flexShrink:0}}/>;
}
