/**
 * 前端练习集的内容清单
 *
 * 路径都是相对 public/lab/frontend/ 的。
 * 页面渲染前会逐个核对文件是否存在，不存在的直接跳过，所以这里写错了不会产生死链
 * （但构建时会在终端给出提示，方便修）。
 */

export type LabLink = {
  /** 展示用的标题 */
  title: string;
  /** 相对 public/lab/frontend/ 的路径；以 / 结尾表示目录，会补 index.html */
  to: string;
  /** 一句话说明，可选 */
  note?: string;
};

export type LabGroup = {
  name: string;
  note?: string;
  /** compact = 紧凑链接网格（适合大量小练习），默认是带说明的列表 */
  layout?: 'compact';
  items: LabLink[];
};

/** 独立项目，指向站外或者站内其它页面 */
export const frontendProjects: LabLink[] = [
  {
    title: '我的第一个单页应用',
    to: 'https://huangpuyuan.github.io/app_angularJS/dist/',
    note: '基于 AngularJS 的移动端招聘应用'
  },
  {
    title: '极客精神——试试 Angular4 开发',
    to: 'https://huangpuyuan.github.io/Angular2Action/dist/',
    note: '用 Angular 2（4）写的一个简单页面'
  },
  {
    title: '我的任务清单',
    to: '/lab/todo/',
    note: '当年是 jQuery 写的，已经用原生 JS 重写，样式也换成现在这套'
  },
  {
    title: '简易版 CMS',
    to: 'https://huangpuyuan.github.io/learningbootstrap/cms/',
    note: '用 Bootstrap 快速搭的后台'
  },
  {
    title: 'Bootstrap 案例入门',
    to: 'https://huangpuyuan.github.io/learningbootstrap/example/',
    note: '照着 Bootstrap 官方模板练手'
  }
];

/** 本地练习，按门类分组 */
export const frontendGroups: LabGroup[] = [
  {
    name: '练习',
    note: '跟着课程做的三个综合练习，都是原生实现。',
    items: [
      { title: 'CSS3 图片滑动', to: 'exercises/CSS3_Slides/', note: '纯 CSS3 的滑动特效' },
      {
        title: '二级联动菜单 + 轮播图',
        to: 'exercises/exercise2/',
        note: '原生 JS 写的数据联动与全屏轮播'
      },
      { title: '炫酷 H5 页面', to: 'exercises/exercise3/', note: '从设计稿到完整案例' }
    ]
  },
  {
    name: '作业',
    note: '那阵子上课留的作业，从静态页写到手写轮播。',
    items: [
      { title: 'H5 静态页', to: 'homeworks/homework1/', note: '第一个完整的响应式页面' },
      { title: 'CSS 作图 · 蓝天白云', to: 'homeworks/homework2/蓝天白云.html' },
      { title: 'CSS 动画 · 漂浮的白云', to: 'homeworks/homework3/', note: '加了小白兔' },
      { title: '您的生日是出生那年的第几天？', to: 'homeworks/homework4/', note: '日期计算练习' },
      { title: '动态轮播图', to: 'homeworks/homework5/', note: '原生 JS 手写' },
      { title: '炫酷 H5 页面（作业版）', to: 'homeworks/homework6/', note: '综合案例' },
      { title: '商城主页', to: 'homeworks/homework7/', note: '响应式布局练习' }
    ]
  },
  {
    name: 'CSS 绘图',
    note: '读《CSS 揭秘》时照着做的，全部用 CSS 画出来，没有图片。',
    layout: 'compact',
    items: [
      { title: '五星红旗', to: 'css-plotting/the Five-Starred Red Flag.html' },
      { title: '蓝天白云', to: 'css-plotting/蓝天白云.html' },
      { title: '水平条纹', to: 'css-plotting/background/stripes.html' },
      { title: '垂直条纹', to: 'css-plotting/background/vertiacal-stripes.html' },
      { title: '斜向条纹', to: 'css-plotting/background/diagonal-stripes.html' },
      { title: '60 度斜向条纹', to: 'css-plotting/background/diagonal-stripes-60deg.html' },
      { title: '蓝图网格', to: 'css-plotting/background/blueprint.html' },
      { title: '细密条纹', to: 'css-plotting/background/subtle-stipes.html' },
      { title: '背景定位', to: 'css-plotting/background/background-position.html' },
      { title: '边框内圆角', to: 'css-plotting/borders/inner-rounding.html' },
      { title: '多重边框', to: 'css-plotting/borders/mutiple-borders.html' },
      { title: '半透明边框', to: 'css-plotting/borders/translucent-borders.html' },
      { title: '切角', to: 'css-plotting/bevel-corners/bevel-corners.html' },
      { title: '切角 · clip-path', to: 'css-plotting/bevel-corners/bevel-corners-clipped.html' },
      { title: '切角 · SVG', to: 'css-plotting/bevel-corners/bevel-cornersSVG.html' },
      { title: '弧形切角', to: 'css-plotting/bevel-corners/scoop-corners.html' },
      { title: '椭圆', to: 'css-plotting/ellipse/css3-ellipse.html' },
      { title: '半椭圆', to: 'css-plotting/ellipse/half-ellipse.html' },
      { title: '四分之一椭圆', to: 'css-plotting/ellipse/quaeter-ellipse.html' },
      { title: '菱形图片', to: 'css-plotting/diamond-images/diamond-images.html' },
      { title: '平行四边形', to: 'css-plotting/parellelogram/parallelograms.html' },
      { title: '平行四边形 · 伪元素', to: 'css-plotting/parellelogram/parallelograms-pesudo.html' },
      { title: '梯形', to: 'css-plotting/trapezoidTabs/Trapezoid.html' },
      { title: '梯形标签页', to: 'css-plotting/trapezoidTabs/trapezoid-tabs.html' }
    ]
  },
  {
    name: 'JavaScript',
    note: '从基础语法到数组方法、正则、面向对象。',
    layout: 'compact',
    items: [
      { title: 'let 与 const', to: 'elegentJs/let&const/usinglet.html' },
      { title: 'Map', to: 'elegentJs/usingmap.html' },
      { title: '面向对象', to: 'elegentJs/oop/index.html' },
      { title: '正则表达式', to: 'elegentJs/regExp/regExp.html' },
      { title: '优雅的 JS · 目录', to: 'elegentJs/index.html' },
      { title: 'ES6', to: 'es6/index.html' },
      { title: '表单组件的复用', to: 'demo/index.html' },
      { title: '早期 demo 列表', to: 'demo.html' }
    ]
  },
  {
    name: '慕课练习',
    note: '跟着慕课网课程敲的语法练习，一个知识点一个页面。',
    layout: 'compact',
    items: [
      { title: '猜数字', to: 'immoc/GuessingNumber.html' },
      { title: '九九乘法表', to: 'immoc/for-99tables.html' },
      { title: 'while 循环', to: 'immoc/while.html' },
      { title: 'break 与 continue', to: 'immoc/break&continue.html' },
      { title: '函数', to: 'immoc/fun-Demo.html' },
      { title: '数组', to: 'immoc/array/array.html' },
      { title: '日期', to: 'immoc/Date/date.html' },
      { title: '字符串练习', to: 'immoc/string/index.html' },
      { title: '驼峰命名', to: 'immoc/string/camel-case.html' },
      { title: '邮箱格式校验', to: 'immoc/string/formatEmail.html' },
      { title: '大小写转换', to: 'immoc/string/toUpperCase.html' },
      { title: 'Math.random()', to: 'immoc/string/Math.html' },
      { title: '随机数', to: 'immoc/string/random.html' },
      { title: '选择器', to: 'immoc/dom/Selector.html' },
      { title: '属性操作', to: 'immoc/dom/attr.html' },
      { title: '全选与反选', to: 'immoc/dom/event1.html' },
      { title: 'onchange 事件', to: 'immoc/dom/event2.html' },
      { title: '输入框', to: 'immoc/windowsObj/confirm.html' },
      { title: 'history', to: 'immoc/windowsObj/history.html' },
      { title: '前进与后退', to: 'immoc/windowsObj/index11.html' },
      { title: 'location', to: 'immoc/windowsObj/location.html' },
      { title: 'location 方法', to: 'immoc/windowsObj/location2.html' },
      { title: 'navigator', to: 'immoc/windowsObj/navigator.html' },
      { title: 'screen', to: 'immoc/windowsObj/screen.html' },
      { title: '闪烁的文字', to: 'immoc/windowsObj/setInterval.html' },
      { title: 'setTimeout', to: 'immoc/windowsObj/setTimeout.html' }
    ]
  }
];

