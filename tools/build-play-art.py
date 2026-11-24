#!/usr/bin/env python3
"""Build store-only artwork from Nulldelve's existing N mark and corridor palette.
Requires Pillow. Outputs stay outside runtime assets and the Android package.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import html
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/play-store'; OUT.mkdir(parents=True,exist_ok=True)
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
S=3
class Art:
 def __init__(self,w,h):
  self.w,self.h=w,h;self.image=Image.new('RGB',(w*S,h*S),'#101620');self.draw=ImageDraw.Draw(self.image);self.svg=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">']
 def polygon(self,points,color):
  self.draw.polygon([(round(x*S),round(y*S)) for x,y in points],fill=color);self.svg.append(f'<polygon points="{" ".join(f"{x},{y}" for x,y in points)}" fill="{color}"/>')
 def rect(self,x,y,w,h,color):self.polygon([(x,y),(x+w,y),(x+w,y+h),(x,y+h)],color)
 def line(self,points,color,width):
  p=[(round(x*S),round(y*S)) for x,y in points];self.draw.line(p,fill=color,width=round(width*S),joint='curve');self.svg.append(f'<polyline points="{" ".join(f"{x},{y}" for x,y in points)}" fill="none" stroke="{color}" stroke-width="{width}" stroke-linejoin="round"/>')
 def text(self,x,y,text,size,color):
  font=ImageFont.truetype(FONT,size*S);self.draw.text((round(x*S),round(y*S)),text,font=font,fill=color,anchor='lt');ascent=(font.getbbox(text)[3]-font.getbbox(text)[1])/S;self.svg.append(f'<text x="{x}" y="{y+ascent}" font-family="DejaVu Sans" font-weight="bold" font-size="{size}" fill="{color}">{html.escape(text)}</text>')
 def save(self,name,alpha=False):
  result=self.image.resize((self.w,self.h),Image.Resampling.LANCZOS)
  if alpha:result=result.convert('RGBA')
  result.save(OUT/(name+'.png'),optimize=True);(OUT/(name+'.svg')).write_text(''.join(self.svg)+'</svg>\n')
# The original favicon N, enlarged without baking rounded corners or drop shadows.
a=Art(512,512);a.rect(0,0,512,512,'#101620');a.rect(55,55,402,402,'#18212d');a.line([(136,380),(136,132),(376,380),(376,132)],'#efba62',53);a.save('icon-512',True)
# Perspective corridor geometry follows assets/facility-keyart.svg; this is key art,
# never represented as an actual gameplay screenshot.
a=Art(1024,500);a.rect(0,0,1024,500,'#101620')
a.polygon([(510,0),(776,166),(776,342),(510,500)],'#1b2531');a.polygon([(1024,0),(846,166),(846,342),(1024,500)],'#1b2531')
a.polygon([(510,500),(776,342),(846,342),(1024,500)],'#26313c')
for p in [[(542,500),(784,342)],[(678,500),(796,342)],[(920,500),(836,342)],[(620,444),(974,444)]]:a.line(p,'#384653',2)
a.rect(774,158,76,192,'#46515c');a.rect(780,164,64,180,'#080d14');a.rect(786,171,52,173,'#17212b');a.line([(812,173),(812,344)],'#36404a',2);a.line([(782,161),(842,161)],'#efba62',5)
for p in [[(563,71),(603,94),(603,415),(563,448)],[(680,123),(702,137),(702,374),(680,391)],[(944,75),(912,97),(912,417),(944,449)]]:a.polygon(p,'#2a3541')
for p in [[(551,70),(613,103)],[(676,122),(707,140)],[(905,105),(951,74)]]:a.line(p,'#aeb8c3',4)
a.rect(56,142,44,4,'#efba62');a.text(56,181,'NULLDELVE',64,'#f0f1ee');a.text(59,274,'EXPLORE. RESTORE. SURVIVE.',17,'#c4cbd4');a.text(59,309,'TACTICAL SURVIVAL',13,'#efba62');a.save('feature-1024x500')
for p in OUT.glob('*.png'):
 with Image.open(p) as image:print(p.relative_to(ROOT),image.size,image.mode,p.stat().st_size)
