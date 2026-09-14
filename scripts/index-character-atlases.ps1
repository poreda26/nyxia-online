param([string]$AssetDirectory='src/assets/characters/weapons',[string]$Output='src/data/characterAtlasFrames.json',[string]$Filter='*.png')
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing.Common,System.Drawing.Primitives,System.Private.Windows.GdiPlus,System.Private.Windows.Core,System.Collections -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
using System.Text;
public class SpriteRegion {
 public int Count,MinX,MinY,MaxX,MaxY; public double CenterX,CenterY; public string Mask;
}
public static class SpriteAtlasIndex {
 public static SpriteRegion[] Read(string path) {
  using(var bitmap=new Bitmap(path)) {
   int w=bitmap.Width,h=bitmap.Height,n=w*h;
   var rect=new Rectangle(0,0,w,h);
   var data=bitmap.LockBits(rect,ImageLockMode.ReadOnly,PixelFormat.Format32bppArgb);
   var pixels=new byte[Math.Abs(data.Stride)*h];Marshal.Copy(data.Scan0,pixels,0,pixels.Length);bitmap.UnlockBits(data);
   bool opaque=pixels[3]>0;
   int backgroundFloor=255;
   for(int y=0;y<32;y++)for(int x=0;x<12;x++){int p=(y*w+x)*4;int b=pixels[p],g=pixels[p+1],r=pixels[p+2];if(Math.Max(r,Math.Max(g,b))-Math.Min(r,Math.Min(g,b))<16)backgroundFloor=Math.Min(backgroundFloor,Math.Min(r,Math.Min(g,b)));}
   backgroundFloor=Math.Max(75,backgroundFloor-12);
   var labels=new int[n];var queue=new int[n];var regions=new List<SpriteRegion>();int label=0;
   // Read-only clipping metadata: source PNG pixels are never rewritten.
   // Some generated sheets contain a pale checker backdrop instead of alpha.
   var backdrop=new bool[n];var visited=new bool[n];
   for(int p=0;p<n;p++){int b=pixels[p*4],g=pixels[p*4+1],r=pixels[p*4+2];backdrop[p]=pixels[p*4+3]<48||(opaque&&Math.Min(r,Math.Min(g,b))>=backgroundFloor&&Math.Max(r,Math.Max(g,b))-Math.Min(r,Math.Min(g,b))<16);}
   for(int start=0;start<n;start++){
    if(!backdrop[start]||visited[start])continue;
    int head=0,tail=1;queue[0]=start;visited[start]=true;
    while(head<tail){int p=queue[head++],x=p%w,y=p/w;for(int dy=-1;dy<=1;dy++)for(int dx=-1;dx<=1;dx++){int nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=w||ny>=h)continue;int next=ny*w+nx;if(backdrop[next]&&!visited[next]){visited[next]=true;queue[tail++]=next;}}}
    if(tail>100||!opaque)for(int i=0;i<tail;i++)labels[queue[i]]=-1;
   }
   for(int start=0;start<n;start++) {
    if(labels[start]!=0)continue;
    label++;int head=0,tail=1;queue[0]=start;labels[start]=label;
    int minX=w,maxX=0,minY=h,maxY=0;long sumX=0,sumY=0;
    while(head<tail) {
     int p=queue[head++],x=p%w,y=p/w;minX=Math.Min(minX,x);maxX=Math.Max(maxX,x);minY=Math.Min(minY,y);maxY=Math.Max(maxY,y);sumX+=x;sumY+=y;
     for(int dy=-1;dy<=1;dy++)for(int dx=-1;dx<=1;dx++) {
      int nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=w||ny>=h)continue;int next=ny*w+nx;
      if(path.EndsWith("mage-7.png") && y/(h/2)!=ny/(h/2))continue;
      if((path.EndsWith("warrior-raptor-v2.png")||path.EndsWith("warrior-raptor-v3.png")) && (x<w*0.383)!=(nx<w*0.383))continue;
      if(labels[next]==0){labels[next]=label;queue[tail++]=next;}
     }
    }
    if(tail<2000)continue;
    var pathData=new StringBuilder();
    for(int y=minY;y<=maxY;y++)for(int x=minX;x<=maxX;x++)if(labels[y*w+x]==label){int first=x;while(x+1<=maxX&&labels[y*w+x+1]==label)x++;int width=x-first+1;pathData.Append("M").Append(first).Append(' ').Append(y).Append('h').Append(width).Append("v1h-").Append(width).Append('z');}
    regions.Add(new SpriteRegion{Count=tail,MinX=minX,MinY=minY,MaxX=maxX,MaxY=maxY,CenterX=(double)sumX/tail,CenterY=(double)sumY/tail,Mask=pathData.ToString()});
   }
   regions.Sort((a,b)=>b.Count.CompareTo(a.Count));if(regions.Count<6)throw new Exception("Expected six disconnected figures in "+path+", got "+regions.Count);
   return regions.GetRange(0,6).ToArray();
  }
 }
}
'@
$atlasResult=[ordered]@{}
if($Filter -ne '*.png' -and (Test-Path -LiteralPath $Output)){$existing=Get-Content -Raw -LiteralPath $Output | ConvertFrom-Json -AsHashtable;foreach($key in $existing.Keys){$atlasResult[$key]=$existing[$key]}}
foreach($atlasFile in Get-ChildItem -LiteralPath $AssetDirectory -Filter $Filter) {
 $regions=@([SpriteAtlasIndex]::Read($atlasFile.FullName) | Sort-Object CenterY)
 $bitmap=[System.Drawing.Bitmap]::new($atlasFile.FullName);$w=$bitmap.Width;$h=$bitmap.Height;$bitmap.Dispose()
 $frames=@()
 for($row=0;$row -lt 2;$row++){
  $rowRegions=@($regions[($row*3)..($row*3+2)] | Sort-Object CenterX)
  for($col=0;$col -lt 3;$col++){
   $r=$rowRegions[$col]
   # The final archer sheet has a taller body render; keep its feet and body scale consistent.
   $bodyScale=if($atlasFile.BaseName -eq 'rogue-6'){1.12}else{1}
   $viewWidth=$w/3*1.44*$bodyScale;$viewHeight=$h/2*$bodyScale
   $frames+=@{mask=$r.Mask;rect=@([math]::Round(($col+.5)*$w/3-$viewWidth/2,2),[math]::Round(($row+1)*$h/2-$viewHeight,2),[math]::Round($viewWidth,2),[math]::Round($viewHeight,2));bounds=@($r.MinX,$r.MinY,$r.MaxX,$r.MaxY);pixels=$r.Count}
  }
 }
 $atlasResult[$atlasFile.BaseName]=@{size=@($w,$h);frames=$frames}
 Write-Output ($atlasFile.BaseName+': six figures indexed')
}
$atlasResult | ConvertTo-Json -Depth 8 -Compress | Set-Content -LiteralPath $Output -Encoding utf8
