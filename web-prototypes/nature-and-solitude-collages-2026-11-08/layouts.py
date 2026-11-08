"""Four separate desktop/mobile compositions from actual case sources."""

def piece(source, label, desktop, mobile, crop=None, mask=None, shape=None,
          display=None, fit=None, pixelated=False):
    return dict(source=source, label=label, desktop=desktop, mobile=mobile,
                crop=crop, mask=mask, shape=shape, display=display, fit=fit,
                pixelated=pixelated)

MASKS = {}

BOARDS = {
    'healing': [
        piece('reczz28HJJL2NjzO', '云映在水面上', [18, 126, 1164, 348, -1], [8, 105, 374, 116, -1]),
        piece('monet-2', '树的倒影', [20, 480, 553, 245, -3], [8, 225, 373, 119, -2], [18, 60, 968, 882]),
        piece('monet-4', '画沿着椭圆房间展开', [20, 760, 516, 318, 2], [8, 724, 220, 209, -3]),
        piece('monet-9', '柳树落入光的水面', [924, 295, 255, 781, 3], [261, 607, 117, 389, 3], [0, 0, 960, 1000]),
        piece('monet-6', '落日的暖色', [22, 626, 558, 200, 3], [8, 938, 373, 153, 2], [18, 55, 970, 880]),
        piece('monet-8', '坐下来看水的一间房', [700, 737, 477, 339, -2], [8, 530, 223, 218, -3]),
        piece('monet-5', '两棵柳树连接的长画幅', [534, 947, 640, 129, -2], [111, 1016, 265, 80, -2], [0, 0, 1000, 1000]),
        piece('monet-7', '绿影里的睡莲', [345, 307, 629, 589, -2], [52, 318, 295, 366, 0], [28, 30, 946, 935], shape='ellipse'),
    ],
    'cottagecore': [
        piece('peter08', '兔子一家住在树根下', [20, 127, 572, 418, -2], [8, 105, 230, 231, -3]),
        piece('reczz28HJJL2NkAi', '先吃一口，再担心追赶', [696, 126, 483, 461, 2], [227, 125, 151, 244, 3], shape='ellipse'),
        piece('stardew-1', '从旧农地重新开始', [20, 748, 700, 330, -2], [8, 848, 373, 247, -2], pixelated=True),
        piece('peter47', '菜园里的猫与鱼池', [20, 486, 382, 327, 3], [8, 370, 178, 221, 3]),
        piece('peter58', '小桌上的面包与牛奶', [756, 752, 422, 325, 2], [215, 716, 163, 177, 3]),
        piece('stardew-13', '夜晚也有小镇生活', [886, 543, 292, 224, -3], [8, 676, 203, 185, -3], pixelated=True),
        piece('peter28', '叶子庇护下的躲藏', [316, 325, 360, 359, -4], [168, 487, 210, 233, -3], shape='ellipse'),
        piece('peter39', '门边的花盆与工具', [756, 329, 262, 416, 4], [8, 535, 145, 174, 3]),
        piece('peter19', '钻过栅栏的蓝外套小兔', [425, 254, 393, 654, 0], [98, 234, 243, 368, 0], display='assets/cutouts/peter19.png', fit='contain'),
        piece('peter36', '菜园里的洒水壶', [102, 662, 350, 375, -7], [37, 741, 155, 206, -5], display='assets/cutouts/peter36.png', fit='contain'),
    ],
    'imprint': [
        piece('atkins-291498', '蓝晒图集的手写扉页', [20, 126, 402, 543, -2], [8, 107, 183, 281, -2], [80, 45, 850, 910]),
        piece('atkins-291575', '细长叶片怎样被光留下', [428, 128, 368, 509, 2], [194, 113, 185, 299, 2], [75, 45, 855, 912]),
        piece('atkins-291589', '细如羽毛的分枝', [799, 128, 381, 534, -2], [8, 731, 187, 360, -3], [80, 45, 850, 910]),
        piece('atkins-291559', '两簇小小的标本', [20, 664, 415, 414, 2], [8, 386, 164, 277, -2], [80, 45, 850, 910]),
        piece('atkins-291555', '感光纸上的一次摆放', [438, 661, 372, 417, -2], [211, 700, 168, 391, 2], [80, 45, 850, 910]),
        piece('atkins-291638', '卷起的海藻边缘', [813, 655, 368, 423, 2], [219, 398, 160, 298, 2], [80, 45, 850, 910]),
        piece('reczz28HJJL2Nmc7', '像一把扇子展开的海藻', [211, 355, 749, 480, -4], [30, 427, 330, 293, -4], [80, 250, 850, 460], shape='ellipse'),
        piece('atkins-291568', '叶片贴在纸面的一瞬', [611, 365, 470, 504, 5], [155, 614, 223, 330, 4], [130, 180, 760, 640], display='assets/cutouts/atkins-leaf.png', fit='contain'),
    ],
    'solitude': [
        piece('reczz28HJJL2NmAu', '一场只在房间里的旅行', [20, 131, 371, 641, -3], [8, 111, 215, 372, -3]),
        piece('unpacking-2', '长大后留下来的卧室', [426, 129, 751, 355, 2], [175, 116, 204, 230, 2], pixelated=True),
        piece('unpacking-4', '浴室也属于一个人的生活', [21, 800, 422, 277, 2], [8, 681, 190, 218, -3], pixelated=True),
        piece('unpacking-11', '第一间房和还没拆完的纸箱', [327, 328, 613, 512, -2], [81, 311, 298, 313, -2], fit='contain', pixelated=True),
        piece('unpacking-8', '把厨房一点点安顿好', [738, 500, 438, 571, 2], [147, 735, 234, 360, 2], fit='contain', pixelated=True),
        piece('unpacking-13', '搬家时随身带走的东西', [52, 644, 486, 245, -4], [8, 499, 254, 151, -3], fit='contain', pixelated=True),
        piece('unpacking-1', '尺子、剪刀和一本本子', [818, 382, 354, 135, 5], [192, 325, 187, 90, 3], fit='contain', pixelated=True),
        piece('unpacking-9', '新住处里的耳机与球鞋', [423, 835, 409, 242, 3], [8, 861, 228, 230, -3], fit='contain', pixelated=True),
        piece('unpacking-12', '每次搬家都留下的小鸭子', [376, 621, 337, 250, -4], [58, 610, 287, 194, 0], fit='contain', pixelated=True),
    ],
}
