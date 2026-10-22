"""P3 彩窗 v1 —— 结构骨架几何（只画窗框/尖拱/窗花/题签框；不画装饰美术）。
按哥特窗圆规作图：两心尖拱（圆心在起拱线上），葉形(foil)为圆内相切相交的小圆。"""
import math
def f(v): return f"{v:.2f}"

def arch(x0, x1, ys, k, d=0.0):
    """两心尖拱，内偏 d。r = k*半跨，两圆心在起拱线上。返回 (path, 拱顶y)。"""
    hw=(x1-x0)/2; r=k*hw; xm=(x0+x1)/2; ri=r-d
    ay=ys-math.sqrt(ri*ri-(r-hw)**2)
    return f"M{f(x0+d)},{f(ys)} A{f(ri)},{f(ri)} 0 0 1 {f(xm)},{f(ay)} A{f(ri)},{f(ri)} 0 0 1 {f(x1-d)},{f(ys)}", ay

def arch_y(x0,x1,ys,k,d,x):
    hw=(x1-x0)/2; r=k*hw; ri=r-d; xm=(x0+x1)/2
    cx = x0+r if x<=xm else x1-r
    return ys-math.sqrt(max(0,ri*ri-(x-cx)**2))

def arch_pt(x0,x1,ys,k,d,side,frac):
    hw=(x1-x0)/2; r=k*hw; ri=r-d
    cx = x0+r if side<0 else x1-r
    xm=(x0+x1)/2; ay=ys-math.sqrt(ri*ri-(r-hw)**2)
    a0 = math.pi if side<0 else 0.0
    a1 = math.atan2(ys-ay, xm-cx)
    a = a0+(a1-a0)*frac
    return cx+ri*math.cos(a), ys-ri*math.sin(a), (cx,ys)

def cusped(x0,x1,ys,k,d,frac=0.5,depth=0.17):
    """三叶尖拱：两侧叶 + 顶部尖叶，尖角(cusp)向内。返回 (开放路径, 左起点, 右终点)。"""
    hw=(x1-x0)/2; L=(x0+d,ys); R=(x1-d,ys); pts=[]
    for side in (-1,1):
        x,y,(cx,cy)=arch_pt(x0,x1,ys,k,d,side,frac)
        vx,vy=cx-x,cy-y; n=math.hypot(vx,vy); dd=depth*hw
        pts.append((x+vx/n*dd,y+vy/n*dd))
    C1,C2=pts; xm=(x0+x1)/2; _,ay=arch(x0,x1,ys,k,d)
    A=(xm,ay+depth*hw*0.45)
    def lobe(P,Q,b):
        c=math.hypot(Q[0]-P[0],Q[1]-P[1]); rho=c*b
        return f" A{f(rho)},{f(rho)} 0 0 1 {f(Q[0])},{f(Q[1])}"
    return f"M{f(L[0])},{f(L[1])}"+lobe(L,C1,.62)+lobe(C1,A,.85)+lobe(A,C2,.85)+lobe(C2,R,.62), L, R

def foil(cx,cy,R,n=4,rot=0.0,a=0.42,rho=0.5):
    A=a*R; P=rho*R; step=2*math.pi/n; half=step/2
    t=(2*A*math.cos(half)+math.sqrt(4*A*A*math.cos(half)**2-4*(A*A-P*P)))/2
    cs=[(cx+t*math.cos(rot+half+i*step), cy+t*math.sin(rot+half+i*step)) for i in range(n)]
    s=f"M{f(cs[-1][0])},{f(cs[-1][1])}"
    for c in cs: s+=f" A{f(P)},{f(P)} 0 0 1 {f(c[0])},{f(c[1])}"
    return s+"Z"

def circle(cx,cy,r):
    return f"M{f(cx-r)},{f(cy)} A{f(r)},{f(r)} 0 1 1 {f(cx+r)},{f(cy)} A{f(r)},{f(r)} 0 1 1 {f(cx-r)},{f(cy)}"

def cartouche(x0,y0,x1,y1,n=7):
    return (f"M{f(x0+n)},{f(y0)} H{f(x1-n)} A{n},{n} 0 0 0 {f(x1)},{f(y0+n)} V{f(y1-n)} A{n},{n} 0 0 0 {f(x1-n)},{f(y1)}"
            f" H{f(x0+n)} A{n},{n} 0 0 0 {f(x0)},{f(y1-n)} V{f(y0+n)} A{n},{n} 0 0 0 {f(x0+n)},{f(y0)}Z")