/** 当年写在 GitHub issue 里的笔记，链接都还在 */
export const frontendNotes: LabLink[] = [
  {
    title: '使用 AngularJS 实现单页应用',
    to: 'https://github.com/huangpuyuan/app_angularJS/issues/1',
    note: '怎么从零做一个完整单页应用'
  },
  {
    title: 'Native APP / Web APP / Hybrid APP',
    to: 'https://github.com/huangpuyuan/app_angularJS/issues/2',
    note: '三种形态的区别'
  },
  {
    title: '优雅的 JS —— JavaScript Without Loops',
    to: 'https://github.com/huangpuyuan/myExercises-FrontEnd/issues/1',
    note: '用数组的高级方法替代循环'
  },
  {
    title: 'CSS 实现切角效果',
    to: 'https://github.com/huangpuyuan/myExercises-FrontEnd/issues/2',
    note: '《CSS 揭秘》读书笔记'
  },
  {
    title: '前端前沿 —— TypeScript 与 Angular 2',
    to: 'https://github.com/huangpuyuan/myExercises-FrontEnd/issues/3',
    note: '2016 年前端大会的一些展望'
  },
  {
    title: '使用 Angular 2',
    to: 'https://github.com/huangpuyuan/Angular2Action/issues/1',
    note: '开发单页应用时的注意点'
  },
  {
    title: 'RESTful API',
    to: 'https://github.com/huangpuyuan/restfulAPI/issues/1',
    note: '和服务端通讯的接口设计'
  }
];

/** 本地 Markdown 笔记 */
export const frontendDocs: LabLink[] = [
  { title: '前端开发流程', to: 'pictureOfMind/前端开发流程.png' },
  { title: '高级前端笔记', to: 'studyNotes/advancedfrontEnd.md' },
  { title: 'CSS 技巧笔记', to: 'studyNotes/cssSkill.MD' }
];
