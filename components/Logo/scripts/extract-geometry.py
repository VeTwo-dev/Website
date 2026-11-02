import numpy as np, json
from PIL import Image
from skimage.morphology import skeletonize, disk, binary_opening, binary_dilation, remove_small_objects
from skimage.measure import label, regionprops
from scipy import ndimage as ndi
m=np.array(Image.open('dark.png').convert('L'))>128
dt=ndi.distance_transform_edt(m)
# remove thick regions (foot block, mane, horn leaf): opening with big disk
thick=binary_dilation(binary_opening(m,disk(24)),disk(4))
m2=m&~thick
dt2=ndi.distance_transform_edt(m2)
# pads: blobs where opening with r=7 survives
padmask=binary_opening(m2,disk(8))
lab=label(padmask)
pads=[]
for r in regionprops(lab):
    if 10<=r.equivalent_diameter/2<=22 and r.solidity>0.8:
        cy,cx=r.centroid; pads.append((cx*2,cy*2,r.equivalent_diameter))
print('pads',len(pads))
thin=m2&~binary_dilation(padmask,disk(2))
thin=remove_small_objects(thin,30)
sk=skeletonize(thin)
print('skeleton px',sk.sum())
# graph trace
H,W=sk.shape
nb=lambda y,x:[(y+dy,x+dx) for dy in(-1,0,1) for dx in(-1,0,1) if (dy or dx) and 0<=y+dy<H and 0<=x+dx<W and sk[y+dy,x+dx]]
deg=ndi.convolve(sk.astype(int),np.ones((3,3)),mode='constant')-1
deg=deg*sk
nodes=set(zip(*np.where((deg!=2)&sk)))
visited=set();segs=[]
def walk(start,nxt):
    path=[start,nxt];prev=start;cur=nxt
    while cur not in nodes:
        n=[p for p in nb(*cur) if p!=prev and p not in path[-3:]]
        if not n: break
        prev,cur=cur,n[0];path.append(cur)
    return path
seen_edges=set()
for n in nodes:
    for q in nb(*n):
        if (n,q) in seen_edges: continue
        p=walk(n,q)
        seen_edges.add((n,q));seen_edges.add((p[-1],p[-2]))
        segs.append(p)
# loops with no nodes
def rdp(pts,eps):
    pts=np.array(pts,float)
    if len(pts)<3: return pts
    a,b=pts[0],pts[-1];ab=b-a;L=np.hypot(*ab)
    d=np.abs(np.cross(ab,pts-a))/L if L else np.hypot(*(pts-a).T)
    i=d.argmax()
    if d[i]>eps: return np.vstack([rdp(pts[:i+1],eps)[:-1],rdp(pts[i:],eps)])
    return np.vstack([a,b])
out=[]
for p in segs:
    if len(p)<12: continue
    pts=[(x*2,y*2) for y,x in p]
    s=rdp(pts,5.0)
    out.append([[round(float(x)),round(float(y))] for x,y in s])
print('segments',len(out),'points',sum(len(o) for o in out))
json.dump({'pads':[[round(x),round(y),round(d*2/2)] for x,y,d in pads],'traces':out},open('raw.json','w'))
# preview
import cairosvg
svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048" width="1024" height="1024"><rect width="2048" height="2048" fill="#0A0F0D"/>'
for o in out: svg+='<polyline fill="none" stroke="#6EE7B7" stroke-width="5" points="'+' '.join(f'{x},{y}' for x,y in o)+'"/>'
for x,y,d in pads: svg+=f'<circle cx="{x}" cy="{y}" r="{d/2}" fill="none" stroke="#10B981" stroke-width="5"/>'
svg+='</svg>'
cairosvg.svg2png(bytestring=svg.encode(),write_to='prev.png')
